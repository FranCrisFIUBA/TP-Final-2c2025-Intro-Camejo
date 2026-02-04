FROM nginx:stable-alpine

# instalar envsubst
RUN apk add --no-cache gettext

# eliminar config default
RUN rm /etc/nginx/conf.d/default.conf

# copiar template de nginx desde front/nginx
COPY ./nginx/default.conf.template /etc/nginx/templates/default.conf.template

# copiar todo el front (raíz del contexto)
COPY . /usr/share/nginx/html

# permisos
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80

# generar config final con envsubst y arrancar nginx
# esto se hace para poder "cargar" variables de entorno en el front
CMD ["/bin/sh", "-c", "envsubst < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
