#!/bin/bash

echo "🔧 Fixing nginx upload limits..."

# Backup current nginx config
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup

# Add upload limits to nginx
sudo tee /etc/nginx/conf.d/upload-limits.conf > /dev/null <<EOF
# Allow large file uploads for video lessons
client_max_body_size 500M;
client_body_timeout 300s;
client_header_timeout 300s;
proxy_connect_timeout 300s;
proxy_send_timeout 300s;
proxy_read_timeout 300s;
client_body_buffer_size 256k;
EOF

# Test nginx config
echo "🧪 Testing nginx configuration..."
if sudo nginx -t; then
    echo "✅ Configuration valid, reloading nginx..."
    sudo systemctl reload nginx
    echo "✅ Nginx reloaded successfully!"
else
    echo "❌ Configuration invalid, restoring backup..."
    sudo rm /etc/nginx/conf.d/upload-limits.conf
    exit 1
fi

echo "✅ Upload limits fixed!"