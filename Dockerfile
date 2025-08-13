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

# Desactivar telemetría de Next (opcional, evita ruido)
ENV NEXT_TELEMETRY_DISABLED=1

# EJECUTAR LOS ICONOS (si no existe el generador, no rompas el build)
RUN npm run build:icons || echo "Skipping icons generation"

# Construir la aplicación para producción
RUN npm run build

# Exponer el puerto que usa Next.js (por defecto 3000)
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "run", "start"]
