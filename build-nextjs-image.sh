#!/bin/bash

# Exit on error
set -e

echo "Building Docker image..."
docker build -f Dockerfile.Nextjs -t leader-viewer-image-sharer:latest .
echo "Docker image built successfully!"
