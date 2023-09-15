FROM node:20-alpine

ENV MONGO_DB_USERNAME=${MONGO_DB_USERNAME} \
    MONGO_DB_PASSWORD=${MONGO_DB_PASSWORD}

COPY package*.json /app/

COPY src /app/src/

WORKDIR /app

RUN npm install

CMD ["node", "/app/src/server.js"] 