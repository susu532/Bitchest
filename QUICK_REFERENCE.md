# BitChest - Quick Reference Guide

## 🚀 Quick Start

### 1. Start Servers (One Command)
```bash
# Windows
start.bat

# Linux/Mac
bash start.sh
```

### 2. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api

### 3. Login
| Role   | Email                        | Password  |
|--------|------------------------------|-----------|
| Admin  | admin@bitchest.example      | admin123  |
| Client | bruno@bitchest.example      | bruno123  |

---

## 📁 Project Structure

```
Bitchest/
├── backend/                    # Laravel API
│   ├── app/Models/             # Database models
│   ├── app/Http/Controllers/   # API controllers
│   ├── app/Http/Middleware/    # Role-based middleware
│   ├── routes/api.php          # API routes
│   ├── database/migrations/    # Database schema
│   ├── database/seeders/       # Initial data
│   ├── .env                    # Configuration
│   └── artisan                 # Command runner
│
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── state/              # Context & state
│   │   └── utils/api.ts        # API client
│   ├── .env                    # Configuration
│   └── package.json
│
├── README.md                   # Main documentation
├── SETUP_GUIDE.md             # Detailed setup
├── PROJECT_COMPLETION.md      # Project summary
├── DEPLOYMENT_CHECKLIST.md    # Verification checklist
└── start.bat / start.sh       # Startup scripts
```

---

## 🔧 Common Commands

### Backend

```bash
cd backend

# Start development server
php artisan serve

# Run migrations
php artisan migrate

# Seed database
php artisan db:seed

# Generate prices
php artisan app:generate-crypto-prices

# Reset database
php artisan migrate:fresh --seed

# Check system
php system-check.php
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📊 Database

### Tables
- **users** - User accounts (admin/client)
- **cryptocurrencies** - 10 supported cryptos
- **cryptocurrency_prices** - 30-day history
- **wallet_transactions** - Buy/sell records

### Connection Details
```
Host: 127.0.0.1
Port: 3306
User: root
Password: (empty)
Database: bitchest
```

---

## 🔑 API Quick Reference

### Authentication
```
POST   /api/login            - Login with email/password
POST   /api/logout           - Logout
GET    /api/me               - Get current user
```

### Profile
```
PUT    /api/profile          - Update profile
POST   /api/password         - Change password
```

### Cryptocurrencies
```
GET    /api/cryptocurrencies           - List all with prices
GET    /api/cryptocurrencies/{id}/prices - Price history
```

### Admin Only
```
GET    /api/admin/users            - List all users
POST   /api/admin/users            - Create user
GET    /api/admin/users/{id}       - Get user
PUT    /api/admin/users/{id}       - Update user
DELETE /api/admin/users/{id}       - Delete user
```

### Client Only
```
GET    /api/client/wallet          - Get wallet info
GET    /api/client/transactions    - Transaction history
POST   /api/client/transactions    - Record transaction (buy/sell)
```

---

## 👤 Admin Features

1. **User Management**
   - View all users
   - Create new users (auto-generated password)
   - Edit user information
   - Delete users

2. **Cryptocurrency Viewing**
   - See all supported cryptocurrencies
   - View current prices
   - See 30-day price history

---

## 💼 Client Features

1. **Wallet Management**
   - View EUR balance
   - See owned cryptocurrencies
   - View average purchase prices
   - See profit/loss values

2. **Transactions**
   - Buy cryptocurrency (deducts balance)
   - Sell cryptocurrency (adds balance)
   - View transaction history
   - See transaction dates and prices

3. **Price Information**
   - View current prices for all cryptos
   - See 30-day price history
   - View charts (if chart library integrated)

4. **Account Management**
   - Update personal information
   - Change password

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check PHP version
php -v

# Check Laravel
php artisan --version

# Clear Laravel cache
php artisan cache:clear
php artisan config:clear
```

### Database Connection Error
```bash
# Verify MySQL is running
# Windows: services.msc → MySQL
# Mac: brew services list

# Check .env credentials
cat backend/.env | grep DB_

# Verify database exists
mysql -u root -e "SHOW DATABASES;"
```

### Frontend Can't Connect to API
```bash
# Check backend is running
curl http://localhost:8000/api/login

# Check .env in frontend
cat frontend/.env

# Check for CORS errors in browser console (F12)
```

### Port Already in Use
```bash
# Windows - Check port 8000
netstat -ano | findstr ":8000"

# Windows - Kill process (replace PID)
taskkill /PID <PID> /F

# Linux/Mac - Kill process on port 8000
lsof -i :8000 | grep -v PID | awk '{print $2}' | xargs kill -9
```

---

## 📈 Example Workflow

### As Admin
1. Login with admin credentials
2. Navigate to "Manage Users"
3. Click "Create User"
4. Enter name and email
5. Copy the generated temporary password
6. Provide password to new user
7. View user balance and transactions

### As Client
1. Login with client credentials
2. View wallet with current balance
3. See owned cryptocurrencies
4. Click "Buy" to purchase crypto
5. Enter amount and confirm
6. Watch balance update immediately
7. View profit/loss calculations
8. Click "Sell" to liquidate positions

---

## 🔒 Security Features

- ✅ Passwords hashed with bcrypt
- ✅ Session-based authentication
- ✅ Role-based access control
- ✅ CSRF protection
- ✅ SQL injection prevention
- ✅ CORS properly configured
- ✅ Sensitive data not exposed in API

---

## 📱 Responsive Design

Application works on:
- ✅ Desktop browsers
- ✅ Tablets (landscape & portrait)
- ✅ Mobile phones
- ✅ All modern browsers (Chrome, Firefox, Safari, Edge)

---

## 💾 Important Files

| File | Purpose |
|------|---------|
| `backend/.env` | Backend configuration |
| `frontend/.env` | Frontend configuration |
| `backend/app/Models/*.php` | Database models |
| `backend/app/Http/Controllers/*.php` | API logic |
| `backend/routes/api.php` | Route definitions |
| `frontend/src/utils/api.ts` | API client |
| `frontend/src/state/AuthContext.tsx` | Auth state |

---

## 🧪 Test Data

### Cryptocurrencies (10 Total)
- Bitcoin (BTC) - ~€42,000
- Ethereum (ETH) - ~€2,500
- Ripple (XRP) - ~€0.50
- Bitcoin Cash (BCH) - ~€450
- Cardano (ADA) - ~€0.45
- Litecoin (LTC) - ~€85
- NEM (XEM) - ~€0.004
- Stellar (XLM) - ~€0.10
- IOTA (MIOTA) - ~€0.20
- Dash (DASH) - ~€65

### Test Transactions
- Bruno has 0.4 BTC at avg price €18,500
- Bruno has 0.1 BTC at avg price €25,200
- Bruno has 1.5 ETH at avg price €1,450
- Bruno's balance: €1,250

---

## 📞 Support

For detailed information, see:
- **SETUP_GUIDE.md** - Complete setup instructions
- **PROJECT_COMPLETION.md** - Project details
- **DEPLOYMENT_CHECKLIST.md** - Verification steps
- **README.md** - Full documentation

---

## Version Info
- **PHP**: 8.4+
- **Laravel**: 12
- **Node.js**: 16+
- **React**: 18+
- **Vite**: 5+
- **MySQL**: 5.7+

**Last Updated**: November 22, 2025
