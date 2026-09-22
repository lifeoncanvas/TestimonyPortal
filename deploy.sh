#!/bin/bash
# Deployment script for Testimony Portal on testimonyportal.com

echo "=== Deploying Testimony Portal ==="

# 1. Target directory for web server
WEB_DIR="/usr/share/nginx/html"

# If deploy.zip exists in /tmp/
if [ -f "/tmp/deploy.zip" ]; then
    echo "Found /tmp/deploy.zip. Unzipping to $WEB_DIR..."
    sudo unzip -o /tmp/deploy.zip -d $WEB_DIR/
    sudo chown -R www-data:www-data $WEB_DIR/
    echo "Files extracted successfully."
else
    echo "Error: /tmp/deploy.zip not found. Please upload deploy.zip to /tmp/ first."
    exit 1
fi

# 2. Reload Nginx or restart service
if command -v systemctl &> /dev/null; then
    echo "Reloading Nginx web server..."
    sudo systemctl reload nginx
fi

echo "=== Deployment Complete ==="
echo "Access your app at: https://testimonyportal.com/login"
