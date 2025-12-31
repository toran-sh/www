#!/bin/bash
# Build script for Cloudflare Pages

# Install root dependencies
npm install

# Install Functions dependencies
cd functions
npm install
cd ..

# Build the app
npm run build
