
FROM node:25-alpine3.22

WORKDIR /usr/src/app

# instala los paquetes de node al configurar la imagen
COPY package*.json ./
RUN npm install

# copia el resto del codigo fuente
COPY ./src ./src

# expone el puerto 3000
EXPOSE 3000

# al ejecutarse la imagen ejecuta la API
ENTRYPOINT ["node", "./src/app.js"]
