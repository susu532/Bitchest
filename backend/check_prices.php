<?php

require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';

$db = $app->make('db');

$prices = $db->select('SELECT c.name, ROUND(p.price, 2) as price, p.price_date FROM crypto_prices p JOIN cryptocurrencies c ON p.crypto_id = c.id ORDER BY p.price_date DESC LIMIT 10');

echo "\nLatest Cryptocurrency Prices:\n";
echo "================================\n";
foreach ($prices as $row) {
    echo $row->name . " - €" . $row->price . " - " . $row->price_date . "\n";
}

?>
