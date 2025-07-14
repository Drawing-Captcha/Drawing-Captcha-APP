const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const UserModel = require("../../models/User.js");
const csrfMiddleware = require("../../middlewares/csurfMiddleware");
const path = require('path');
const sanitizeInput = require("../../services/sanitizeInput.js");
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const createModuleLogger = require('../../utils/loggerHelper');
const logger = createModuleLogger(__filename);
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_DOMAIN}/api/auth/google/callback`
  },
    async function (accessToken, refreshToken, profile, done) {
      try {
        const email = profile.emails[0].value;

        let existingUser = await UserModel.findOne({ email });

        if (existingUser && existingUser.authType !== "google") {
          return done(null, false, { message: 'Email is already registered with a different sign-in method.' });
        }

        let user = await UserModel.findOne({ oAuthId: profile.id, authType: "google" });
        if (!user) {
          user = await UserModel.create({
            oAuthId: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
            ppURL: profile.photos[0].value ?? "",
            role: "read",
            authType: "google",
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await UserModel.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  router.get('/',
    // file deepcode ignore NoRateLimitingForLogin: <is being handled by the socialAuthLimiter middleware in app.js>
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  router.get('/callback',
    passport.authenticate('google', { failureRedirect: '/login?error=auth_conflict' }), csrfMiddleware.generateCSRFToken,
    async function (req, res) {
      req.session.user = req.user;
      req.session.isAuth = true;
      res.redirect('/');
      logger.info(`User: ${req.session.user._id} logged in with Google with email: ${sanitizeInput(req.user.email)}, IPAddress: ${sanitizeInput(req.ip)}`, {
        operation: 'login',
        email: sanitizeInput(req.user.email)
      });
    }
  );

  module.exports = router;
}
