#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# CareerNav EC2 Setup Script
# Run this ONCE after launching a fresh Ubuntu 22.04 EC2 t2.micro instance
# Usage: bash ec2-setup.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e  # Exit immediately on any error

echo "========================================"
echo "  CareerNav EC2 Setup Script"
echo "========================================"

# ── Step 1: Update system packages ─────────────────────────────────────────
echo ""
echo "[1/6] Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# ── Step 2: Install Docker ──────────────────────────────────────────────────
echo ""
echo "[2/6] Installing Docker..."
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# ── Step 3: Configure Docker permissions ────────────────────────────────────
echo ""
echo "[3/6] Configuring Docker permissions..."
sudo usermod -aG docker ubuntu
sudo systemctl enable docker
sudo systemctl start docker

# ── Step 4: Install docker-compose (v2) ─────────────────────────────────────
echo ""
echo "[4/6] Installing docker-compose..."
sudo curl -SL "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-linux-x86_64" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# ── Step 5: Install Nginx ────────────────────────────────────────────────────
echo ""
echo "[5/6] Installing Nginx (reverse proxy)..."
sudo apt-get install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# ── Step 6: Install Git ─────────────────────────────────────────────────────
echo ""
echo "[6/6] Installing Git..."
sudo apt-get install -y git

echo ""
echo "========================================"
echo "  Setup complete!"
echo ""
echo "  IMPORTANT: You must LOG OUT and LOG BACK IN"
echo "  for Docker permissions to take effect."
echo ""
echo "  Then run:"
echo "  git clone https://github.com/YOUR_USERNAME/CareerNav-1.git careernav"
echo "  cd careernav"
echo "  nano .env.production   # Set your environment variables"
echo "========================================"
