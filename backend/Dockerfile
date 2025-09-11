FROM php:8.2-cli

# Instalacija potrebnih paketa i PHP ekstenzija
RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libpng-dev libonig-dev \
    && docker-php-ext-install pdo pdo_mysql zip gd mbstring \
    && rm -rf /var/lib/apt/lists/*

# Dodaj Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Postavi radni direktorij na backend
WORKDIR /app

# Kopiraj composer fajlove PRVO (da Docker cache radi)
COPY backend/composer.json backend/composer.lock* ./

# Instaliraj PHP dependencije
RUN composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader

# Kopiraj ostatak aplikacije
COPY backend/ .

# Render očekuje PORT iz env
ENV PORT=10000
EXPOSE 10000

# Pokreni Flight preko PHP built-in servera
CMD ["php", "-S", "0.0.0.0:10000", "-t", "public", "public/index.php"]
