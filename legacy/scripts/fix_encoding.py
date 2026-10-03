import sys

path = r'C:\Users\Admin\geoland-kosova\docs\plans\2026-10-01-geoland-kosova-website.md'
data = open(path, 'rb').read()
out = bytearray()
i = 0
n = len(data)
while i < n:
    b = data[i]
    if b < 0x80:
        out.append(b)
        i += 1
        continue
    decoded = False
    for length in (4, 3, 2):
        chunk = data[i:i + length]
        if len(chunk) < length:
            continue
        try:
            chunk.decode('utf-8')
            out.extend(chunk)
            i += length
            decoded = True
            break
        except UnicodeDecodeError:
            continue
    if not decoded:
        out.extend(bytes([b]).decode('cp1252').encode('utf-8'))
        i += 1

open(path, 'wb').write(bytes(out))
print('fixed bytes:', n, '->', len(out))
