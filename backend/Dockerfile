FROM node:20-alpine

# wget usado no healthcheck do docker-compose
RUN apk add --no-cache wget

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 3002

# Banco inicializado via db/bd.sql no Postgres; API sobe direto
CMD ["npm", "start"]
