const express = require('express');
const router = express.Router();
const passport = require('passport');
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const UserModel = require("../../models/User.js");
const csrfMiddleware = require("../../middlewares/csurfMiddleware");
const path = require('path');
const sanitizeInput = require("../../services/sanitizeInput.js");
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  passport.use(new MicrosoftStrategy({
    tenant: process.env.MICROSOFT_TENANT_ID || 'common',
    clientID: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_DOMAIN}/api/auth/microsoft/callback`,
    scope: ['user.read'],
  },
    async function (accessToken, refreshToken, profile, done) {
      try {
        const email = profile.emails[0].value;

        let existingUser = await UserModel.findOne({ email });

        if (existingUser && existingUser.authType !== "microsoft") {
          return done(null, false, { message: 'Email is already registered with a different sign-in method.' });
        }

        let user = await UserModel.findOne({ oAuthId: profile.id, authType: "microsoft" });

        if (!user) {
          user = await UserModel.create({
            oAuthId: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
            role: "read",
            authType: "microsoft",
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
    passport.authenticate('microsoft', {
      prompt: 'select_account',
    })
  );

  router.get('/callback',
    passport.authenticate('microsoft', { failureRedirect: '/login?error=auth_conflict' }), csrfMiddleware.generateCSRFToken,
    function (req, res) {
      req.session.user = req.user;
      req.session.isAuth = true;
      res.redirect('/');
    }
  );

  module.exports = router;
}
