#!/usr/bin/env python3
"""Static HTTPS server so https://desmos.com:PORT works with mkcert-trusted certs."""
from __future__ import annotations

import argparse
import http.server
import os
import ssl
import sys
from pathlib import Path

from serve_http_nocache import NoCacheRequestHandler


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--cert", default="desmos.com.pem", help="Path to PEM certificate (mkcert output)")
    parser.add_argument("--key", default="desmos.com-key.pem", help="Path to PEM private key")
    args = parser.parse_args()

    root = Path(__file__).resolve().parent
    os.chdir(root)

    cert = root / args.cert
    key = root / args.key
    if not cert.is_file() or not key.is_file():
        print("Missing TLS files:", cert if not cert.is_file() else key, file=sys.stderr)
        print("", file=sys.stderr)
        print("Create trusted certs for desmos.com (one-time):", file=sys.stderr)
        print("  brew install mkcert", file=sys.stderr)
        print("  mkcert -install", file=sys.stderr)
        print("  cd", root, file=sys.stderr)
        print("  mkcert desmos.com", file=sys.stderr)
        print("That writes desmos.com.pem and desmos.com-key.pem here.", file=sys.stderr)
        sys.exit(1)

    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain(str(cert), str(key))

    server = http.server.HTTPServer(("0.0.0.0", args.port), NoCacheRequestHandler)
    server.socket = context.wrap_socket(server.socket, server_side=True)

    print("Serving:", root)
    print("Open:    https://desmos.com:{}/graphing-calculator.html".format(args.port))
    print("Hosts:   127.0.0.1 desmos.com  (do not redirect www.desmos.com)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print()


if __name__ == "__main__":
    main()
