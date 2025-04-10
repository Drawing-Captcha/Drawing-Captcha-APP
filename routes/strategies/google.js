const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const UserModel = require("../../models/User.js");
const csrfMiddleware = require("../../middlewares/csurfMiddleware");
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
    async function (accessToken, refreshToken, profile, done) {
      try {
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
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  router.get('/callback',
    passport.authenticate('google', { failureRedirect: '/login' }), csrfMiddleware.generateCSRFToken,
    async function (req, res) {
      req.session.user = req.user;
      req.session.isAuth = true;
      res.redirect('/');
    }
  );

  module.exports = router;
}
