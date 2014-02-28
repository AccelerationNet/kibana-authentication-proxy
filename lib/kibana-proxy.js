var express = require('express');


exports.configure = function(app, config) {
  // Serve all kibana3 frontend files
  app.use('/', express.static(__dirname + '/../kibana/src'));

  // Serve config.js for kibana3
  // We should use special config.js for the frontend and point the ES to __es/
  app.get('/config.js', function (req, res) {
    function getKibanaIndex() {
      var raw_index = config.kibana_es_index;
      var user_type = config.which_auth_type_for_kibana_index;
      var user;
      if (raw_index.indexOf('%user%') > -1) {
        if (user_type === 'google') {
          user = req.googleOauth.id;
        } else if (user_type === 'basic') {
          user = req.user;
        } else if (user_type === 'cas') {
          user = req.session.cas_user_name;
        } else {
          user = 'unknown';
        }
        return raw_index.replace(/%user%/gi, user);
      } else {
        return raw_index;
      }
    }

    res.setHeader('Content-Type', 'application/javascript');
    res.end("define(['settings'], " +
            "function (Settings) {'use strict'; return new Settings({elasticsearch: '/__es', default_route     : '/dashboard/file/default.json'," +
            "kibana_index: '" +
            getKibanaIndex() +
            "', panel_names: ['histogram', 'map', 'pie', 'table', 'filtering', 'timepicker', 'text', 'hits', 'column', 'trends', 'bettermap', 'query', 'terms', 'sparklines'] }); });");
  });
};
