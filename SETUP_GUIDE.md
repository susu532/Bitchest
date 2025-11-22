# BitChest - Cryptocurrency Wallet Management System

## Project Overview

BitChest is a full-stack web application for managing cryptocurrency portfolios. It features:

- **Role-based authentication** (Admin and Client)
- **Wallet management** with buy/sell transactions
- **Portfolio tracking** with profit/loss calculations
- **Real-time cryptocurrency prices** with 30-day historical data
- **Admin dashboard** for user management
- **Client dashboard** for portfolio management

## Technology Stack

### Backend
- **Framework**: Laravel 12
- **Database**: MySQL
- **Authentication**: Session/Cookie-based
- **API**: REST API with CORS support

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **State Management**: React Context API
- **HTTP Client**: Fetch API

## Project Structure

```
Bitchest/
├── backend/              # Laravel REST API
│   ├── app/
│   │   ├── Console/Commands/
│   │   │   └── GenerateCryptoPrices.php
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Auth/
│   │   │   │   │   ├── LoginController.php
│   │   │   │   │   ├── LogoutController.php
│   │   │   │   │   └── MeController.php
│   │   │   │   ├── UserController.php
│   │   │   │   ├── CryptoController.php
│   │   │   │   ├── WalletController.php
│   │   │   │   ├── TransactionController.php
│   │   │   │   ├── CryptoPriceController.php
│   │   │   │   └── ProfileController.php
│   │   │   └── Middleware/
│   │   │       ├── CheckAdmin.php
│   │   │       └── CheckClient.php
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   ├── Cryptocurrency.php
│   │   │   ├── WalletTransaction.php
│   │   │   └── CryptocurrencyPrice.php
│   │   └── Providers/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   ├── api.php          # API routes
│   │   └── web.php
│   ├── .env
│   └── artisan
├── frontend/             # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── state/
│   │   │   ├── AuthContext.tsx
│   │   │   ├── AppStateProvider.tsx
│   │   │   └── types.ts
│   │   ├── utils/
│   │   │   └── api.ts       # API service
│   │   ├── styles/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
├── start.bat            # Windows startup script
└── README.md
```

## Database Schema

### Users Table
```sql
- id (bigint, primary key)
- first_name (string)
- last_name (string)
- email (string, unique)
- password (string, hashed)
- role (enum: 'admin', 'client')
- balance_eur (decimal)
- created_at, updated_at
```

### Cryptocurrencies Table
```sql
- id (bigint, primary key)
- name (string, unique)
- symbol (string, unique)
- icon (string, nullable)
- created_at, updated_at
```

### Cryptocurrency Prices Table
```sql
- id (bigint, primary key)
- cryptocurrency_id (foreign key)
- price_date (date)
- price (decimal)
- created_at, updated_at
- unique constraint on (cryptocurrency_id, price_date)
```

### Wallet Transactions Table
```sql
- id (bigint, primary key)
- user_id (foreign key)
- cryptocurrency_id (foreign key)
- type (enum: 'buy', 'sell')
- quantity (decimal, 8 decimals)
- price_per_unit (decimal)
- transaction_date (timestamp)
- created_at, updated_at
```

## Setup Instructions

### Prerequisites
- PHP 8.4+
- MySQL 5.7+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install PHP dependencies:
```bash
composer install
```

3. Create `.env` file (already configured):
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bitchest
DB_USERNAME=root
DB_PASSWORD=
```

4. Run migrations and seed database:
```bash
php artisan migrate:fresh
php artisan db:seed
php artisan app:generate-crypto-prices
```

5. Start Laravel development server:
```bash
php artisan serve
```
Server will run on: http://localhost:8000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install Node dependencies:
```bash
npm install
```

3. Verify `.env` file (should already exist):
```
VITE_API_BASE=http://localhost:8000/api
```

4. Start development server:
```bash
npm run dev
```
Frontend will run on: http://localhost:5173

### Quick Start (Windows)

Simply run the batch script to start both servers:
```bash
start.bat
```

This will open two terminal windows:
- Backend on http://localhost:8000
- Frontend on http://localhost:5173

## Test Credentials

### Admin Account
- Email: `admin@bitchest.example`
- Password: `admin123`

### Client Account
- Email: `bruno@bitchest.example`
- Password: `bruno123`

## API Documentation

### Authentication Endpoints

#### Login
```
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}

Response:
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "role": "client",
    "balance_eur": 1000
  }
}
```

#### Logout
```
POST /api/logout

Response:
{
  "message": "Logout successful"
}
```

#### Get Current User
```
GET /api/me

Response:
{
  "user": { ... }
}
```

### Cryptocurrency Endpoints

#### Get All Cryptocurrencies
```
GET /api/cryptocurrencies

Response:
{
  [
    {
      "id": 1,
      "name": "Bitcoin",
      "symbol": "BTC",
      "icon": "/assets/bitcoin.png",
      "current_price": 42000,
      "history": [
        { "date": "2025-10-23", "value": 40000 },
        ...
      ]
    },
    ...
  ]
}
```

#### Get Cryptocurrency Price History
```
GET /api/cryptocurrencies/{id}/prices

