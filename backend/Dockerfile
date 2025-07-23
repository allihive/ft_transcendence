FROM node:20-alpine3.21

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN chmod +x entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["sh", "entrypoint.sh"]

CMD ["npm", "start"]