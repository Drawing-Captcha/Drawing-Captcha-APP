FROM node:17

WORKDIR /var/app

COPY . .

RUN npm install

EXPOSE 80

CMD ["node", "app.js"]