FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libpng-dev libonig-dev \
    && docker-php-ext-install pdo pdo_mysql zip gd mbstring \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock* ./

RUN composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader

COPY . .

ENV PORT=10000
EXPOSE 10000

# Pokrećemo PHP server direktno sa index.php u rootu
CMD ["php", "-S", "0.0.0.0:10000", "index.php"]
