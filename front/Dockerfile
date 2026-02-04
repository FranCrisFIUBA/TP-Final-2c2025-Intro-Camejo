FROM nginx:stable-alpine

# instalar envsubst
RUN apk add --no-cache gettext

# elimina config default
RUN rm /etc/nginx/conf.d/default.conf

# usar template en lugar de conf directo
COPY ./nginx/default.conf.template /etc/nginx/templates/default.conf.template

# copia el front
COPY ./front /usr/share/nginx/html

# permisos
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80

# generar config final con envsubst y arrancar nginx
# esto se hace para poder "cargar" variables de entorno en el front
CMD envsubst '$API_URL' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf \
 && nginx -g 'daemon off;'