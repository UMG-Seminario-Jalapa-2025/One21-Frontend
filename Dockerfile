# Use a Node.js base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application (if using React, Angular, Vue, etc.)
RUN npm run build

# Expose the port (adjust according to your frontend)
EXPOSE 3000

# Command to start the application
CMD ["npm", "start"]
