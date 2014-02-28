var express = require('express');

exports.configure = function(app, config) {
  app.use(express.cookieParser());
  if(config.cookie_secret === 'REPLACE_WITH_A_RANDOM_STRING_PLEASE') {
    console.log("Using default cookie_secret; please set to random value");
  }
  app.use(express.session({ secret: config.cookie_secret }));

  var authConfigured=false;
  // Authentication
  for (var key in config.authenticators) {
    //builtin auth can be specified just as 'google-oauth2'; that
    //needs to be translated to './google-oauth2'
    require(key[0] == '/' || key[0] == '.' ? key : "./" + key)
      .configure(express, app, config.authenticators[key]);
    authConfigured=true;
  }
  if(!authConfigured) {
    console.log('WARNING: No authentication configured');
  }
};
