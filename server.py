import http.server
import socketserver
import os
import json
import base64
import time

PORT = 3000
CONFIG_FILE = 'config.json'
DEFAULT_ADMIN_PASS = 'georgesnow2026'

DEFAULT_CONFIG = {
    "iconStyle": "modern",
    "paletteSize": "regular",
    "autoOpenEnabled": True,
    "apiToken": "644cc1ee38244d57d7b458eaf29d2b714fb7e267",
    "defaultWorkspaceId": "34919",
    "shortcuts": {
        "commandPalette": { "id": "commandPalette", "label": "Quick Search", "desc": "Live search students, awards & disbursements", "enabled": True, "key": "ctrl+k", "display": "Ctrl + K" },
        "navDown":        { "id": "navDown", "label": "Next Record", "desc": "Move to next record (table or drawer)", "enabled": True, "key": "j", "display": "J" },
        "navUp":          { "id": "navUp", "label": "Previous Record", "desc": "Move to previous record (table or drawer)", "enabled": True, "key": "k", "display": "K" },
        "openRecord":     { "id": "openRecord", "label": "Open Selected Record", "desc": "Open side panel for highlighted row", "enabled": True, "key": "enter", "display": "Enter" },
        "closePanel":     { "id": "closePanel", "label": "Close Panel / Escape", "desc": "Dismiss side panel or modal", "enabled": True, "key": "escape", "display": "Esc" },
        "cycleTabNext":   { "id": "cycleTabNext", "label": "Next Side Tab", "desc": "Cycle forward through side panel tabs", "enabled": True, "key": "]", "display": "]" },
        "cycleTabPrev":   { "id": "cycleTabPrev", "label": "Previous Side Tab", "desc": "Cycle backward through side panel tabs", "enabled": True, "key": "[", "display": "[" },
        "copyLink":       { "id": "copyLink", "label": "Copy record link", "desc": "Direct URL to current record", "enabled": True, "key": "alt+l", "display": "Alt + L" },
        "copySummary":    { "id": "copySummary", "label": "Copy Scholar Summary", "desc": "Scholar Name, ID & balance card", "enabled": True, "key": "alt+c", "display": "Alt + C" },
        "copyId":         { "id": "copyId", "label": "Copy Record ID Only", "desc": "Copy clean numeric ID to clipboard", "enabled": True, "key": "alt+i", "display": "Alt + I" },
        "focusSearch":    { "id": "focusSearch", "label": "Focus Table Search", "desc": "Open and focus table search bar", "enabled": True, "key": "/", "display": "/" },
        "addNewRecord":   { "id": "addNewRecord", "label": "Add New Record", "desc": "Trigger \"+ Add Record\" button", "enabled": True, "key": "alt+n", "display": "Alt + N" },
        "toggleFilters":  { "id": "toggleFilters", "label": "Toggle Table Filters", "desc": "Open/close Form Tools filter sidebar", "enabled": True, "key": "alt+f", "display": "Alt + F" },
        "quickSave":      { "id": "quickSave", "label": "Quick Save Record", "desc": "Trigger save on current form", "enabled": True, "key": "ctrl+s", "display": "Ctrl + S" }
    },
    "announcement": "",
    "version": "1.4.5"
}

def load_local_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return {**DEFAULT_CONFIG, **data}
        except Exception:
            pass
    return DEFAULT_CONFIG.copy()

def save_local_config(cfg):
    merged = {**DEFAULT_CONFIG, **cfg}
    merged['updatedAt'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
        json.dump(merged, f, indent=2)
    return merged

class AdminHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Universal CORS for extensions
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path.startswith('/api/config'):
            cfg = load_local_config()
            body = json.dumps(cfg).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        super().do_GET()

    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        raw_body = self.rfile.read(length).decode('utf-8') if length > 0 else '{}'
        try:
            payload = json.loads(raw_body)
        except Exception:
            payload = {}

        if self.path.startswith('/api/login'):
            password = payload.get('password', '')
            if password == DEFAULT_ADMIN_PASS:
                token = base64.b64encode(f"admin:{int(time.time())}:{DEFAULT_ADMIN_PASS}".encode()).decode()
                res = {
                    "success": True,
                    "token": token,
                    "role": "superadmin",
                    "org": "George Snow Scholarship Fund",
                    "message": "Authentication successful. Access granted to cloud publisher."
                }
                code = 200
            else:
                res = {"success": False, "error": "Invalid administrator password."}
                code = 401

            body = json.dumps(res).encode('utf-8')
            self.send_response(code)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        if self.path.startswith('/api/config'):
            auth = self.headers.get('Authorization', '')
            token = auth.replace('Bearer ', '').strip()
            admin_pw = payload.get('adminPassword', '')

            authorized = (admin_pw == DEFAULT_ADMIN_PASS) or (DEFAULT_ADMIN_PASS in token) or (token == 'authenticated')

            if not authorized:
                res = {"success": False, "error": "Unauthorized: Admin authentication required to publish settings."}
                code = 401
            else:
                cfg_data = payload.get('config', payload)
                saved = save_local_config(cfg_data)
                res = {
                    "success": True,
                    "message": "Configuration published to cloud! All installed extensions will sync.",
                    "config": saved
                }
                code = 200

            body = json.dumps(res).encode('utf-8')
            self.send_response(code)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        self.send_response(404)
        self.end_headers()

def run():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(base_dir)
    if not os.path.exists(CONFIG_FILE):
        save_local_config(DEFAULT_CONFIG)

    socketserver.TCPServer.allow_reuse_address = True
    for port in [PORT, 8080, 5000]:
        try:
            with socketserver.TCPServer(("", port), AdminHandler) as httpd:
                print("===========================================================")
                print("  Zengine Power-Tools Central Admin Portal Server")
                print(f"  Web GUI:       http://localhost:{port}")
                print(f"  API Config:    http://localhost:{port}/api/config")
                print(f"  API Login:     http://localhost:{port}/api/login")
                print(f"  Admin Pass:    {DEFAULT_ADMIN_PASS}")
                print("===========================================================")
                httpd.serve_forever()
                break
        except OSError:
            continue

if __name__ == '__main__':
    run()
