FROM nginx:stable-alpine

# elimina config default y copia la configuración de nginx
RUN rm /etc/nginx/conf.d/default.conf
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# copia el front
COPY ./front /usr/share/nginx/html

# permisos
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]