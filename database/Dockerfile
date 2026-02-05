# Dockerfile para el servicio de base de datos
FROM postgres:18-alpine3.22

# Copiar script de inicialización
COPY ./init.sql /docker-entrypoint-initdb.d/init.sql

EXPOSE 5432
