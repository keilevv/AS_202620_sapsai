#!/bin/sh
set -e

DOMAIN="${DOMAIN:-plantai.lab.utb.edu.co}"
CERT_PATH="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
KEY_PATH="/etc/letsencrypt/live/${DOMAIN}/privkey.pem"

# Prepare nginx conf dir (writable)
mkdir -p /etc/nginx/conf.d

# Choose config based on cert presence and substitute DOMAIN variable
if [ -f "$CERT_PATH" ] && [ -f "$KEY_PATH" ]; then
  envsubst '$$DOMAIN' < /nginx-templates/nginx.conf > /etc/nginx/conf.d/default.conf
else
  envsubst '$$DOMAIN' < /nginx-templates/nginx.temp.conf > /etc/nginx/conf.d/default.conf
fi

# Start nginx
nginx -g 'daemon on;'

# Background watcher: when cert appears or changes, switch to SSL config and reload
LAST_ETAG=""
while :; do
  if [ -f "$CERT_PATH" ] && [ -f "$KEY_PATH" ]; then
    ETAG=$(stat -c %Y "$CERT_PATH" 2>/dev/null || echo 0)
    if [ "$ETAG" != "$LAST_ETAG" ]; then
      # Ensure SSL config is in place with domain substitution
      envsubst '$$DOMAIN' < /nginx-templates/nginx.conf > /etc/nginx/conf.d/default.conf 2>/dev/null || true
      nginx -s reload || true
      LAST_ETAG="$ETAG"
    fi
  fi
  sleep 60
done
