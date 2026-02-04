# Código generado usando ChatGPT
FROM nginx:stable-alpine

# Instalar envsubst
RUN apk add --no-cache gettext

# Eliminar config default y usar template
RUN rm /etc/nginx/conf.d/default.conf
COPY ./nginx/default.conf.template /etc/nginx/templates/default.conf.template

# Copiar template de config.js para reemplazar API_URL
COPY ./JS/config.js.template /usr/share/nginx/html/JS/config.js.template

# Copiar todo el front (ya estamos en la raíz del proyecto front)
COPY . /usr/share/nginx/html

# Permisos
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80

# Generar config.js con envsubst y luego iniciar nginx
CMD ["/bin/sh", "-c", "\
  envsubst '\$API_URL' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && \
  envsubst '\$API_URL' < /usr/share/nginx/html/JS/config.js.template > /usr/share/nginx/html/JS/config.js && \
  nginx -g 'daemon off;' \
"]
