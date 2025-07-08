#!/bin/bash

# Build script for Multisynq documentation using Mintlify
# This script builds the static documentation files

echo "🚀 Building Multisynq documentation with Mintlify..."

# Ensure we're in the docs directory
if [ ! -f "docs.json" ]; then
    echo "❌ Error: docs.json not found. Please run this script from the docs directory."
    exit 1
fi

# Install Mintlify CLI if not already installed
if ! command -v mintlify &> /dev/null; then
    echo "📦 Installing Mintlify CLI..."
    npm install -g mintlify
fi

# Clean previous build artifacts
echo "🧹 Cleaning previous builds..."
rm -rf .mintlify
rm -rf _site

# Build the documentation
echo "🔨 Building static documentation..."
mintlify build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Documentation build completed successfully!"
    echo "📁 Static files are ready in the _site directory"
else
    echo "❌ Documentation build failed!"
    exit 1
fi

# If we're in production mode, copy to frontend public directory
if [ "$NODE_ENV" = "production" ] || [ "$1" = "--deploy" ]; then
    echo "🚀 Deploying to frontend..."
    
    # Check if frontend directory exists
    if [ -d "../multisynq.io/multisynq/frontend/public" ]; then
        rm -rf ../multisynq.io/multisynq/frontend/public/docs
        mkdir -p ../multisynq.io/multisynq/frontend/public/docs
        
        if [ -d "_site" ]; then
            cp -r _site/* ../multisynq.io/multisynq/frontend/public/docs/
            echo "✅ Documentation deployed to frontend!"
        else
            echo "❌ Error: _site directory not found. Build may have failed."
            exit 1
        fi
    else
        echo "⚠️  Frontend directory not found. Static files are available in _site/"
    fi
fi

echo "🎉 Documentation build process complete!"
echo "💡 To serve locally: mintlify dev"
echo "🌐 To deploy: run with --deploy flag" 