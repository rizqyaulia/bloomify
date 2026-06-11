# Bloomify Laravel 12 API

This folder contains the Laravel 12 backend contract and implementation files for the Bloomify storefront.

The API is PostgreSQL-first. Copy `.env.example` to `.env`, set the PostgreSQL credentials, then run:

```bash
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
```

Default API base URL for the Next.js storefront:

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
```
