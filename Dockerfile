FROM node:latest

ENV TZ=Asia/Jakarta
RUN npm install

CMD ["node", "index.js"]
