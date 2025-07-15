const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet')
const passport = require('passport');
const cookieParser = require('cookie-parser');
const { initializeAllowedOrigins, initializeRegisterKey } = require("../controllers/initializeController.js")
const express = require("express");
const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);

module.exports = (app) => {
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
    app.use(express.static("public"));
    app.use('/tmpimg', express.static('tmpimg'));
    app.use(cookieParser());
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                "script-src": ["'self'", "https://ajax.googleapis.com", "https://d3e54v103j8qbb.cloudfront.net", "'unsafe-inline'"],
                "style-src": ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com", "https://fonts.googleapis.com/css2", "https://fonts.googleapis.com/css", "'unsafe-inline'"],
                "script-src-attr": ["'self'", "'unsafe-inline'"]
            }
        },
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: false,
        crossOriginResourcePolicy: false
    }))
    app.use(cors({
        origin: async function (origin, callback) {
            try {
                let origins = await initializeAllowedOrigins();
                if (!origin || origins.includes(origin) || origin === 'null') {
                    return callback(null, true);
                } else {
                    logger.warn(`CORS request from disallowed origin: ${origin}`,
                        {
                            origin: origin,
                            operation: 'cors_check'
                        });
                }
                return callback(new Error('Not allowed by CORS'));
            } catch (error) {
                logger.error('Error fetching allowed origins:', { error: error.message, stack: error.stack });
                return callback(new Error('Failed to fetch allowed origins'));
            }
        },
        credentials: true
    }));
    app.use(passport.initialize())
    app.use(passport.session())
}