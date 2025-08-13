# Imagen base con Node
FROM node:20-alpine

# Establecer directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar package.json y package-lock.json para instalar dependencias primero
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de los archivos del proyecto
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Exponer el puerto que usa Next.js (por defecto 3000)
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "run", "start"]
