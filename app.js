/**
 * Hosts the latest kibana3 and elasticsearch behind Google OAuth2 Authentication
 * with nodejs and express.
 * License: MIT
 * Copyright: Funplus Game Inc.
 * Author: Fang Li.
 * Project: https://github.com/fangli/kibana-authentication-proxy
 */

var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');

var config = require('./config');

function rmerge(a, b) {
  for(var key in b) {
    a[key] = b[key];
  }
}

// some very basic argument parsing
if(process.argv.length > 2) {
  process.argv.slice(2).forEach(function(arg) {
    if(arg == '--help') {
      console.log('Usage: node app.js [config.json ...]');
      process.exit();
    }
    else {
      rmerge(config, JSON.parse(fs.readFileSync(arg)));
    }
  });
}

console.log('Server starting on port: ' + config.listen_port +
            ' SSL: ' + config.enable_ssl_port ? config.listen_port_ssl : 'off');
var app = express();
app.use(express.cookieParser());
app.use(express.session({ secret: config.cookie_secret }));

// Authentication
require('./lib/basic-auth').configureBasic(express, app, config);
require('./lib/google-oauth').configureOAuth(express, app, config);
require('./lib/cas-auth.js').configureCas(express, app, config);

// Setup ES proxy
require('./lib/es-proxy').configureESProxy(app, config.es_host, config.es_port,
          config.es_username, config.es_password);


require('./lib/kibana-proxy').configure(app, config);



run();

function run() {
  if (config.enable_ssl_port === true) {
    var options = {
      key: fs.readFileSync(config.ssl_key_file),
      cert: fs.readFileSync(config.ssl_cert_file),
    };
    https.createServer(options, app).listen(config.listen_port_ssl);
    console.log('Server listening on ' + config.listen_port_ssl + '(SSL)');
  }
  http.createServer(app).listen(config.listen_port);
  console.log('Server listening on ' + config.listen_port);
}


