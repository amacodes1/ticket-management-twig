# Use official PHP image with Apache
FROM php:8.2-apache

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Copy project files to web root
COPY . /var/www/html/

# Set working directory
WORKDIR /var/www/html/

# Install dependencies
RUN composer install

# Set permissions
RUN chown -R www-data:www-data /var/www/html