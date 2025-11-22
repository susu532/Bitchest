# 📚 BitChest - Documentation Index

Welcome to BitChest! This file guides you to the right documentation.

---

## 🎯 Start Here

### 🚀 I Want to Run the Application
→ Go to **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)**
- Quick start commands
- Test credentials
- Port information
- Common commands

### 📖 I Want Detailed Setup Instructions
→ Go to **[SETUP_GUIDE.md](SETUP_GUIDE.md)**
- Complete prerequisites
- Step-by-step backend setup
- Step-by-step frontend setup
- Database configuration
- API documentation

### ✅ I Want to Verify Everything Works
→ Go to **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)**
- Pre-launch checklist
- Startup verification
- Feature testing
- API endpoint tests
- Database verification

### 📊 I Want to Know What Was Built
→ Go to **[PROJECT_COMPLETION.md](PROJECT_COMPLETION.md)**
- Complete project summary
- Features implemented
- Statistics and metrics
- Technical details

### 🔍 I Want General Information
→ Go to **[README.md](README.md)**
- Project overview
- Architecture details
- Feature list
- Troubleshooting

---

## 📋 Quick Navigation

| Document | Purpose | Read Time |
|----------|---------|-----------|
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Fast commands and shortcuts | 5 min |
| [README.md](README.md) | Project overview and features | 10 min |
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Complete setup instructions | 20 min |
| [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | Verification checklist | 30 min |
| [PROJECT_COMPLETION.md](PROJECT_COMPLETION.md) | Detailed project summary | 15 min |

---

## 🎬 Getting Started (30 seconds)

1. **Prerequisites**: Ensure MySQL, PHP 8.4+, and Node.js 16+ are installed
2. **Windows Users**: Double-click `start.bat`
   - **Linux/Mac Users**: Run `bash start.sh`
3. **Wait**: Both servers start in new terminals
4. **Open**: http://localhost:5173
5. **Login**: Use admin@bitchest.example / admin123

---

## 📂 Project Structure

```
Bitchest/
├── backend/                          # Laravel API Server
│   ├── app/
│   │   ├── Console/Commands/         # CLI Commands
│   │   ├── Http/Controllers/         # Request Handlers
│   │   ├── Http/Middleware/          # Request Middleware
│   │   └── Models/                   # Database Models
│   ├── database/
│   │   ├── migrations/               # Database Schema
│   │   └── seeders/                  # Initial Data
│   ├── routes/api.php                # API Routes
│   ├── .env                          # Config
│   └── artisan                       # Command Runner
│
├── frontend/                         # React Application
│   ├── src/
│   │   ├── components/               # React Components
│   │   ├── pages/                    # Page Components
│   │   ├── state/                    # Context State
│   │   ├── utils/api.ts              # API Client
│   │   ├── App.tsx                   # Root Component
│   │   └── main.tsx                  # Entry Point
│   ├── .env                          # Config
│   └── package.json                  # Dependencies
│
├── Documentation/
│   ├── README.md                     # Main Documentation
│   ├── SETUP_GUIDE.md               # Setup Instructions
│   ├── QUICK_REFERENCE.md           # Quick Commands
│   ├── PROJECT_COMPLETION.md        # Project Summary
│   ├── DEPLOYMENT_CHECKLIST.md      # Verification
│   └── INDEX.md                      # This File
│
└── Startup Scripts/
    ├── start.bat                     # Windows Startup
    └── start.sh                      # Linux/Mac Startup
```

---

## 🔑 Default Credentials

### Admin Account
- **Email**: admin@bitchest.example
- **Password**: admin123
- **Balance**: €500
- **Role**: Administrator

### Client Account
- **Email**: bruno@bitchest.example
- **Password**: bruno123
- **Balance**: €1,250
- **Role**: Regular Client

---

## 🌐 URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | React UI |
| Backend API | http://localhost:8000/api | REST API |
| Backend Server | http://localhost:8000 | Web Server |

---

## 📊 What's Included

### Database
- ✅ 2 User accounts (admin + client)
- ✅ 10 Cryptocurrencies
- ✅ 300 Historical prices (30 days × 10 cryptos)
- ✅ Sample transactions for client

### Backend
- ✅ 25+ API endpoints
- ✅ Role-based access control
- ✅ Session-based authentication
- ✅ Input validation
- ✅ Error handling

### Frontend
- ✅ Login page
- ✅ Admin dashboard
- ✅ Client dashboard
- ✅ User management
- ✅ Wallet view
- ✅ Transaction management
- ✅ Price charts

---

## 🚀 Quick Commands

### Backend
```bash
cd backend
php artisan serve                      # Start server
php artisan migrate:fresh --seed       # Reset database
php artisan app:generate-crypto-prices # Generate prices
php system-check.php                   # Check setup
```

### Frontend
```bash
cd frontend
npm install                            # Install dependencies
npm run dev                            # Start dev server
npm run build                          # Build for production
```

### Both Servers
```bash
start.bat                              # Windows - Start both
bash start.sh                          # Linux/Mac - Start both
```

---

## 🐛 Troubleshooting

### Problem: Backend won't start
→ See **[SETUP_GUIDE.md - Troubleshooting](SETUP_GUIDE.md#troubleshooting)**

### Problem: Can't connect to API
→ See **[QUICK_REFERENCE.md - Troubleshooting](QUICK_REFERENCE.md#-troubleshooting)**

### Problem: Database errors
→ See **[SETUP_GUIDE.md - Database Configuration](SETUP_GUIDE.md#database-configuration)**

---

## 📱 Features by Role

### Admin Can:
- View all users
- Create users with temp passwords
- Edit user information
- Delete users
- View cryptocurrency prices
- See all transactions

### Client Can:
- Update profile
- Change password
- Buy cryptocurrencies
- Sell cryptocurrencies
- View wallet balance
- See transaction history
- View profit/loss
- See price history

---

## 🔐 Security

- ✅ Passwords hashed with bcrypt
- ✅ Session-based authentication
- ✅ Role-based middleware
- ✅ CSRF protection
- ✅ CORS configured
- ✅ Input validation
- ✅ SQL injection prevention

---

## 📈 Performance

- ✅ Database queries optimized with eager loading
- ✅ No N+1 query problems
- ✅ Efficient state management
- ✅ Minimal API payloads
- ✅ Browser caching enabled

---

## 🎓 Technology Stack

### Backend
- Laravel 12 - PHP Framework
- MySQL - Relational Database
- Composer - PHP Package Manager

### Frontend
- React 18 - UI Framework
- TypeScript - Type-safe JavaScript
- Vite - Build Tool
- npm - Package Manager

### DevOps
- PHP 8.4+ - Server Runtime
- Node.js 16+ - JavaScript Runtime
- Bash/Batch - Scripts

---

## 📞 Support

**For quick answers**: Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

**For setup help**: Read [SETUP_GUIDE.md](SETUP_GUIDE.md)

**For verification**: Use [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

**For details**: See [PROJECT_COMPLETION.md](PROJECT_COMPLETION.md)

---

## 📅 Project Status

✅ **Complete** - November 22, 2025

- ✅ Backend fully implemented
- ✅ Frontend fully implemented
- ✅ Database configured
- ✅ All features working
- ✅ Documentation complete
- ✅ Ready for deployment

---

## 🎯 Next Steps

1. **Review** the [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
2. **Start** the application with `start.bat` (Windows) or `bash start.sh` (Linux/Mac)
3. **Login** with test credentials
4. **Test** the features
5. **Refer** to [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for comprehensive verification

---

**Version**: 1.0.0  
**Last Updated**: November 22, 2025  
**Status**: ✅ Production Ready
