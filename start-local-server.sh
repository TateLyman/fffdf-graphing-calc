#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PORT="${PORT:-8765}"

echo "One-time hosts entry (if you have not already):"
echo "  sudo sh -c 'grep -q desmos.com /etc/hosts || echo \"127.0.0.1 desmos.com\" >> /etc/hosts'"
echo ""
echo "Do NOT map www.desmos.com to localhost — calculator.js loads from Desmos."
echo ""

if [[ -f desmos.com.pem && -f desmos.com-key.pem ]]; then
  echo "Using HTTPS (desmos.com.pem). Browsers force TLS for desmos.com; this avoids HTTP/400 garbage."
  echo ""
  exec python3 serve_https.py --port "$PORT"
fi

echo "No desmos.com.pem + desmos.com-key.pem found — falling back to plain HTTP."
echo "If the log shows 'Bad request version' and binary junk, Chrome is sending HTTPS to an HTTP server."
echo "Fix: install mkcert and certs, then re-run:"
echo "  brew install mkcert && mkcert -install && mkcert desmos.com"
echo "(run mkcert in this folder so the .pem files land here)"
echo ""
echo "Serving: $(pwd)"
echo "Try:    http://desmos.com:${PORT}/graphing-calculator.html"
echo "        http://127.0.0.1:${PORT}/graphing-calculator.html  (recommended; avoids HSTS issues)"
echo "API:    If the calculator is blank, try 127.0.0.1 or get a key at https://www.desmos.com/api/"
echo ""
exec python3 serve_http_nocache.py --port "$PORT"
