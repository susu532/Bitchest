# BitChest - Deployment & Verification Checklist

## Pre-Launch Checklist

### Backend Requirements
- [ ] PHP 8.4+ installed
- [ ] MySQL 5.7+ installed and running on 127.0.0.1:3306
- [ ] Composer installed
- [ ] backend/.env file configured
- [ ] `composer install` completed in backend/
- [ ] Database `bitchest` created
- [ ] `php artisan migrate:fresh --seed` executed
- [ ] `php artisan app:generate-crypto-prices` executed

### Frontend Requirements
- [ ] Node.js 16+ installed
- [ ] npm installed
- [ ] frontend/.env file configured with `VITE_API_BASE=http://localhost:8000/api`
- [ ] `npm install` completed in frontend/

### File Structure
- [ ] backend/artisan exists
- [ ] backend/.env exists
- [ ] frontend/.env exists
- [ ] start.bat exists (for Windows)
- [ ] start.sh exists (for Linux/Mac)

## Startup Verification

### Windows Users
1. Run: `start.bat`
2. Two command windows should open
3. Backend window shows: `INFO  Server running on [http://127.0.0.1:8000]`
4. Frontend window shows: `VITE v5.x.x  ready in xxx ms`

### Linux/Mac Users
1. Run: `bash start.sh`
2. Or start manually:
   - Terminal 1: `cd backend && php artisan serve`
   - Terminal 2: `cd frontend && npm run dev`

### Expected Output
**Backend:**
```
   INFO  Server running on [http://127.0.0.1:8000].  
   Press Ctrl+C to stop the server
```

**Frontend:**
```
  VITE v... ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

## Access & Login Tests

### Frontend Access
1. Navigate to: http://localhost:5173
2. [ ] Page loads without errors
3. [ ] Login form is visible

### Admin Login Test
1. Email: `admin@bitchest.example`
2. Password: `admin123`
3. [ ] Login succeeds
4. [ ] Redirected to admin dashboard
5. [ ] Can see "Manage Users" option
6. [ ] Can see "Cryptocurrencies" price list
7. [ ] Session persists on page refresh

### Client Login Test
1. Logout first (if needed)
2. Email: `bruno@bitchest.example`
3. Password: `bruno123`
4. [ ] Login succeeds
5. [ ] Redirected to client dashboard
6. [ ] Can see wallet with balance: €1,250
7. [ ] Can see assets (Bitcoin, Ethereum)
8. [ ] Transaction history is visible
9. [ ] Can see Buy/Sell buttons

## Feature Verification

### Authentication Features
- [ ] Login works with correct credentials
- [ ] Login fails with wrong credentials
- [ ] Logout clears session
- [ ] Session persists on page refresh
- [ ] Unauthorized access redirected to login
- [ ] GET /me endpoint returns current user

### Admin Features
- [ ] View all users list
- [ ] Create new user (generates temporary password)
- [ ] Edit user information
- [ ] Delete user (removes from database)
- [ ] View cryptocurrency list with current prices

### Client Features
- [ ] View wallet with EUR balance
- [ ] View owned cryptocurrencies
- [ ] View transaction history
- [ ] See average purchase price
- [ ] Calculate profit/loss
- [ ] Buy cryptocurrency (balance decreases)
- [ ] Sell cryptocurrency (balance increases)
- [ ] See cryptocurrency price history (30 days)

### Profile Features (Both Roles)
- [ ] Update first name
- [ ] Update last name
- [ ] Update email
- [ ] Change password with current password verification

## API Endpoint Tests

### Using Curl/Postman
**Base URL**: http://localhost:8000/api

#### 1. Login
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bitchest.example","password":"admin123"}'
```
- [ ] Returns 200 OK
- [ ] Response includes user object with id, first_name, last_name, email, role

#### 2. Get Current User
```bash
curl -X GET http://localhost:8000/api/me \
  -H "Content-Type: application/json" \
  -b "XSRF-TOKEN=<token>" \
  -b "laravel_session=<session>"
```
- [ ] Returns 200 OK with user details

#### 3. Get Cryptocurrencies
```bash
curl -X GET http://localhost:8000/api/cryptocurrencies \
  -H "Content-Type: application/json"
```
- [ ] Returns 200 OK
- [ ] Response includes array of 10 cryptocurrencies
- [ ] Each crypto has: id, name, symbol, icon, current_price, history array

