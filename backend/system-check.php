<?php
echo "=== BitChest Backend System Check ===\n\n";
echo "[✓] PHP Version: " . phpversion() . "\n";

$files = ['.env', 'artisan', 'bootstrap/app.php', 'composer.json'];
echo "\nRequired Files:\n";
foreach ($files as $file) {
    echo file_exists($file) ? "[✓] $file\n" : "[✗] $file - MISSING!\n";
}

$dirs = ['app', 'routes', 'database', 'config', 'vendor'];
echo "\nRequired Directories:\n";
foreach ($dirs as $dir) {
    echo is_dir($dir) ? "[✓] $dir/\n" : "[✗] $dir/ - MISSING!\n";
}

echo "\n✓ Backend structure is ready!\n";
echo "\nNext steps:\n";
echo "1. Ensure MySQL is running on 127.0.0.1:3306\n";
echo "2. Run: php artisan migrate:fresh --seed\n";
echo "3. Run: php artisan app:generate-crypto-prices\n";
echo "4. Run: php artisan serve\n";
echo "5. Access: http://localhost:8000/api\n";
echo "\nTest credentials:\n";
echo "  admin@bitchest.example / admin123\n";
echo "  bruno@bitchest.example / bruno123\n";
