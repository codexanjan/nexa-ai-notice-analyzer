import urllib.request
import json

url = 'http://127.0.0.1:8000/api/notices/upload'
boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'

with open('sample_notice.jpg', 'rb') as f:
    content = f.read()

body = (
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name=" file\; filename=\sample_notice.jpg\\r\n'
 f'Content-Type: image/jpeg\r\n\r\n'
).encode('utf-8') + content + f'\r\n--{boundary}--\r\n'.encode('utf-8')

req = urllib.request.Request(url, data=body, headers={
 'Content-Type': f'multipart/form-data; boundary={boundary}'
})

try:
 with urllib.request.urlopen(req) as resp:
 print('Status:', resp.status)
 data = json.loads(resp.read().decode('utf-8'))
 print('Filename:', data.get('filename'))
 print('Extracted length:', len(data.get('extracted_text', '')))
 print('Category:', data.get('analysis', {}).get('category'))
 print('Importance:', data.get('analysis', {}).get('importance'))
 print('Entities:', data.get('analysis', {}).get('entities'))
except Exception as e:
 print('Error:', e)
