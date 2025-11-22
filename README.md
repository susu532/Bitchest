# Bitchest - Cryptocurrency Trading Platform

A full-stack web application for managing cryptocurrency wallets and executing buy/sell transactions.

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Laravel + MySQL
- **Authentication**: Session/Cookie-based with role-based access control
- **API**: RESTful API with CORS enabled

## Features

### For Administrators
- Manage users (create, view, edit, delete)
- View all users and their wallet balances
- Access cryptocurrency price information
- View system-wide statistics

### For Clients
- Manage personal account information
- View and manage cryptocurrency wallet
- Buy/sell cryptocurrencies at current market prices
- Track transaction history
- View profit/loss calculations
- See 30-day price history charts for each cryptocurrency

## Project Structure

```
Bitchest/
├── backend/                 # Laravel API
│   ├── app/
│   │   ├── Console/Commands/
│   │   │   └── GenerateCryptoPrices.php
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   └── Middleware/
│   │   └── Models/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php
│   └── .env
├── frontend/                # React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── state/
│   │   ├── utils/
│   │   └── App.tsx
│   ├── package.json
│   └── .env
└── README.md
```

## Setup Instructions

### Prerequisites
- PHP 8.2+
- Node.js 18+
- MySQL 5.7+
- Composer

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install PHP dependencies:
```bash
composer install
```

3. Configure environment (already done):
```bash
# .env is pre-configured with:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=bitchest
# DB_USERNAME=root
# DB_PASSWORD=
```

4. Create the database:
```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS bitchest"
```

5. Run migrations and seeders:
```bash
php artisan migrate:fresh --seed
php artisan app:generate-crypto-prices
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies (if not already done):
```bash
npm install
```

3. The `.env` file is already configured with:
```
VITE_API_BASE=http://localhost:8000/api
```

## Running the Application

### Option 1: Start Both Servers (Linux/Mac)
```bash
bash start.sh
```

### Option 2: Start Manually

**Terminal 1 - Backend:**
```bash
cd backend
php -S localhost:8000 -t public
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Access the application:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api

## Test Credentials

### Admin Account
- **Email**: admin@bitchest.example
- **Password**: admin123

### Client Account
- **Email**: bruno@bitchest.example
- **Password**: bruno123

### Initial Data
- 10 cryptocurrencies with 30-day price history
- Admin user with €500 balance
- Client user with €1,250 balance and sample transactions

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/me` - Get current user

### Profile Management
- `PUT /api/profile` - Update profile
- `POST /api/password` - Change password

### Cryptocurrencies
- `GET /api/cryptocurrencies` - List all cryptos with prices
- `GET /api/cryptocurrencies/{id}/prices` - Get price history

### Admin Routes (`/api/admin`)
- `GET /users` - List all users
- `POST /users` - Create new user
- `GET /users/{id}` - Get user details
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

### Client Routes (`/api/client`)
- `GET /wallet` - Get wallet details
- `GET /transactions` - Get transaction history
- `POST /transactions` - Record transaction (buy/sell)
- `GET /cryptocurrencies` - Get available cryptocurrencies

## Database Schema

### Users
- id, first_name, last_name, email, password, role, balance_eur, timestamps

### Cryptocurrencies
- id, name, symbol, icon, timestamps

### Wallet Transactions
- id, user_id, cryptocurrency_id, type (buy/sell), quantity, price_per_unit, transaction_date, timestamps

### Cryptocurrency Prices
- id, cryptocurrency_id, price_date, price, timestamps

## Supported Cryptocurrencies

1. Bitcoin (BTC)
2. Ethereum (ETH)
3. Ripple (XRP)
4. Bitcoin Cash (BCH)
5. Cardano (ADA)
6. Litecoin (LTC)
7. NEM (XEM)
8. Stellar (XLM)
9. IOTA (MIOTA)
10. Dash (DASH)

## Features Implementation

### Wallet Management
- Track all buy/sell transactions
- Calculate average purchase price
- Calculate current profit/loss
- View balance in EUR
- Prevent selling more than owned

### Price History
- 30 days of historical data generated via `GenerateCryptoPrices` command
- Chart visualization using Chart.js
- Real-time price updates

### Role-Based Access
- Admin middleware checks for admin role
- Client middleware checks for client role
- Unauthorized access returns 403 Forbidden

### Session-Based Authentication
- Laravel session driver configured
- Cookies used for persistent sessions
- CORS enabled for cross-origin requests

## Development

### Adding New Features

1. **Backend**: Add routes to `routes/api.php`, create controller methods
2. **Frontend**: Create React components in `src/components/`, wire to state
3. **Database**: Create migrations for schema changes

### Running Tests

Backend unit tests:
```bash
cd backend
php artisan test
```

## Troubleshooting

### Database Connection Error
- Ensure MySQL is running
- Check .env DB credentials
- Verify bitchest database exists

### Port Already in Use
- Backend (8000): `lsof -i :8000` and kill the process
- Frontend (5173): Kill other Vite processes

### Frontend Can't Connect to Backend
- Check if backend server is running
- Verify VITE_API_BASE in frontend/.env
- Check CORS configuration in bootstrap/app.php

### Session Not Persisting
- Clear browser cookies
- Check Session driver in .env (should be "cookie")
- Verify credentials: 'include' in frontend API calls

## Production Deployment

For production:

**Backend**:
- Use a proper web server (Apache/Nginx)
- Set up HTTPS
- Configure environment variables
- Run `php artisan migrate` with production database
- Run `php artisan config:cache`

**Frontend**:
- Build: `npm run build`
- Deploy dist/ folder to static hosting
- Configure API_BASE for production endpoint

## Security Notes

- Passwords are hashed using bcrypt
- All sensitive routes require authentication
- Role-based middleware enforces access control
- CORS is configured for localhost only
- Session cookies are HTTP-only (by default in Laravel)

## Support

For issues or questions, refer to:
- Laravel Documentation: https://laravel.com/docs
- React Documentation: https://react.dev
- Vite Documentation: https://vitejs.dev

---

**Version**: 1.0.0  
**Last Updated**: November 22, 2025
