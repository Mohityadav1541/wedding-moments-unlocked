#!/bin/bash
echo "Initiating Swap Setup..."

# Try to create a 1GB swap file in /tmp (which is usually writable)
# We use 'dd' because 'fallocate' sometimes fails on certain file systems
dd if=/dev/zero of=/tmp/swapfile bs=1M count=1024 status=progress

# Set permissions
chmod 600 /tmp/swapfile

# Setup swap
mkswap /tmp/swapfile

# Enable swap (this might fail if container lacks privileges, but worth a try)
swapon /tmp/swapfile

if [ $? -eq 0 ]; then
    echo "✅ Swap enabled successfully!"
else
    echo "⚠️  Failed to enable swap (Permission Denied?). Continuing without it..."
fi

# Verify swap
free -h

# Start the application
echo "Starting Uvicorn..."
exec uvicorn main:app --host 0.0.0.0 --port $PORT
