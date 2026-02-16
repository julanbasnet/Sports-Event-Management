#!/usr/bin/env python3
"""Push to GitHub via CONNECT proxy with JWT auth."""
import socket, ssl, os, sys, re

def get_proxy_info():
    proxy_url = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    if not proxy_url:
        raise Exception("No HTTPS_PROXY set")
    m = re.match(r'http://([^:]+):([^@]+)@([^:]+):(\d+)', proxy_url)
    if not m:
        raise Exception("Cannot parse proxy URL")
    return m.group(1), m.group(2), m.group(3), int(m.group(4))

def git_push():
    user, token, host, port = get_proxy_info()
    
    # Connect to proxy
    sock = socket.create_connection((host, port))
    connect_req = f"CONNECT github.com:443 HTTP/1.1\r\nHost: github.com:443\r\nProxy-Authorization: Basic {__import__('base64').b64encode(f'{user}:{token}'.encode()).decode()}\r\n\r\n"
    sock.sendall(connect_req.encode())
    
    resp = b""
    while b"\r\n\r\n" not in resp:
        resp += sock.recv(4096)
    
    if b"200" not in resp.split(b"\r\n")[0]:
        print(f"CONNECT failed: {resp.decode()}")
        sys.exit(1)
    print("Tunnel established!")
    sock.close()
    
    # Use git with proxy
    env = os.environ.copy()
    result = os.system("cd /home/claude/Sports-Event-Management && git push origin main 2>&1")
    sys.exit(result >> 8)

if __name__ == "__main__":
    git_push()
