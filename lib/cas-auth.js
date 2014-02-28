/**
 * Configure CAS Authentication
 * When no cas_server_url presented, no CAS authentication applied.
 */


exports.configure = function(express, app, config) {
  console.log('Info: CAS Authentication applied');
  app.use(function(req, res, next) {
    if (req.url.indexOf('/auth/cas/login') === 0 || req.session.cas_user_name) {
      return next();
    } else {
      res.redirect('/auth/cas/login');
    }
  });

  config.server_url = config.server_url.replace(/\s+$/,'');

  app.get('/auth/cas/login', function (req, res) {
    var service_url  = req.protocol + "://" + req.get('host') + req.url;

    var CAS = require('cas');
    var cas = new CAS({base_url: config.server_url, service: service_url});

    var cas_login_url = config.server_url + "/login?service=" + service_url;

    var ticket = req.param('ticket');
    if (ticket) {
      cas.validate(ticket, function(err, status, username) {
        if (err || !status) {
          // Handle the error
          res.send(
            "You may have logged in with invalid CAS ticket or permission denied.<br>" +
              "<a href='" + cas_login_url + "'>Try again</a>"
          );
        } else {
          // Log the user in
          req.session.cas_user_name = username;
          res.redirect("/");
        }
      });
    } else {
      if (!req.session.cas_user_name) {
        res.redirect(cas_login_url);
      } else {
        res.redirect("/");
      }
    }
  });

};
