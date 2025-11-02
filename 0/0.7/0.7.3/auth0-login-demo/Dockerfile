# Imagen base
FROM node:18

# Crear directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos del proyecto
COPY package*.json ./
RUN npm install

COPY . .

# Exponer puerto
EXPOSE 3000

# Comando de arranque
CMD ["npm", "start"]
