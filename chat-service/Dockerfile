# Use Node.js 22 with AlpineAdd commentMore actions
FROM node:22-alpine

# Create and set the working directory (corrected path)
WORKDIR /usr/src/app

# Copy dependency files first
COPY package*.json ./

# Install all dependencies including devDependencies (needed for ts-node)
RUN npm install --force

# Copy the entire project
COPY . .

# Expose the application port
EXPOSE 3000

# Start the app using ts-node
CMD ["npx", "ts-node", "src/server.ts"]