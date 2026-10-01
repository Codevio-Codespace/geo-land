import hashlib
import hmac
import os
import secrets
import time
from datetime import datetime, timedelta, timezone

from . import db

ROOT = db.ROOT
SECRET_PATH = os.path.join(db.DATA_DIR, 'secret.key')
ITERATIONS = 200_000
SESSION_DAYS = 30
_failures = {}


def secret():
    os.makedirs(db.DATA_DIR, exist_ok=True)
    if not os.path.exists(SECRET_PATH):
        with open(SECRET_PATH, 'w', encoding='ascii') as f:
            f.write(secrets.token_hex(32))
    with open(SECRET_PATH, 'r', encoding='ascii') as f:
        return f.read().strip()


def hash_password(pw):
    salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac('sha256', pw.encode(), bytes.fromhex(salt), ITERATIONS)
    return f'pbkdf2${ITERATIONS}${salt}${dk.hex()}'


def verify_password(pw, stored):
    try:
        _, iters, salt, hexhash = stored.split('$')
        dk = hashlib.pbkdf2_hmac('sha256', pw.encode(), bytes.fromhex(salt), int(iters))
        return hmac.compare_digest(dk.hex(), hexhash)
    except (ValueError, TypeError):
        return False


def has_user():
    return db.one('SELECT COUNT(*) c FROM users')['c'] > 0


def create_user(username, pw):
    if has_user():
        return False, 'An administrator account already exists.'
    username = (username or '').strip()
    if len(username) < 3 or len(username) > 40:
        return False, 'Username must be 3–40 characters.'
    if len(pw or '') < 10:
        return False, 'Password must be at least 10 characters.'
    db.execute('INSERT INTO users (username, pw_hash, created_at) VALUES (?,?,?)',
               (username, hash_password(pw), db.now()))
    return True, None


def login(username, pw):
    row = db.one('SELECT * FROM users WHERE username = ?', (username,))
    if not row or not verify_password(pw or '', row['pw_hash']):
        return None
    sid = secrets.token_hex(24)
    expires = (datetime.now(timezone.utc) + timedelta(days=SESSION_DAYS)).strftime('%Y-%m-%d %H:%M:%S')
    db.execute('INSERT INTO sessions (sid, username, expires_at) VALUES (?,?,?)',
               (sid, row['username'], expires))
    return sid


def logout(sid):
    if sid:
        db.execute('DELETE FROM sessions WHERE sid = ?', (sid,))


def cookie_value(sid):
    exp = int((datetime.now(timezone.utc) + timedelta(days=SESSION_DAYS)).timestamp())
    payload = f'{sid}.{exp}'
    sig = hmac.new(secret().encode(), payload.encode(), hashlib.sha256).hexdigest()[:32]
    return f'{payload}.{sig}'


def _parse_cookie(raw):
    sid = exp = sig = None
    value = raw.split('=', 1)[1] if '=' in raw else ''
    parts = value.split('.')
    if len(parts) == 3:
        sid, exp, sig = parts
    return sid, exp, sig


def current_user(cookie_header):
    if not cookie_header:
        return None
    for raw in cookie_header.split(';'):
        raw = raw.strip()
        if raw.startswith('gl_admin='):
            sid, exp, sig = _parse_cookie(raw)
            if not sid:
                return None
            payload = f'{sid}.{exp}'
            expected = hmac.new(secret().encode(), payload.encode(), hashlib.sha256).hexdigest()[:32]
            if not hmac.compare_digest(expected, sig or ''):
                return None
            try:
                if int(exp) < time.time():
                    return None
            except (TypeError, ValueError):
                return None
            row = db.one('SELECT username, expires_at FROM sessions WHERE sid = ?', (sid,))
            if row and row['expires_at'] > db.now():
                return row['username']
            return None
    return None


def sid_from_cookie(cookie_header):
    if not cookie_header:
        return None
    for raw in cookie_header.split(';'):
        raw = raw.strip()
        if raw.startswith('gl_admin='):
            sid, _, _ = _parse_cookie(raw)
            return sid if current_user(cookie_header) else None
    return None


def csrf_token(sid):
    return hmac.new(secret().encode(), f'csrf:{sid}'.encode(), hashlib.sha256).hexdigest()


def check_csrf(sid, token):
    if not sid or not token:
        return False
    return hmac.compare_digest(csrf_token(sid), token)


def rate_limited(ip):
    cutoff = time.time() - 600
    bucket = [t for t in _failures.get(ip, []) if t > cutoff]
    _failures[ip] = bucket
    return len(bucket) >= 8


def record_failure(ip):
    _failures.setdefault(ip, []).append(time.time())
