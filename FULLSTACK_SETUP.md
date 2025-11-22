# Running BitChest Fullstack (Frontend + Laravel Backend)

This project contains a React (Vite + TypeScript) frontend at `frontend/` and a Laravel backend at `backend/`.

Minimum dev requirements
- PHP 8.1+
- Composer
- Node.js + npm
- MySQL

Backend quick start (development)
1. Open a terminal and go to `backend`:

```powershell
cd backend
composer install
cp .env.example .env
# edit .env if you need to adjust DB host / port / credentials
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve --host=127.0.0.1 --port=8000
```

Notes:
- `.env.example` uses DB_USERNAME=root and empty password for local development.
- To use SPA session auth you'll want to call `/sanctum/csrf-cookie` from the frontend before POSTing to `/api/login`.

Frontend quick start
1. Open a terminal in `frontend`:

```powershell
cd frontend
npm install
npm run dev
```

2. Make sure `frontend/.env` has `VITE_API_BASE=http://127.0.0.1:8000/api` (default). The frontend will call the backend API and include credentials when required.

Testing auth flows
- From the frontend login page call the `/api/login` endpoint (the SPA will request the CSRF cookie and sends credentials with fetch using credentials:'include').
- The seeders create `admin@bitchest.test` (admin1234) and `client@bitchest.test` (client1234) accounts for development.
