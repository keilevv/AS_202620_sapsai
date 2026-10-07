#!/bin/bash
set -e

# Load environment variables
if [ ! -f .env ]; then
    echo "Error: .env file not found in the project root"
    exit 1
fi

source .env

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "Error: DOMAIN and EMAIL must be set in .env file"
    exit 1
fi

echo "=========================================="
echo "Deploying Leaf Classifier Application"
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo "=========================================="

# Create certbot directories if they don't exist
mkdir -p certbot/conf certbot/www

# Build and start all services (without certbot_init)
echo ""
echo "Building and starting services..."
sudo docker compose -f docker-compose.prod.yml up -d --build

# Wait for frontend to be ready
echo ""
echo "Waiting for frontend to be ready..."
sleep 10

# Check if certificate already exists
CERT_PATH="./certbot/conf/live/$DOMAIN/fullchain.pem"
if [ -f "$CERT_PATH" ]; then
    echo ""
    echo "SSL certificate already exists. Skipping certificate generation."
    echo "If you need to regenerate, delete: $CERT_PATH"
else
    echo ""
    echo "Requesting SSL certificate from Let's Encrypt..."
    sudo docker compose -f docker-compose.prod.yml --profile init run --rm certbot_init
    
    # Wait a moment for certificates to be written
    sleep 5
    
    # Reload nginx to pick up SSL configuration
    echo ""
    echo "Reloading nginx to enable SSL..."
    sudo docker compose -f docker-compose.prod.yml exec frontend nginx -s reload || true
fi

echo ""
echo "=========================================="
echo "Deployment complete!"
echo ""
echo "Your application is now available at:"
echo "  Frontend: https://$DOMAIN"
echo "  API: https://$DOMAIN/api/v1"
echo ""
echo "To view logs:"
echo "  sudo docker compose -f docker-compose.prod.yml logs -f"
echo ""
echo "To check certificate status:"
echo "  sudo docker compose -f docker-compose.prod.yml logs certbot"
echo "=========================================="

