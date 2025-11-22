# BitChest - Real-Time WebSocket Setup Guide

## 🚀 New Features: Real-Time Price Updates & Notifications

Your BitChest application now includes:
- ✅ **Real-Time Crypto Price Updates** - Prices update instantly via WebSockets
- ✅ **Transaction Notifications** - Get notified immediately after buy/sell
- ✅ **Balance Alerts** - Receive alerts when balance changes
- ✅ **Live Price Ticker** - See all cryptocurrencies updating in real-time

---

## 📋 Complete Setup & Running Instructions

### Prerequisites
Ensure you have:
- **PHP 8.2+** with Composer
- **Node.js 18+** with npm
- **MySQL 8.0+** running
- **Git**

---

## 🔧 Step-by-Step Setup

### 1. Install PHP Dependencies

```powershell
cd C:\Users\slayer\OneDrive\Bureau\Bitchest\backend
composer install
```

### 2. Configure Environment

The `.env` file is already configured with Reverb (WebSocket server):

```env
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=149624
REVERB_APP_KEY=7kfpzm9vblwo9jdjebla
REVERB_APP_SECRET=ndqnjkaoguz8acxadvzh
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http

DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bitchest
DB_USERNAME=root
DB_PASSWORD=
```

### 3. Setup Database

```powershell
cd C:\Users\slayer\OneDrive\Bureau\Bitchest\backend
php artisan migrate:fresh --seed
```

### 4. Start Backend Services

You'll need **3 terminals** for full functionality:

#### Terminal 1: Laravel Application Server

```powershell
cd C:\Users\slayer\OneDrive\Bureau\Bitchest\backend
php artisan serve
```

**Output:**
```
Server running on: http://127.0.0.1:8000
```

#### Terminal 2: Reverb WebSocket Server

```powershell
cd C:\Users\slayer\OneDrive\Bureau\Bitchest\backend
php artisan reverb:start
```

**Output:**
```
Starting Reverb server...
Listening on 0.0.0.0:8080
```

#### Terminal 3: Price Update Simulator

```powershell
cd C:\Users\slayer\OneDrive\Bureau\Bitchest\backend
php artisan crypto:update-prices --interval=5
```

**Output:**
```
Starting cryptocurrency price updates (interval: 5 seconds)...
[2025-11-22 10:30:45] Price Update #1
  BITCOIN: €45,234.50 (was €45,000.00, +0.52% 📈)
  ETHEREUM: €2,450.75 (was €2,500.00, -1.97% 📉)
  ...
Waiting 5 seconds until next update...
```

### 5. Install Frontend Dependencies

```powershell
cd C:\Users\slayer\OneDrive\Bureau\Bitchest\frontend
npm install
```

### 6. Start Frontend Server

```powershell
cd C:\Users\slayer\OneDrive\Bureau\Bitchest\frontend
npm start
```

**Output:**
```
webpack 5.103.0 compiled successfully
```

### 7. Open Application

Open your browser: **http://localhost:3000**

---

## 🔑 Test Accounts

### Admin Account
- **Email**: `admin@bitchest.example`
- **Password**: `admin123`

### Client Account
- **Email**: `bruno@bitchest.example`
- **Password**: `bruno123`
- **Balance**: €1,250

---

## 📊 Testing Real-Time Features

### Test 1: View Live Price Updates

1. Login as either user
2. Go to **Markets** tab
3. Watch the **Live Market Prices** widget at the top
4. Prices update every 5 seconds with visual indicators:
   - 🔴 **Red border** = Recently updated
   - 📈 **Green percentage** = Price increased
   - 📉 **Red percentage** = Price decreased

### Test 2: Buy Crypto & Get Notification

1. Login as `bruno@bitchest.example`
2. Go to **Wallet** tab
3. Select a cryptocurrency and quantity
4. Click **Buy**
5. Check top-right corner for **success notification**:
   - Shows transaction details
   - Auto-closes after 5 seconds
   - Balance updates instantly

### Test 3: See Balance Change Alert

1. After buying crypto (Test 2)
2. You'll receive a **balance alert notification**:
   - Shows old and new balance
   - Shows amount deducted/added
   - Color-coded by type

### Test 4: Multi-Client Real-Time Sync

1. Open two browser windows:
   - **Window 1**: Client logged in as `bruno@bitchest.example`
   - **Window 2**: Client logged in as different account
2. In any window, watch the **Live Market Prices** update
3. **Both windows** receive price updates simultaneously

---

## 🏗️ Architecture Overview

### Backend (Laravel 12)

#### Broadcasting Events
Three main events are broadcast in real-time:

```php
// Price update event
CryptoPriceUpdated
  - cryptoId: string
  - price: float
  - previousPrice: float
  - priceChange: float
  - percentageChange: float

// Balance change event
UserBalanceChanged
  - userId: int
  - newBalance: float
  - previousBalance: float
  - balanceChange: float
  - reason: string

// Transaction event
TransactionCompleted
  - userId: int
  - type: 'buy' | 'sell'
  - cryptoId: string
  - quantity: float
  - pricePerUnit: float
  - totalAmount: float
  - message: string
```

#### Channels
- **Public Channel**: `crypto-prices` - All price updates
- **Public Channel**: `crypto-price.{cryptoId}` - Specific crypto price
- **Private Channel**: `user.{userId}` - User-specific notifications

