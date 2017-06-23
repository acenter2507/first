'use strict';

/**
 * Module dependencies
 */
var notifsPolicy = require('../policies/notifs.server.policy'),
  notifs = require('../controllers/notifs.server.controller');

module.exports = function(app) {
  // Notifs Routes
  app
    .route('/api/notifs') //.all(notifsPolicy.isAllowed)
    .get(notifs.list)
    .post(notifs.create);

  app
    .route('/api/notifs/:notifId') //.all(notifsPolicy.isAllowed)
    .get(notifs.read)
    .put(notifs.update)
    .delete(notifs.delete);
  app.route('/api/countUnchecks').get(notifs.countUnchecks);
  app.route('/api/findNotifs/:limit').get(notifs.findNotifs);
  // Finish by binding the Notif middleware
  app.param('notifId', notifs.notifByID);
};
