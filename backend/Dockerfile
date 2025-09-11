FROM php:8.2-cli

# Instalacija potrebnih paketa i PHP ekstenzija
RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libpng-dev libonig-dev \
    && docker-php-ext-install pdo pdo_mysql zip gd mbstring \
    && rm -rf /var/lib/apt/lists/*

# Dodaj Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Kopiraj composer fajlove prvo (za cache)
COPY composer.json composer.lock* ./

# Instaliraj dependencije
RUN composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader

# Kopiraj ostatak aplikacije
COPY . .

# Render koristi PORT varijablu (default 10000)
ENV PORT=10000
EXPOSE 10000

# Pokreni ugrađeni PHP server
CMD ["php", "-S", "0.0.0.0:10000", "-t", "public", "public/index.php"]
