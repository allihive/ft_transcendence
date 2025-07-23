#!/bin/sh

CERT_DIR=/etc/ssl/certs

# Only generate if not exists
if [ ! -f "$CERT_DIR/cert.pem" ] || [ ! -f "$CERT_DIR/key.pem" ]; then
	echo "Generating SSL certificate..."
	mkdir -p "$CERT_DIR"
	openssl req -x509 -newkey rsa:2048 -nodes -days 365 \
		-keyout "$CERT_DIR/key.pem" \
		-out "$CERT_DIR/cert.pem" \
		-subj "/C=FI/ST=Uusima/L=Helsinki/O=Hive Helsinki/CN=localhost"
else
	echo "SSL cert already exists"
fi

npm run migration:reset
npm run build

# Continue to default CMD
exec "$@"