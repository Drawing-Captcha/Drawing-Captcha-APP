
<a id="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<br />
<div align="center">
  <a href="https://github.com/Drawing-Captcha/Drawing-Captcha-APP">
    <img src="./public/images/favicon.ico" alt="Logo" width="80" height="80">
  </a>

  <h1 align="center">Drawing-Captcha APP</h3>

  <p align="center">
    Boost security and brand awareness with Drawing Captcha, the fun and interactive way to verify users!
    <br />
    <a href="https://docs.drawing-captcha.com"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://demo.drawing-captcha.com">View Demo</a>
    &middot;
    <a href="https://github.com/Drawing-Captcha/Drawing-Captcha-APP/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/Drawing-Captcha/Drawing-Captcha-APP/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>



<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li><a href="#drawing-captcha-request-flow">Request Flow</a></li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#docker-compose-setup">Docker Compose Setup</a></li>
        <li><a href="#docker-compose-image-setup">Docker Compose Setup with Image</a></li>
      </ul>
    </li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#usefull-links">Usefull Links</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

## About The Project

[![Product Name Screen Shot][product-screenshot]](https://github.com/user-attachments/assets/cc1ef188-2cd6-4d73-94fe-8ac191a52926)

I couldn’t find a captcha solution that combined security, creativity, and branding in a way that felt truly engaging—so I created Drawing-Captcha. It’s designed to make user verification fun, secure, and memorable.

Here’s why you’ll love it:
* Focus on building something awesome while Drawing-Captcha handles security.
* Say goodbye to boring, frustrating captchas and hello to interactive, creative tasks.
* Promote your brand effortlessly by integrating logos and custom designs into the captcha experience.

Of course, no single solution fits every project perfectly. That’s why Drawing-Captcha is open-source and always evolving. Feel free to fork the repo, submit a pull request, or open an issue to contribute your ideas. Let’s build the future of user verification together! 🎨✨

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* ![Mongo][MongoDB]
* ![NodeJS][NodeJS]
* ![ExpressJS][ExpressJS]
* ![EJS][EJS]
* ![JS][JS]
* ![Docker][Docker]
* ![HTML][HTML]
* ![CSS][CSS]



<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Drawing-Captcha Request Flow
This is the request flow for the Drawing-Captcha environment. It demonstrates how to use the Drawing-Captcha API and explains its communication process with the frontend.

![Request Flow Drawing Captcha][Request-Flow-Drawing-Captcha]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

This repository contains the Drawing Captcha APP, which is required for the Drawing Captcha to function. It communicates with the Captcha JS library, which can be installed via npm: `@drawing-captcha/drawing-captcha-frontend`.

Alternatively, you can use the CDN: `https://cdn.drawing-captcha.com/captcha.js`.

To learn how to integrate it and enable communication with your Drawing Captcha app instance, please refer to the README in this repository: <https://github.com/Drawing-Captcha/Drawing-Captcha-Frontend>.


### Docker Compose Setup

#### Clone this project:
  ```sh
  git clone https://github.com/wpesicdev/drawing-captcha-app-alpha.git
  ```
#### Create and change your `.env` settings:

<p>I have added a `.env.example`. You can just rename this file to `.env`.</p>

   ```env
   MONGO_INITDB_ROOT_USERNAME=root
   MONGO_INITDB_ROOT_PASSWORD=rootTest
   MONGO_INITDB_DATABASE=drawing-captcha

   # For local development
   # NODE_ENV=development
   # MONGO_URI="mongodb://localhost:7500/drawing-captcha"
   # For deployment
   MONGO_URI="mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@dc_mongo:27017/${MONGO_INITDB_DATABASE}?authSource=admin"

   # Enter here your domain where you want to host your Drawing Captcha. Important: enter it with http/https
   APP_URL="https://yourdomain.com"

   # Port of your server
   PORT=9091

   # IMPORTANT: Set a strong session secret (required in production)
   # Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   SESSION_SECRET="CHANGE_THIS_TO_A_RANDOM_SECRET_STRING"

   # This will automatically be reset:
   REGISTER_KEY="&&+%&%ajkhdjhWIIWNw7>dajh2gg"

   # Change this email!!
   DC_ADMIN_EMAIL="your@mail.com"

   # Change this password!!!
   DC_ADMIN_PASSWORD="admin"

   # Defines how long a solved Session can be called back to verify
   JWT_TOKEN_EXPIRATION=5

   #Email settings
   EMAIL_SERVICE= #smtpAuth || postmark 
   EMAIL_FROM=noreply@drawing-captcha.com
   
   SMTPAUTH_EMAIL_HOST=
   SMTPAUTH_EMAIL_PORT=
   SMTPAUTH_EMAIL_USER=
   SMTPAUTH_EMAIL_PASS=
   
   POSTMARK_SERVER_CLIENT=
   POSTMARK_MESSAGE_STREAM=

   #OAUTH2 Setup & Login
   # You can set this to false if you want to use the basic login with username and password (and for example just use oAuth2 for registration / logins) this is per default set to true
   BASIC_AUTH=true
   # For Google OAuth2
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   # For Microsoft OAuth2
   MICROSOFT_CLIENT_ID=
   MICROSOFT_CLIENT_SECRET=
   #if none is given the default is "common"
   MICROSOFT_TENANT_ID=
   #OpenTelemetry HTTPS endpoint
   OTEL_EXPORTER_OTLP_ENDPOINT="http://127.0.0.1:4318/v1/logs"

   ```

For more information on the environment variables, refer to the [official documentation](https://docs.drawing-captcha.com/documentation/#section-environment).

Please note to change these variables:
- MONGO_INITDB_ROOT_USERNAME
- MONGO_INITDB_ROOT_PASSWORD
- SESSION_SECRET (REQUIRED for production - generate a strong random string)
- APP_URL (if you want to host it somewhere)
- DC_ADMIN_EMAIL
- DC_ADMIN_PASSWORD
- DC_ADMIN_PASSWORD

#### Final steps:
```sh
docker-compose up --build -d
```

<p>If you haven't changed the default port, it should be working on http://localhost:9091.</p>

### Docker Compose Image Setup
```yml
version: "3.8"
services:
  dc_node:
    container_name: dc_node
    image: williamspesic/drawing-captcha-app:latest
    ports:
      - 9091:9091
    networks:
      - dc_network
      - nginx_default
    depends_on:
      - dc_mongo
    restart: always
    environment:
      MONGO_URI: ${MONGO_URI}
      PORT: ${PORT}
      APP_URL: ${APP_URL}
      SESSION_SECRET: ${SESSION_SECRET}
      REGISTER_KEY: ${REGISTER_KEY}
      DC_ADMIN_EMAIL: ${DC_ADMIN_EMAIL}
      DC_ADMIN_PASSWORD: ${DC_ADMIN_PASSWORD}
      EMAIL_SERVICE: ${EMAIL_SERVICE}
      EMAIL_FROM: ${EMAIL_FROM}
      SMTPAUTH_EMAIL_HOST: ${SMTPAUTH_EMAIL_HOST}
      SMTPAUTH_EMAIL_PORT: ${SMTPAUTH_EMAIL_PORT}
      SMTPAUTH_EMAIL_USER: ${SMTPAUTH_EMAIL_USER}
      SMTPAUTH_EMAIL_PASS: ${SMTPAUTH_EMAIL_PASS}
      POSTMARK_SERVER_CLIENT: ${POSTMARK_SERVER_CLIENT}
      POSTMARK_MESSAGE_STREAM: ${POSTMARK_MESSAGE_STREAM}
      BASIC_AUTH: ${BASIC_AUTH}
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
      MICROSOFT_CLIENT_ID: ${MICROSOFT_CLIENT_ID}
      MICROSOFT_CLIENT_SECRET: ${MICROSOFT_CLIENT_SECRET}

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
  nginx_default:
    external: true

volumes:
  drawing-captcha:
```


<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage
Implementation step by step: https://github.com/Drawing-Captcha/Drawing-Captcha-Frontend/blob/main/README.md#implementation-guide

Demo Site: https://demo.drawing-captcha.com

_For more examples, please refer to the [Documentation](https://docs.drawing-captcha.com)_

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Top contributors:

<a href="https://github.com/Drawing-Captcha/Drawing-Captcha-APP/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Drawing-Captcha/Drawing-Captcha-APP" alt="contrib.rocks image" />
</a>

<p align="right">(<a href="#readme-top">back to top</a>)</p>



## License

Distributed under the MIT License. See [MIT License](https://opensource.org/licenses/MIT) for more information.

## Contact

info@wpesic.dev

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Usefull Links
* [Drawing Captcha Documentation Hub](https://docs.drawing-captcha.com/documentation/)
* [Drawing Captcha for Umbraco](https://marketplace.umbraco.com/package/drawingcaptcha)
* [Drawing Captcha NPM Package Frontend Integration](https://www.npmjs.com/package/@drawing-captcha/drawing-captcha-frontend?activeTab=readme)


## Acknowledgments

* [Img Shields](https://shields.io)
* [ReadMe Template](https://github.com/othneildrew/Best-README-Template)


<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 💖 Like my work?
Buy me a coffee: https://www.buymeacoffee.com/williamspe8

[contributors-shield]: https://img.shields.io/github/contributors/Drawing-Captcha/Drawing-Captcha-APP.svg?style=for-the-badge
[contributors-url]: https://github.com/Drawing-Captcha/Drawing-Captcha-APP/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Drawing-Captcha/Drawing-Captcha-APP.svg?style=for-the-badge
[forks-url]: https://github.com/Drawing-Captcha/Drawing-Captcha-APP/network/members
[stars-shield]: https://img.shields.io/github/stars/Drawing-Captcha/Drawing-Captcha-APP.svg?style=for-the-badge
[stars-url]: https://github.com/Drawing-Captcha/Drawing-Captcha-APP/stargazers
[issues-shield]: https://img.shields.io/github/issues/Drawing-Captcha/Drawing-Captcha-APP.svg?style=for-the-badge
[issues-url]: https://github.com/Drawing-Captcha/Drawing-Captcha-APP/issues
[license-shield]: https://img.shields.io/github/license/Drawing-Captcha/Drawing-Captcha-APP.svg?style=for-the-badge
[license-url]: https://github.com/Drawing-Captcha/Drawing-Captcha-APP/blob/master/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/wpesicdev
[product-screenshot]: https://github.com/user-attachments/assets/cc1ef188-2cd6-4d73-94fe-8ac191a52926
[Request-Flow-Drawing-Captcha]: ./public/images/request-flow.png
[MongoDB]: https://img.shields.io/badge/-MongoDB-13aa52?style=for-the-badge&logo=mongodb&logoColor=white
[NodeJS]: https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white
[ExpressJS]: https://img.shields.io/badge/express.js-000000?style=for-the-badge&logo=express&logoColor=white
[EJS]: https://img.shields.io/badge/-EJS-B4CA65?logo=ejs&logoColor=white&style=for-the-badge
[JS]: https://shields.io/badge/JavaScript-F7DF1E?logo=JavaScript&logoColor=000&style=for-the-badge
[Docker]: https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white&style=for-the-badge
[CSS]: https://img.shields.io/badge/CSS-1572B6?logo=CSS&logoColor=white&style=for-the-badge
[HTML]: https://img.shields.io/badge/HTML-E34F26?logo=HTML5&logoColor=white&style=for-the-badge
