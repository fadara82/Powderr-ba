# Koristi oficijelnu PHP sliku
FROM php:8.2-cli

# Instaliraj potrebne ekstenzije
RUN docker-php-ext-install pdo pdo_mysql

# Instaliraj Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Postavi radni direktorij
WORKDIR /app

# Kopiraj sve fajlove u kontejner
COPY . .

# Instaliraj dependencije
RUN composer install --no-dev --optimize-autoloader

# Otvori port koji Render koristi
EXPOSE 10000

# Pokreni PHP built-in server i postavi public kao root
CMD ["php", "-S", "0.0.0.0:10000", "-t", "public"]
