FROM node:latest

COPY package*.json ./

RUN npm install

COPY . .

ENV TZ=Asia/Jakarta


CMD ["node", "pairingCode"]
