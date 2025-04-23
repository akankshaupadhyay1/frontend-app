#!/bin/sh

# Exit immediately if a command fails
set -e

# Echo current action
echo "Setting BACKEND_URL..."

# Use the BACKEND_URL passed at runtime, or fallback to default
BACKEND_URL=${BACKEND_URL:-http://localhost:8000}

# Write it into public/config.js as JavaScript
echo "window.RUNTIME_CONFIG = { BACKEND_URL: \"$BACKEND_URL\" };" > /app/public/config.js

# Show the result (optional)
echo "Generated public/config.js with BACKEND_URL=$BACKEND_URL"

# Start the Next.js app
exec npm start


