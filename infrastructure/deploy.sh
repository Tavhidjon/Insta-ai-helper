#!/bin/bash
set -e

echo '?? Deploying CarRent AI...'

cd /opt/carrent

# Pull latest code (if using git)
# git pull origin main

# Get SSL certificate (first time only)
if [ ! -d 'infrastructure/certbot/conf/live' ]; then
    echo '?? Getting SSL certificate...'
    
    # Start nginx with HTTP only first
    docker compose -f docker-compose.prod.yml up -d nginx
    
    # Get certificate
    docker compose -f docker-compose.prod.yml run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email YOUR_EMAIL@gmail.com \
        --agree-tos \
        --no-eff-email \
        -d YOUR_DOMAIN.COM \
        -d www.YOUR_DOMAIN.COM
    
    docker compose -f docker-compose.prod.yml down
fi

# Build and start all services
echo '???  Building containers...'
docker compose -f docker-compose.prod.yml build --no-cache

echo '??  Starting services...'
docker compose -f docker-compose.prod.yml up -d

# Wait for DB to be ready
echo '? Waiting for database...'
sleep 15

# Run migrations
echo '???  Running migrations...'
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Create superuser if not exists
echo '?? Creating admin user...'
docker compose -f docker-compose.prod.yml exec backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='admin@carrent.com').exists():
    User.objects.create_superuser('admin@carrent.com', 'Admin1234!', role='admin')
    print('Admin created')
else:
    print('Admin already exists')
"

echo ''
echo '? Deployment complete!'
echo '?? Site: https://YOUR_DOMAIN.COM'
echo '?? Admin: https://YOUR_DOMAIN.COM/admin'
echo '?? Dashboard: https://YOUR_DOMAIN.COM/dashboard'
