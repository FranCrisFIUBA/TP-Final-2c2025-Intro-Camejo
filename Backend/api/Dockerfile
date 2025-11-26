FROM node:20-alpine

WORKDIR /usr/src/app

# instala los paquetes de node al configurar la imagen
COPY package*.json ./
RUN npm install

# copia el resto del codigo fuente
COPY . .

# expone el puerto 3000
EXPOSE 3000

# al ejecutarse la imagen ejecuta la API
ENTRYPOINT ["node", "./src/app.js"]
