#!/usr/bin/env python3
"""
Servidor HTTP simples para testar o quiz localmente
Execute com: python3 iniciar\ servidor.py
"""

import http.server
import socketserver
import os
import webbrowser
from threading import Timer

PORT = 8000

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Adicionar CORS headers para permitir requisições locais
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def log_message(self, format, *args):
        # Desabilitar logs de cada requisição para manter o terminal limpo
        pass

def open_browser():
    """Abrir o navegador automaticamente após iniciar o servidor"""
    webbrowser.open(f'http://localhost:{PORT}')

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    print(f"🚀 Iniciando servidor em http://localhost:{PORT}")
    print("Pressione Ctrl+C para parar o servidor")
    print("-" * 50)

    # Abrir navegador após 1 segundo
    Timer(1.0, open_browser).start()

    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"✅ Servidor rodando em http://localhost:{PORT}")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Servidor encerrado")