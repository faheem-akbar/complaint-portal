#!/usr/bin/env python3
"""Simple HTTP server for serving the frontend"""

import http.server
import socketserver
import os
from pathlib import Path

# Change to project directory
os.chdir(Path(__file__).parent)

PORT = 8001
Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"\nFrontend server running at: http://127.0.0.1:{PORT}")
    print(f"Backend server running at: http://127.0.0.1:8000\n")
    print("Press Ctrl+C to stop the server")
    httpd.serve_forever()
