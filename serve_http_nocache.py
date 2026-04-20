#!/usr/bin/env python3
"""
Static HTTP server with Cache-Control: no-store for HTML/JS/CSS so local edits
show up without hard refresh (python -m http.server caches aggressively in some browsers).
"""
from __future__ import annotations

import argparse
import http.server
import os
import sys
from pathlib import Path


class NoCacheRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self) -> None:
        path_only = self.path.split("?", 1)[0]
        name = path_only.rsplit("/", 1)[-1].lower()
        if name.endswith((".html", ".htm", ".js", ".css", ".mjs", ".json")):
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
            self.send_header("Pragma", "no-cache")
        super().end_headers()


def main() -> None:
    parser = argparse.ArgumentParser(description="HTTP static server with no-cache for dev assets")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument(
        "--bind",
        default="0.0.0.0",
        help="Listen address (default all interfaces)",
    )
    args = parser.parse_args()

    root = Path(__file__).resolve().parent
    os.chdir(root)

    httpd = http.server.HTTPServer((args.bind, args.port), NoCacheRequestHandler)
    httpd.allow_reuse_address = True

    host = args.bind
    if host in ("0.0.0.0", "::"):
        host = "127.0.0.1"

    print("Serving (no-cache for .html/.js/.css):", root)
    print("Open:    http://127.0.0.1:{}/graphing-calculator.html".format(args.port))
    print("         http://desmos.com:{}/graphing-calculator.html  (needs hosts entry)".format(args.port))
    print("")
    print("If the log shows 'Bad request version' + binary junk, the browser is using HTTPS")
    print("against this HTTP server. Use http:// or run with desmos.com.pem (see start-local-server.sh).")
    print("")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print()
        sys.exit(0)


if __name__ == "__main__":
    main()