#### 4. Get Wallet (Client)
```bash
curl -X GET http://localhost:8000/api/client/wallet \
  -H "Content-Type: application/json"
```
- [ ] Returns 200 OK
- [ ] Includes balance_eur
- [ ] Includes assets array with quantities and average prices

#### 5. Record Transaction (Client)
```bash
curl -X POST http://localhost:8000/api/client/transactions \
  -H "Content-Type: application/json" \
  -d '{"cryptocurrency_id":1,"type":"buy","quantity":0.1,"price_per_unit":42000}'
```
- [ ] Returns 201 Created
- [ ] new_balance is updated

#### 6. Get All Users (Admin)
```bash
curl -X GET http://localhost:8000/api/admin/users \
  -H "Content-Type: application/json"
```
- [ ] Returns 200 OK
- [ ] Response is array of users
- [ ] Non-admin access returns 403 Forbidden

## Database Verification

### Check Users Table
```bash
cd backend
php artisan tinker
User::all()
```
- [ ] Should show 2 users (admin and bruno)
- [ ] Passwords are hashed (not readable)
- [ ] Roles are "admin" and "client"

### Check Cryptocurrencies
```bash
Cryptocurrency::count()
```
- [ ] Should return 10

### Check Cryptocurrency Prices
```bash
CryptocurrencyPrice::count()
```
- [ ] Should return 300 (10 cryptos × 30 days)

### Check Wallet Transactions
```bash
WalletTransaction::count()
```
- [ ] Should return at least 0 (can be 0 if no transactions made)

## Browser Console Checks

1. Open browser DevTools (F12)
2. Go to Console tab
3. [ ] No JavaScript errors
4. Go to Network tab
5. Make a login request
6. [ ] API request goes to http://localhost:8000/api/login
7. [ ] Response status is 200
8. [ ] No CORS errors

## Performance Checks

1. [ ] Frontend loads in < 5 seconds
2. [ ] Login response < 1 second
3. [ ] Cryptocurrency list loads < 2 seconds
4. [ ] Wallet data loads < 1 second
5. [ ] No memory leaks (console should be clean)

## Security Checks

- [ ] Passwords are hashed in database (not plain text)
- [ ] Password field hidden in API responses
- [ ] Admin routes return 403 for non-admin users
- [ ] Client routes return 403 for non-client users
- [ ] Session required for protected routes
- [ ] CORS allows frontend origin

## Error Handling

1. [ ] Invalid login shows error message
2. [ ] Insufficient balance prevents buy
3. [ ] Deleted user cannot login
4. [ ] Expired session redirects to login
5. [ ] Network errors show friendly messages

## Data Integrity

1. [ ] Buy transaction: balance decreases by quantity × price
2. [ ] Sell transaction: balance increases by quantity × price
3. [ ] Can't sell more than owned
4. [ ] Transaction history accurate
5. [ ] Average price calculation correct
6. [ ] Profit/loss calculation correct

## Cleanup & Documentation

- [ ] All console.log statements checked
- [ ] No sensitive data in frontend localStorage
- [ ] Error logs are descriptive
- [ ] Code comments are present for complex logic
- [ ] README is up to date
- [ ] API documentation is complete

## Production Readiness

- [ ] All tests pass
- [ ] No console errors or warnings
- [ ] Database backups configured
- [ ] Error monitoring set up
- [ ] Logging configured properly
- [ ] Environment variables secured
- [ ] CORS configured for production domain

## Deployment Notes

### For Production:
1. Update `.env` files with production values
2. Set `APP_ENV=production` in backend/.env
3. Set `APP_DEBUG=false` in backend/.env
4. Configure MySQL with proper user/password
5. Use HTTPS for all endpoints
6. Configure web server (Apache/Nginx)
7. Set proper file permissions
8. Run `php artisan optimize` before deployment

### Backup Strategy:
- [ ] Daily database backups
- [ ] Document backup restoration process
- [ ] Test backup restoration regularly

## Final Sign-Off

- [ ] All checklist items completed
- [ ] Testing completed successfully
- [ ] No outstanding issues
- [ ] Ready for production deployment

---

**Date Completed**: _______________
**Tested By**: _______________
**Approved By**: _______________

**Deployment Status**: [ ] Ready  [ ] Pending  [ ] On Hold
