MAX_BODY = 25 * 1024 * 1024


class MultipartError(Exception):
    pass


def parse(body: bytes, content_type: str) -> dict:
    if len(body) > MAX_BODY:
        raise MultipartError('Upload is too large (limit 20 MB per file).')
    if 'multipart/form-data' not in (content_type or ''):
        raise MultipartError('Expected multipart form data.')
    boundary = None
    for part in content_type.split(';'):
        part = part.strip()
        if part.startswith('boundary='):
            boundary = part.split('=', 1)[1].strip('"')
    if not boundary:
        raise MultipartError('Missing multipart boundary.')
    delim = ('--' + boundary).encode()
    fields = {}
    for chunk in body.split(delim):
        chunk = chunk.strip(b'\r\n')
        if not chunk or chunk == b'--':
            continue
        if b'\r\n\r\n' not in chunk:
            continue
        raw_headers, data = chunk.split(b'\r\n\r\n', 1)
        name = filename = ctype = None
        for line in raw_headers.decode('utf-8', 'replace').split('\r\n'):
            if line.lower().startswith('content-disposition:'):
                for attr in line.split(';')[1:]:
                    attr = attr.strip()
                    if attr.startswith('name='):
                        name = attr.split('=', 1)[1].strip('"')
                    elif attr.startswith('filename='):
                        filename = attr.split('=', 1)[1].strip('"')
            elif line.lower().startswith('content-type:'):
                ctype = line.split(':', 1)[1].strip()
        if not name:
            continue
        fields.setdefault(name, []).append({
            'filename': filename,
            'content_type': ctype,
            'data': data,
        })
    return fields
