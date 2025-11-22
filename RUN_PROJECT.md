# BitChest - Complete Setup & Running Guide

## 📋 Prerequisites

Ensure you have installed:
- **PHP 8.2+** with Composer
- **Node.js 18+** with npm
- **MySQL 8.0+** (running as service or standalone)
- **Git**

---

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies

```powershell
# Navigate to project root
cd C:\Users\slayer\OneDrive\Bureau\Bitchest

# Install PHP dependencies
cd backend
composer install

# Install Node dependencies
cd ..\frontend
npm install
```

### Step 2: Configure Environment

**Backend Setup:**
```powershell
cd C:\Users\slayer\OneDrive\Bureau\Bitchest\backend

# Copy env template (already exists as .env)
# File location: backend\.env

# Key settings in .env:
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=bitchest
# DB_USERNAME=root
# DB_PASSWORD=
```

### Step 3: Setup Database

```powershell
cd C:\Users\slayer\OneDrive\Bureau\Bitchest\backend

# Run migrations and seed data
php artisan migrate:fresh --seed
```

**Expected Output:**
```
Migrating: 0001_01_01_000000_create_users_table
Migrated:  0001_01_01_000000_create_users_table (123ms)
...
Seeding: DatabaseSeeder
Seeded:  CryptoSeeder
Database seeding completed successfully.
```

### Step 4: Start Backend Server

```powershell
cd C:\Users\slayer\OneDrive\Bureau\Bitchest\backend

php artisan serve
```

**Expected Output:**
```
Server running on: http://127.0.0.1:8000
```

### Step 5: Start Frontend Server (New Terminal)

```powershell
cd C:\Users\slayer\OneDrive\Bureau\Bitchest\frontend

npm start
```

**Expected Output:**
```
webpack 5.103.0 compiled successfully
```

### Step 6: Open Application

Open your browser and go to: **http://localhost:3000**

---

## 🔐 Login Credentials

Use these test accounts to explore the application:

### Admin Account
- **Email**: `admin@bitchest.example`
- **Password**: `admin123`
- **Access**: Client management, user administration

### Client Account
- **Email**: `bruno@bitchest.example`
- **Password**: `bruno123`
- **Balance**: €1,250
- **Access**: Wallet, buy/sell crypto, market view

---

## 📁 Project Structure

```
Bitchest/
├── backend/                          # Laravel 12 REST API
│   ├── app/
│   │   ├── Http/Controllers/         # API controllers
│   │   │   ├── AuthController.php
│   │   │   ├── WalletController.php
│   │   │   ├── ClientController.php
│   │   │   ├── CryptocurrencyController.php
│   │   │   └── UserController.php
│   │   └── Models/                   # Eloquent models
│   │       ├── User.php
│   │       ├── WalletTransaction.php
│   │       ├── ClientAccount.php
│   │       ├── Cryptocurrency.php
│   │       └── CryptoPrice.php
│   ├── database/
│   │   ├── migrations/               # Database schema
│   │   └── seeders/                  # Test data
│   ├── routes/
│   │   └── web.php                   # API routes
│   └── .env                          # Database config
│
├── frontend/                         # React 18 + TypeScript
│   ├── src/
│   │   ├── components/               # React components
│   │   │   ├── admin/
│   │   │   ├── client/
│   │   │   ├── common/
│   │   │   └── layout/
│   │   ├── state/                    # Context API
│   │   │   ├── AuthContext.tsx
│   │   │   ├── AppStateProvider.tsx
│   │   │   └── types.ts
│   │   ├── utils/
│   │   │   ├── api.ts                # API service client
│   │   │   └── wallet.ts
│   │   ├── pages/                    # Page components
│   │   └── main.tsx
│   ├── package.json
│   └── webpack.config.js
│
└── documents/                        # Project documentation
    └── cotation_generator.php
```

---

## 🔌 API Endpoints

All endpoints require session authentication (except `/auth/login`).

### Authentication
```
POST   /auth/login              Login with email/password
GET    /auth/me                 Get current user session
POST   /auth/logout             Destroy session
POST   /auth/change-password    Change password
```

### Users
```
POST   /user/profile            Update current user profile
GET    /users                   List all users (admin only)
```

### Client Management
```
POST   /clients                 Create new client
PUT    /clients/{userId}        Update client profile
DELETE /clients/{userId}        Delete client
GET    /clients/account/mine    Get current user's wallet
```

### Cryptocurrencies
```
GET    /cryptocurrencies                Get all cryptos with 30-day history
GET    /cryptocurrencies/{cryptoId}     Get specific crypto details
GET    /cryptocurrencies/{cryptoId}/price  Get current price
```

### Wallet & Trading
```
POST   /wallet/buy              Buy cryptocurrency
POST   /wallet/sell             Sell cryptocurrency
GET    /wallet/summary          Get holdings summary
```

---

## 🐛 Troubleshooting

### Issue: Port 3000/8000 Already in Use

**Solution:**
```powershell
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change webpack port in frontend/webpack.config.js
# Find: devServer: { port: 3000 }
# Change to: port: 3001
```

### Issue: MySQL Connection Failed

**Check if MySQL is running:**
```powershell
# Start MySQL service
net start MySQL80

# Or check status
sc query MySQL80
```

