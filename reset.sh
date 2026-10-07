#!/bin/bash
set -e

echo "=========================================="
echo "Resetting Leaf Classifier Deployment"
echo "=========================================="

# Stop and remove all containers
echo ""
echo "Stopping and removing containers..."
sudo docker compose -f docker-compose.prod.yml down

# Ask if user wants to remove volumes (this will delete database data)
echo ""
read -p "Do you want to remove volumes (this will DELETE database data)? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Removing volumes..."
    sudo docker compose -f docker-compose.prod.yml down -v
    echo "Volumes removed."
else
    echo "Keeping volumes (database data preserved)."
fi

# Ask if user wants to remove images
echo ""
read -p "Do you want to remove built images? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Removing images..."
    sudo docker compose -f docker-compose.prod.yml down --rmi all
    echo "Images removed."
else
    echo "Keeping images."
fi

# Ask if user wants to remove SSL certificates
echo ""
read -p "Do you want to remove SSL certificates? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Removing SSL certificates..."
    sudo rm -rf certbot/conf/*
    echo "SSL certificates removed."
else
    echo "Keeping SSL certificates."
fi

echo ""
echo "=========================================="
echo "Reset complete!"
echo ""
echo "To redeploy, run:"
echo "  ./deploy.sh"
echo "=========================================="