#### Commands
- `php artisan crypto:update-prices --interval=N` - Simulate price updates every N seconds

### Frontend (React 18)

#### Services
- **echoService** (`src/utils/echo.ts`)
  - Initializes WebSocket connection
  - Subscribes to channels
  - Handles reconnection

#### Components
- **RealTimePriceTicker** - Displays live prices with animations
- **NotificationContainer** - Toast notifications for events
- **Notifications Hook** - Centralized notification management

#### State Management
- Leverages React Context API for global state
- WebSocket events trigger state updates
- Local state synced with backend

---

## ⚙️ Configuration Details

### Reverb Configuration

**File**: `backend/config/broadcasting.php`

```php
'reverb' => [
    'driver' => 'reverb',
    'key' => env('REVERB_APP_KEY'),
    'secret' => env('REVERB_APP_SECRET'),
    'app_id' => env('REVERB_APP_ID'),
    'options' => [
        'host' => env('REVERB_HOST'),
        'port' => env('REVERB_PORT', 443),
        'scheme' => env('REVERB_SCHEME', 'https'),
    ],
],
```

### Laravel Echo Configuration

**File**: `frontend/src/utils/echo.ts`

```typescript
new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT,
    forceTLS: false,
    encrypted: false,
})
```

---

## 🐛 Troubleshooting

### Port 8080 Already in Use (Reverb)

```powershell
# Find process
netstat -ano | findstr :8080

# Kill process
taskkill /PID <PID> /F

# Or change port in .env
REVERB_PORT=8081
```

### WebSocket Connection Refused

**Check**:
1. Reverb server is running (Terminal 2)
2. Port 8080 is open (firewall)
3. Both backend and frontend are running
4. Browser console for errors (F12)

**Fix**:
```powershell
# Restart Reverb
cd backend
php artisan reverb:start
```

### Prices Not Updating

**Check**:
1. Price update command is running (Terminal 3)
2. Database migrations completed
3. MySQL connection working

**Verify**:
```powershell
cd backend
php artisan crypto:update-prices --interval=5
```

### Frontend Can't Connect to WebSocket

**Browser Console Error**: `WebSocket connection failed`

**Solution**:
1. Check VITE env variables in `frontend/.env`:
```env
VITE_REVERB_APP_KEY=7kfpzm9vblwo9jdjebla
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

2. Restart webpack:
```powershell
cd frontend
npm start
```

---

## 📊 Database Tables

### New Relationships

```
CryptoPriceUpdated Event
  └─ Broadcasts on: crypto-prices, crypto-price.{cryptoId}
  └─ Uses: CryptoPrice model (existing)

UserBalanceChanged Event
  └─ Broadcasts on: user.{userId}
  └─ Uses: ClientAccount model (existing)

TransactionCompleted Event
  └─ Broadcasts on: user.{userId}
  └─ Uses: WalletTransaction model (existing)
```

---

## 🔒 Security Notes

- ✅ Private channels require authentication
- ✅ Session-based auth protects user channels
- ✅ Public channels allow all users to view prices
- ⚠️ For production: Enable TLS/SSL (`REVERB_SCHEME=https`)

---

## 📈 Performance Tips

1. **Price Update Interval**:
   - 5 seconds (demo): `--interval=5` (default)
   - 60 seconds (production): `--interval=60`
   - Adjust based on desired frequency

2. **Browser Optimization**:
   - Modern browsers handle real-time updates efficiently
   - Test with multiple tabs open to verify sync

3. **Server Load**:
   - Each price update broadcasts to all connected clients
   - Monitor memory/CPU if thousands of connections

---

## 📝 API Events Reference

### Broadcasting Events

```typescript
// Listen to price updates
echo.channel('crypto-prices')
    .listen('price-updated', (data) => {
        console.log(`${data.cryptoId}: €${data.price}`);
    });

// Listen to user balance
echo.private('user.123')
    .listen('balance-changed', (data) => {
        console.log(`Balance: €${data.newBalance}`);
    });

// Listen to transactions
echo.private('user.123')
    .listen('transaction-completed', (data) => {
        console.log(`${data.type.toUpperCase()}: ${data.quantity} ${data.cryptoId}`);
    });
```

---

## ✅ Complete Checklist

- [ ] PHP dependencies installed
- [ ] Node dependencies installed
- [ ] Database migrations run
- [ ] Terminal 1: Laravel server running (port 8000)
- [ ] Terminal 2: Reverb WebSocket running (port 8080)
- [ ] Terminal 3: Price update command running
- [ ] Frontend running (port 3000)
- [ ] Browser opens to http://localhost:3000
- [ ] Can login with test credentials
- [ ] Live prices updating in Markets tab
- [ ] Notifications appear on buy/sell
- [ ] Balance alerts working

---

## 🆘 Need Help?

**Check logs**:
```powershell
# Laravel logs
cat backend/storage/logs/laravel.log

# Browser console
F12 → Console tab
```

**Restart everything**:
```powershell
# Kill all processes
taskkill /F /IM php.exe
taskkill /F /IM node.exe

# Clear cache
cd backend && php artisan cache:clear && php artisan config:clear

# Restart all services (follow Step 1-6 again)
```

---

**Status**: ✅ Ready for Real-Time Testing
**Last Updated**: November 22, 2025
