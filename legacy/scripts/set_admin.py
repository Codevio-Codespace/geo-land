"""Set (or replace) the administrator account.

Usage:
    python scripts/set_admin.py <username> <password>
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from cms import auth, db  # noqa: E402


def main():
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    username, password = sys.argv[1], sys.argv[2]
    db.init_schema()
    db.execute('DELETE FROM sessions')
    db.execute('DELETE FROM users')
    ok, error = auth.create_user(username, password)
    if not ok:
        print('error:', error)
        sys.exit(1)
    print(f'administrator set: {username}')


if __name__ == '__main__':
    main()
