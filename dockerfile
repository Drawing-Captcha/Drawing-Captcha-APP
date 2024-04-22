FROM node:17

WORKDIR /var/app

COPY . .

RUN npm install

EXPOSE 90

CMD ["node", "index.js"]