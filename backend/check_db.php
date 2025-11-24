<?php

require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';

$app->make(\Illuminate\Contracts\Http\Kernel::class);

use App\Models\CryptoPrice;

echo "Latest 5 prices:\n";
$prices = CryptoPrice::orderBy('price_date', 'desc')->limit(5)->get();
foreach ($prices as $p) {
    echo $p->crypto_id . " - €" . $p->price . " - " . $p->price_date . "\n";
}
echo "\nTotal prices: " . CryptoPrice::count() . "\n";
echo "Last update time: " . ($prices->first()?->price_date ?? 'Never') . "\n";

?>
