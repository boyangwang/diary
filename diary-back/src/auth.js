const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;
const config = require('./config');

module.exports = {
  init: () => {
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
  },
  authenticateCallback: async (ctx, next) => {
    return await passport.authenticate(
      'local',
      async (err, user, info, status) => {
        if (user) {
          ctx.status = 200;
          ctx.body = { data: { user } };
          return ctx.login(user);
        } else {
          console.log('Login failure', ctx.request.body);
          ctx.status = 401;
          return (ctx.body = { err: 'Login failure' });
        }
      }
    )(ctx, next);
  },
  verifyAuthenticated: async (ctx, next) => {
    if (ctx.isAuthenticated()) {
      await next();
    } else {
      ctx.status = 401;
      ctx.body = { err: 'need login' };
    }
  }
};
