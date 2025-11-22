# Bitchest - Complete Integration & Getting Started Guide

## Quick Start (3 Steps)

### Step 1: Setup Database
```bash
cd backend
mysql -u root -e "CREATE DATABASE IF NOT EXISTS bitchest"
php artisan migrate:fresh --seed
php artisan app:generate-crypto-prices
```

### Step 2: Start Backend
```bash
cd backend
php -S localhost:8000 -t public
```

### Step 3: Start Frontend
```bash
cd frontend
npm run dev
```

**Access Application**: http://localhost:5173

---

## Complete System Overview

### Backend Architecture (Laravel)

**Key Components**:
- **Controllers**: Handle HTTP requests and business logic
- **Models**: Represent database entities with relationships
- **Migrations**: Define database schema
- **Seeders**: Populate initial data
- **Middleware**: Enforce authentication and role-based access

**Database Entities**:
1. **Users**: Store user credentials, roles, and EUR balance
2. **Cryptocurrencies**: 10 supported cryptocurrencies
3. **Wallet Transactions**: Buy/sell records with timestamp and price
4. **Cryptocurrency Prices**: Daily prices for 30-day history

**Authentication Flow**:
1. User submits email/password to `/api/login`
2. Server validates credentials and creates session
3. Session stored in database (Laravel sessions table)
4. Cookie sent to frontend for session persistence
5. Frontend includes `credentials: 'include'` in API calls
6. Middleware validates authenticated user on protected routes

### Frontend Architecture (React + Vite)

**State Management**:
- **AppStateProvider**: Global app state using useReducer
- **AuthContext**: Authentication state and methods
- **API Service Layer**: Centralized API calls

**Data Flow**:
1. Frontend starts and checks for existing session (`/api/me`)
2. If authenticated, loads user-specific data
3. User performs actions (buy/sell crypto, update profile, etc.)
4. Frontend calls backend API with session cookie
5. Backend validates and updates database
6. Response updates frontend state

**Components**:
- **LoginPage**: Authentication entry point
- **AdminDashboard**: Admin user management interface
- **ClientDashboard**: Client wallet and trading interface

### API Endpoints Reference

#### Public
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/login` | User login |

#### Protected (All Authenticated Users)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/logout` | User logout |
| GET | `/api/me` | Get current user |
| PUT | `/api/profile` | Update profile |
| POST | `/api/password` | Change password |
| GET | `/api/cryptocurrencies` | List cryptos with prices |

#### Admin Only
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/users` | List all users |
| POST | `/api/admin/users` | Create user (returns temp password) |
| GET | `/api/admin/users/{id}` | Get user details |
| PUT | `/api/admin/users/{id}` | Update user |
| DELETE | `/api/admin/users/{id}` | Delete user |

#### Client Only
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/client/wallet` | Get wallet data |
| GET | `/api/client/transactions` | List transactions |
| POST | `/api/client/transactions` | Record buy/sell |
| GET | `/api/client/cryptocurrencies/{id}/prices` | Get price history |

---

## Key Implementation Details

### Wallet Logic (backend: `WalletController`)

```php
// Get wallet groups transactions by cryptocurrency:
- Sums all buys to get total quantity
- Calculates total cost (quantity × price)
- Computes average price per unit (total cost / quantity)
- Filters out cryptos with zero quantity after sells
```

### Transaction Recording (backend: `TransactionController`)

```php
// When user buys crypto:
1. Validate user has sufficient EUR balance
2. Deduct amount from user.balance_eur
3. Create WalletTransaction record with type='buy'
4. Return updated balance to frontend

// When user sells crypto:
1. Add amount to user.balance_eur
2. Create WalletTransaction record with type='sell'
3. Return updated balance to frontend
```

### Price Generation (backend: `GenerateCryptoPrices` command)

```php
// Generates 30 days of daily prices:
- Uses base prices for each crypto
- Applies random daily variance (±5%)
- Ensures prices always positive
- Stores in cryptocurrency_prices table
```

### Session-Based Authentication

```php
// Laravel configuration (app.php middleware):
$middleware->statefulApi();  // Enable stateful API mode

// User login flow:
1. Validate credentials with Hash::check()
2. Call Auth::login($user) to establish session
3. Laravel stores session in database
4. Cookie with session ID returned to client
5. Client includes cookie in subsequent requests
```

### CORS Configuration (backend: `config/cors.php`)

```php
// Allows frontend requests from:
- http://localhost:3000
- http://localhost:5173 (Vite default)
- localhost variants
// Credentials included for session cookies
```

---

## Testing the Application

