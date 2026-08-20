#!/usr/bin/env bash

# Exit on error
set -e

echo "====================================================="
echo "   🚀 SpaceReach Automated Deployment Setup Script  "
echo "====================================================="

# Check PHP version
if ! command -v php &> /dev/null; then
    echo "❌ Error: PHP is not installed or not in PATH."
    exit 1
fi

echo "✔ PHP detected: $(php -v | head -n 1)"

# Check Composer
if command -v composer &> /dev/null; then
    echo "📦 Installing Composer dependencies..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
else
    echo "⚠️ Warning: Composer command not found. Assuming vendor directory is present."
fi

# Ensure storage & bootstrap/cache permissions
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

# Check .env file
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "📄 Copying .env.example to .env..."
        cp .env.example .env
    fi
fi

# Run Artisan installation command
php artisan app:install "$@"
