#!/bin/bash
set -e

echo '?? CarRent AI — VPS Setup Script'
echo '================================='

# Update system
apt-get update && apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker \

# Install Docker Compose
apt-get install -y docker-compose-plugin

# Install useful tools
apt-get install -y git curl ufw fail2ban

# Configure firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80
ufw allow 443
ufw --force enable

# Configure fail2ban (blocks brute force)
systemctl enable fail2ban
systemctl start fail2ban

# Create app directory
mkdir -p /opt/carrent
cd /opt/carrent

echo '? Server setup complete!'
echo ''
echo 'Next steps:'
echo '  1. Upload your project: scp -r . root@YOUR_IP:/opt/carrent/'
echo '  2. Edit .env.prod with real values'
echo '  3. Run: bash infrastructure/deploy.sh'
