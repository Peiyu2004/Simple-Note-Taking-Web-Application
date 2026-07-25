FROM node:20-alpine

WORKDIR /app

# Copy package configuration
COPY package*.json ./

# Install packages without forcing C++ source compilation
RUN npm install

# Copy application code
COPY . .

EXPOSE 5000

CMD ["npm", "start"]