#!/bin/bash

# Exit on error
set -e

echo "Building WebSocket server Docker image..."
docker build -f Dockerfile.Websocket -t leader-viewer-websocket:latest .
echo "Docker image built successfully!"
