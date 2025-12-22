const path = require("path");
const session = require("express-session");
const crypto = require("crypto");
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);
const store = require("../models/store.js")

module.exports = (app) => {
    // Generate a strong session secret if not provided
    let sessionSecret = process.env.SESSION_SECRET;
    
    if (!sessionSecret) {
        // Use a stronger random secret than UUID
        sessionSecret = crypto.randomBytes(32).toString('hex');
        logger.warn('SESSION_SECRET not configured in environment. Using generated secret. This will invalidate sessions on restart.', {
            operation: 'session_initialization',
            recommendation: 'Set SESSION_SECRET in production environment'
        });
        
        // In production, require SESSION_SECRET to be set
        if (process.env.NODE_ENV === 'production') {
            logger.error('CRITICAL: SESSION_SECRET must be set in production environment!', {
                operation: 'session_initialization',
                environment: 'production'
            });
            throw new Error('SESSION_SECRET environment variable is required in production');
        }
    }
    
    app.use(session({
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false,
        store: store,
        cookie: {
            maxAge: 30 * 60 * 1000,
            secure: (process.env.NODE_ENV || '').toLowerCase() !== 'development',
            httpOnly: true,
            sameSite: 'lax' // Added for additional CSRF protection
        }
    }));
}