### Manual API Testing with cURL

**Login**:
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"admin@bitchest.example","password":"admin123"}'
```

**Get Current User**:
```bash
curl http://localhost:8000/api/me \
  -b cookies.txt
```

**List Users (Admin)**:
```bash
curl http://localhost:8000/api/admin/users \
  -b cookies.txt
```

**Get Wallet (Client)**:
```bash
curl http://localhost:8000/api/client/wallet \
  -b cookies.txt
```

### Browser Testing

1. Open http://localhost:5173
2. Login with:
   - Admin: admin@bitchest.example / admin123
   - Client: bruno@bitchest.example / bruno123
3. Test features:
   - Update profile
   - Change password
   - View wallet (client)
   - Buy/sell cryptocurrencies (client)
   - Manage users (admin)

---

## Troubleshooting

### Issue: "Unauthenticated" on all API calls
**Solution**: 
- Verify session driver in .env is `SESSION_DRIVER=cookie`
- Clear browser cookies and try logging in again
- Check that backend is running and accessible

### Issue: "Insufficient balance" when buying crypto
**Solution**:
- This is correct behavior - user doesn't have enough EUR
- Admin can create users with more balance
- The initial €500 may be spent on previous transactions

### Issue: CORS error from frontend
**Solution**:
- Verify CORS middleware is registered in `bootstrap/app.php`
- Check `config/cors.php` includes `http://localhost:5173`
- Ensure backend is running with correct port

### Issue: Cryptocurrency prices are too high/low
**Solution**:
- Prices are generated randomly with ±5% variance
- Each run of `php artisan app:generate-crypto-prices` creates new data
- To reset: run `php artisan migrate:fresh --seed` and regenerate prices

---

## File Structure Summary

```
backend/
├── app/Console/Commands/GenerateCryptoPrices.php
├── app/Http/Controllers/
│   ├── Auth/LoginController.php
│   ├── Auth/LogoutController.php
│   ├── Auth/MeController.php
│   ├── UserController.php
│   ├── CryptoController.php
│   ├── WalletController.php
│   ├── TransactionController.php
│   ├── CryptoPriceController.php
│   └── ProfileController.php
├── app/Http/Middleware/
│   ├── CheckAdmin.php
│   └── CheckClient.php
├── app/Models/
│   ├── User.php
│   ├── Cryptocurrency.php
│   ├── WalletTransaction.php
│   └── CryptocurrencyPrice.php
├── database/migrations/
├── database/seeders/
├── routes/api.php
├── bootstrap/app.php
└── .env

frontend/
├── src/components/
├── src/pages/
│   ├── LoginPage.tsx
│   ├── AdminDashboard.tsx
│   └── ClientDashboard.tsx
├── src/state/
│   ├── AuthContext.tsx
│   ├── AppStateProvider.tsx
│   ├── types.ts
│   └── initialData.ts
├── src/utils/
│   ├── api.ts
│   ├── wallet.ts
│   └── priceGenerator.ts
├── src/App.tsx
├── .env
└── package.json
```

---

## Performance Considerations

- **Frontend**: Uses React.memo, useCallback to prevent unnecessary renders
- **Backend**: Uses Eloquent eager loading with `with()` to minimize queries
- **Database**: Indexed primary keys and foreign keys
- **Caching**: Session data cached in database for persistence

---

## Security Implementation

✅ **Password Hashing**: BCrypt (Laravel default)
✅ **Session Security**: Stored in database, not client-side
✅ **Role-Based Access**: Middleware checks user role
✅ **SQL Injection Protection**: Eloquent ORM parameterized queries
✅ **CORS**: Restricted to localhost during development
✅ **CSRF**: Protected (Laravel automatically)

---

## Next Steps for Enhancement

1. **Add Email Verification**: Send confirmation emails on signup
2. **Implement 2FA**: Two-factor authentication for security
3. **Add Real Market Data**: Integrate with crypto APIs (CoinGecko, etc.)
4. **Implement Deposits/Withdrawals**: Add payment gateway
5. **Add Notifications**: Email/push notifications for transactions
6. **Performance Optimization**: Add caching for price data
7. **Admin Analytics**: Dashboard with system statistics
8. **Mobile App**: React Native version for mobile

---

## Support & Documentation

- **Backend Framework**: https://laravel.com/docs
- **Frontend Framework**: https://react.dev
- **Build Tool**: https://vitejs.dev
- **Database**: https://www.mysql.com/
- **Authentication Pattern**: Session-based (RFC 6265)

---

**Built with ❤️ - Bitchest v1.0.0**