**Verify connection details in backend/.env:**
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bitchest
DB_USERNAME=root
DB_PASSWORD=
```

### Issue: npm Modules Not Found

```powershell
cd frontend
rm -r node_modules package-lock.json
npm install
npm start
```

### Issue: PHP Command Not Found

Add PHP to PATH:
```powershell
# Check PHP location
where php

# If not found, add to PATH:
$env:Path += ";C:\xampp\php"  # or your PHP installation path
```

### Issue: Composer Command Not Found

```powershell
# Install Composer globally from:
# https://getcomposer.org/download/

# Or download composer.phar and add to PATH
```

---

## 📊 Database Schema

### users
- `id` (bigint, primary)
- `first_name` (string)
- `last_name` (string)
- `email` (string, unique)
- `password` (string, hashed)
- `role` (enum: admin, client)
- `created_at`, `updated_at`

### client_accounts
- `id` (bigint, primary)
- `user_id` (bigint, FK → users, unique)
- `balance_eur` (decimal, default: 500)
- `created_at`, `updated_at`

### cryptocurrencies
- `id` (string, primary) - e.g., "bitcoin", "ethereum"
- `name` (string)
- `symbol` (string) - e.g., "BTC", "ETH"
- `icon` (string, URL)
- `created_at`, `updated_at`

### crypto_prices
- `id` (bigint, primary)
- `crypto_id` (string, FK → cryptocurrencies)
- `price_date` (date)
- `price` (decimal)
- `created_at`, `updated_at`
- **Unique**: (crypto_id, price_date)

### wallet_transactions
- `id` (bigint, primary)
- `user_id` (bigint, FK → users)
- `crypto_id` (string, FK → cryptocurrencies)
- `quantity` (decimal)
- `price_per_unit` (decimal)
- `type` (enum: buy, sell)
- `transaction_date` (timestamp)
- `created_at`, `updated_at`

---

## ✅ Features

### User Management
- ✅ User registration (admin creates clients)
- ✅ Login/logout with session cookies
- ✅ Profile editing
- ✅ Password change
- ✅ Role-based access (admin/client)

### Wallet & Trading
- ✅ Buy cryptocurrencies (deducts balance)
- ✅ Sell cryptocurrencies (adds balance to account)
- ✅ View wallet holdings
- ✅ Calculate profit/loss
- ✅ Transaction history

### Market Data
- ✅ 10 cryptocurrencies
- ✅ 30 days price history per crypto
- ✅ Current price display
- ✅ Price charts (with price history)

### Admin Dashboard
- ✅ Create/edit/delete clients
- ✅ View all users
- ✅ Manage platform

### Client Dashboard
- ✅ Wallet overview
- ✅ Buy/sell interface
- ✅ Market view
- ✅ Profile management

---

## 🧪 Testing the Application

### Test Scenario 1: Admin Creates Client
1. Login as `admin@bitchest.example` / `admin123`
2. Go to Admin → Clients
3. Click "Create Client"
4. Fill: First Name, Last Name, Email
5. Copy temporary password shown
6. New client account created with €500 balance

### Test Scenario 2: Client Buys Cryptocurrency
1. Login as `bruno@bitchest.example` / `bruno123`
2. Go to Wallet tab
3. Select cryptocurrency and quantity
4. Click "Buy"
5. Balance deducts, transaction recorded in database
6. Holding appears in wallet with average price calculated

### Test Scenario 3: Client Sells Cryptocurrency
1. Go to Wallet tab
2. Select owned cryptocurrency
3. Enter quantity to sell
4. Click "Sell"
5. Balance increases, transaction recorded
6. Holdings updated

---

## 📚 Technology Stack

| Layer | Technologies |
|-------|---|
| **Backend** | Laravel 12, PHP 8.2, Eloquent ORM |
| **Database** | MySQL 8.0 |
| **Frontend** | React 18, TypeScript, Webpack 5 |
| **Authentication** | Session-based with cookies |
| **API** | REST with JSON |
| **State Management** | React Context API |

---

## 🔒 Security Notes

- ✅ Passwords hashed with Laravel's `Hash::make()`
- ✅ Session-based auth with secure cookies
- ✅ CSRF protection in place
- ✅ Route middleware checks authentication
- ✅ Role-based authorization on protected endpoints
- ⚠️ Not suitable for production without additional security (HTTPS, rate limiting, validation)

---

## 📝 Common Commands

```powershell
# Backend
cd backend
php artisan serve                           # Start server
php artisan migrate:fresh --seed            # Reset database
php artisan make:model ModelName -m         # Create model + migration
php artisan make:controller NameController  # Create controller

# Frontend
cd frontend
npm start                                   # Start dev server
npm run build                               # Build for production
npm install                                 # Install dependencies
npm update                                  # Update packages

# Git
git status                                  # Check status
git add .                                   # Stage changes
git commit -m "message"                     # Commit
git push                                    # Push to GitHub
```

---

## 🆘 Need Help?

1. **Check logs:**
   - Backend: `backend/storage/logs/laravel.log`
   - Frontend: Browser console (F12)

2. **Database issues:**
   - Verify MySQL is running
   - Check `.env` credentials
   - Run: `php artisan migrate:fresh --seed`

3. **Port conflicts:**
   - Backend: Change `APP_PORT` in `.env`
   - Frontend: Change `devServer.port` in `webpack.config.js`

4. **Dependencies:**
   - PHP: `composer install`
   - Node: `npm install`

---

**Last Updated**: November 22, 2025
**Status**: ✅ Ready for Production Testing
