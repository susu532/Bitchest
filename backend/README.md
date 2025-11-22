# BitChest backend (Laravel)

This folder contains a Laravel backend scaffold for the BitChest project.

Quick start (development)
1. Install dependencies and create `.env`:

```powershell
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

2. Configure `.env` (MySQL dev defaults use `DB_USERNAME=root` with an empty password)

3. Set up database and seed:

```powershell
php artisan migrate
php artisan db:seed
```

4. Run dev server:

```powershell
php artisan serve --host=127.0.0.1 --port=8000
```

Notes
- Session/cookie auth is enabled via Laravel Sanctum. The SPA should obtain the CSRF cookie from `/sanctum/csrf-cookie` before POST /api/login.
