var passport = require('passport')
, BasicStrategy = require('passport-http').BasicStrategy
, pam = require('authenticate-pam');


exports.configure = function(express, app, config) {
  var serviceName = config.serviceName || 'kibana';
  var realm = config.realm || 'Kibana Authentication';
  console.log('Info: PAM auth applied, serviceName:', serviceName);

  passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.use(
    new BasicStrategy({'realm': realm},
      function(username, password, done) {
        pam.authenticate(
          username, password,
          function(err) {
            if(err) {
              return done(null, false, {message: err});
            }
            else {
              return done(null, username);
            }
          },
          {serviceName: serviceName});
      }
    ));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(passport.authenticate('basic', {session: true}));
};
