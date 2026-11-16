#!/bin/bash
set -e

PORT="${PORT:-8000}"
echo "🚀 Starting BitChest Backend on Render on port ${PORT}..."

# Configure Apache port based on Render dynamic $PORT
sed -i "s/Listen [0-9]*/Listen ${PORT}/g" /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*:[0-9]*>/<VirtualHost \*:${PORT}>/g" /etc/apache2/sites-available/*.conf

# Create necessary directories and set write permissions
mkdir -p /var/www/html/storage/framework/{sessions,views,cache} /var/www/html/storage/logs /var/www/html/bootstrap/cache /var/www/html/database
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/database
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/database

# If using SQLite and database file does not exist, initialize it
if [ "${DB_CONNECTION:-sqlite}" = "sqlite" ] && [ -z "$DATABASE_URL" ]; then
    if [ ! -f /var/www/html/database/database.sqlite ]; then
        touch /var/www/html/database/database.sqlite
        chown www-data:www-data /var/www/html/database/database.sqlite
        chmod 664 /var/www/html/database/database.sqlite
    fi
fi

# Ensure APP_KEY exists
if [ -z "$APP_KEY" ]; then
    echo "⚠️ APP_KEY is empty, generating application key..."
    php artisan key:generate --force
fi

# Run database migrations and seeding safely
echo "🗄️ Running migrations..."
php artisan migrate --force --seed || {
    echo "⚠️ Seeding already run or had conflict, running migrate --force..."
    php artisan migrate --force
}

# Clear any cached configuration so environment variables are refreshed
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Start Apache in foreground
echo "🌐 Starting Apache on port ${PORT}..."
exec apache2-foreground
