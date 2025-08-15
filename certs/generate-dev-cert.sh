#!/usr/bin/env bash
set -e

CERTS_DIR="certs"
KEY_FILE="$CERTS_DIR/dev-key.pem"
CERT_FILE="$CERTS_DIR/dev-cert.pem"

mkdir -p "$CERTS_DIR"

echo "🔐 Generando certificado autofirmado de desarrollo..."
openssl req \
  -x509 \
  -newkey rsa:4096 \
  -sha256 \
  -days 365 \
  -nodes \
  -keyout "$KEY_FILE" \
  -out "$CERT_FILE" \
  -subj "/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

echo "✅ Certificado generado:"
echo "  Clave privada: $KEY_FILE"
echo "  Certificado:   $CERT_FILE"
