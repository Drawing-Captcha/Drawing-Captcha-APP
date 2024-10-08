<h1 align="center" id="title">Drawing Captcha App (Alpha)🛡️</h1>

<p align="center">
<img src="https://wpesicdev.github.io/Drawing-Captcha-Demo-Alpha/assets/shots%20(2).png" alt="project-image">
</p>

## Description

Drawing Captcha is an innovative and engaging software designed to verify human users through interactive drawing tasks. 🖌️ Users are prompted to complete specific patterns or color in logos on a grid, ensuring a secure 🔒 and enjoyable 😊 verification process. This unique approach not only enhances security but also promotes brand awareness by incorporating recognizable brand elements into the captchas.

With Drawing Captcha, you can easily create, modify, and design your own captchas to suit your specific needs. 🛠️ The user-friendly interface allows for a seamless experience, making it accessible to users of all skill levels. Whether you want to enhance security, boost brand recognition, or simply provide a fun user interaction, Drawing Captcha is the perfect solution. 🎨

## 🚀 Demo

[Drawing Captcha Demo](https://wpesicdev.github.io/Drawing-Captcha-Demo-Alpha/)

## Project Screenshots

<img src="https://wpesicdev.github.io/Drawing-Captcha-Demo-Alpha/assets/Demo2.png" alt="project-screenshot" width="100%" height="400%">
<br><br><br>
<img src="https://wpesicdev.github.io/Drawing-Captcha-Demo-Alpha/assets/Demo1.png" alt="project-screenshot" width="100%">

## 🧐 Features

Here are some of the project's best features:

- RBAC
- Captcha Settings
- API Functionality
- Origins Management
- Captcha Management
- CORS Protection
- Everything stored in MongoDB
- User Management
- Organization Management
- EASY IMPLEMENTATION!

## 🛠️ Installation Steps

### Usage with Docker / Docker-Compose

1. Clone this project:
   ```sh
   git clone https://github.com/wpesicdev/drawing-captcha-app-alpha.git
   ```
2. Create and change your `.env` settings:

<p>I have added a `.env.example`. You can just rename this file to `.env`.</p>

   ```env
   MONGO_INITDB_ROOT_USERNAME=root
   MONGO_INITDB_ROOT_PASSWORD=rootTest
   MONGO_INITDB_DATABASE=drawing-captcha

   # For local development
   # MONGO_URI="mongodb://localhost:7500/drawing-captcha"
   # For deployment
   MONGO_URI="mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@dc_mongo:27017/${MONGO_INITDB_DATABASE}?authSource=admin"

   # Enter here your domain where you want to host your Drawing Captcha. Important: enter it with http/https
   SERVER_DOMAIN="https://yourdomain.com"

   # Port of your server
   PORT=9091

   # This will automatically be reset:
   REGISTER_KEY="&&+%&%ajkhdjhWIIWNw7>dajh2gg"

   # Change this email!!
   DC_ADMIN_EMAIL="your@mail.com"

   # Change this password!!!
   DC_ADMIN_PASSWORD="admin"
   ```

Please note to change these variables:
- MONGO_INITDB_ROOT_USERNAME
- MONGO_INITDB_ROOT_PASSWORD
- SERVER_DOMAIN (if you want to host it somewhere)
- DC_ADMIN_EMAIL
- DC_ADMIN_PASSWORD

3. Final steps:
   ```sh
   docker-compose up --build -d
   ```

<p>If you haven't changed the default port, it should be working on http://localhost:9091.</p>

## Docker Compose with Dockerhub Image
```yml
version: "3.8"

services:
  dc_node:
    container_name: dc_node
    image: williamspesic/drawing-captcha-app:latest
    ports:
      - "9091:9091"
    networks:
      - dc_network
    depends_on:
      - dc_mongo
    restart: always
    environment:
      - MONGO_URI=${MONGO_URI}
      - PORT=${PORT}
      - SERVER_DOMAIN=${SERVER_DOMAIN}
      - Register_Key=${Register_Key}
      - DC_ADMIN_EMAIL=${DC_ADMIN_EMAIL}
      - DC_ADMIN_PASSWORD=${DC_ADMIN_PASSWORD}
  dc_mongo:
    container_name: dc_mongo
    image: mongo:latest
    expose:
      - "27017"
    volumes:
      - drawing-captcha:/data/db
    networks:
      - dc_network
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_INITDB_ROOT_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_INITDB_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: ${MONGO_INITDB_DATABASE}

networks:
  dc_network:

volumes:
  drawing-captcha:
```

## Tutorials and implementation Frontend (Connection with API will be comming soon :) )
You will find the docs here soon : https://docs.captcha.wpesic.dev

## 🍰 Contribution Guidelines

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement". Don't forget to give the project a star! Thanks again!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## 💻 Built with

Technologies used in the project:

- Node JS
- Docker
- EJS
- HTML
- CSS
- JavaScript

## 💖 Like my work?
Buy me a coffee: https://www.buymeacoffee.com/williamspe8


## License

Distributed under the MIT License. See [MIT License](https://opensource.org/licenses/MIT) for more information.

## Contact

- info@wpesic.dev
