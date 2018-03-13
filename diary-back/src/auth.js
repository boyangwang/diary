const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;
const config = require('./config');

passport.use(
  new LocalStrategy(function(username, password, done) {
    if (username == config.username && password == config.password) {
      done(null, { username });
    } else {
      done(null, false);
    }
  })
);

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});

module.exports = {};
