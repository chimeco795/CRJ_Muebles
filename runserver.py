from http.server import SimpleHTTPRequestHandler
from socketserver import TCPServer

PORT = 8000

class Handler(SimpleHTTPRequestHandler):
    pass  # sirve los archivos tal cual de la carpeta

with TCPServer(("", PORT), Handler) as httpd:
    print(f"Sirviendo en http://127.0.0.1:{PORT}")
    httpd.serve_forever()