Response:
{
  "cryptocurrency": {
    "id": 1,
    "name": "Bitcoin",
    "symbol": "BTC",
    "icon": "/assets/bitcoin.png"
  },
  "history": [
    { "date": "2025-10-23", "value": 40000 },
    ...
  ]
}
```

### Admin Endpoints (Protected)

#### Get All Users
```
GET /api/admin/users
```

#### Create User
```
POST /api/admin/users
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@example.com"
}

Response:
{
  "message": "User created successfully",
  "user": { ... },
  "temp_password": "GeneratedPassword123"
}
```

#### Update User
```
PUT /api/admin/users/{id}
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@example.com"
}
```

#### Delete User
```
DELETE /api/admin/users/{id}
```

### Client Endpoints (Protected)

#### Get Wallet
```
GET /api/client/wallet

Response:
{
  "balance_eur": 1000,
  "assets": [
    {
      "crypto_id": 1,
      "name": "Bitcoin",
      "symbol": "BTC",
      "icon": "/assets/bitcoin.png",
      "quantity": 0.5,
      "average_price": 40000,
      "transactions": [
        {
          "id": 1,
          "type": "buy",
          "quantity": 0.5,
          "price_per_unit": 40000,
          "date": "2025-10-23"
        }
      ]
    }
  ]
}
```

#### Record Transaction
```
POST /api/client/transactions
{
  "cryptocurrency_id": 1,
  "type": "buy",
  "quantity": 0.1,
  "price_per_unit": 42000
}

Response:
{
  "message": "Transaction recorded successfully",
  "transaction": { ... },
  "new_balance": 958
}
```

#### Get User Transactions
```
GET /api/client/transactions
```

### Profile Endpoints (Protected)

#### Update Profile
```
PUT /api/profile
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com"
}
```

#### Change Password
```
POST /api/password
{
  "current_password": "oldpassword",
  "new_password": "newpassword",
  "new_password_confirmation": "newpassword"
}
```

## Features Implemented

### ✅ Authentication
- Login/Logout with session-based authentication
- Role-based access control (Admin/Client)
- Get current user info
- CORS support for frontend requests

### ✅ Admin Features
- View all users
- Create new users with auto-generated passwords
- Edit user information
- Delete users
- View cryptocurrency prices

### ✅ Client Features
- View personal wallet and balance
- View portfolio assets with average prices
- Buy cryptocurrencies
- Sell cryptocurrencies
- View transaction history
- View profit/loss calculations
- Update personal information
- Change password

### ✅ Cryptocurrency Management
- 10 supported cryptocurrencies (Bitcoin, Ethereum, Ripple, etc.)
- 30-day historical price data
- Current price display
- Price variation tracking

### ✅ Wallet Transactions
- Buy transactions (deduct from balance)
- Sell transactions (add to balance)
- Quantity tracking per cryptocurrency
- Average purchase price calculation
- Transaction history with dates

## Available Commands

### Backend Commands
```bash
# Run migrations
php artisan migrate

# Seed database
php artisan db:seed

# Generate cryptocurrency prices
php artisan app:generate-crypto-prices

# Run development server
php artisan serve

# Fresh migrations and seeding
php artisan migrate:fresh --seed
```

### Frontend Commands
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Database Configuration

The project uses MySQL with the following configuration:
- Host: 127.0.0.1
- Port: 3306
- Database: bitchest
- Username: root
- Password: (empty)

Make sure MySQL is running and accessible before starting the application.

## Troubleshooting

### Backend won't start
- Ensure PHP 8.4+ is installed
- Verify MySQL is running
- Check that port 8000 is not in use
- Run `php artisan cache:clear` and `php artisan config:cache`

### Frontend can't connect to backend
- Ensure backend is running on http://localhost:8000
- Check CORS configuration in `backend/config/cors.php`
- Verify `VITE_API_BASE` is set correctly in `frontend/.env`
- Check browser console for CORS errors

### Database connection errors
- Verify MySQL is running
- Check `.env` file database credentials
- Run `php artisan config:cache` to refresh config

### Port already in use
- Change port in `php artisan serve --port=8001`
- Update `frontend/.env` accordingly

## Development Notes

### Session/Cookie Authentication
- Uses Laravel's built-in session handling
- Sessions stored in database (configured in migrations)
- CORS allows credentials to be sent with requests
- Session cookies are secure and httpOnly

### API Response Format
- All responses are JSON
- Errors include HTTP status codes and error messages
- Successful responses include a "message" field when appropriate
- User objects exclude the "password" field

### State Management (Frontend)
- React Context API used for global state
- AuthContext for authentication state
- AppStateProvider for app data
- Local storage for session persistence

## Security Features

- Passwords are hashed using bcrypt
- CORS is configured for local development
- Session-based authentication prevents unauthorized access
- Role-based middleware protects admin endpoints
- Input validation on all endpoints
- SQL injection prevention through Eloquent ORM

## Future Enhancements

- Real-time cryptocurrency prices via WebSocket
- Email notifications for price alerts
- Two-factor authentication
- Transaction export (CSV/PDF)
- Advanced portfolio analytics
- Mobile app
- Payment gateway integration
