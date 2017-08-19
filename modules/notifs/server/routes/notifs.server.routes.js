'use strict';

/**
 * Module dependencies
 */
var notifsPolicy = require('../policies/notifs.server.policy'),
  notifs = require('../controllers/notifs.server.controller');

module.exports = function (app) {
  
  app.route('/api/notifs/load').all(notifsPolicy.isAllowed)
    .get(notifs.load);
  // Notifs Routes
  app.route('/api/notifs').all(notifsPolicy.isAllowed)
    .get(notifs.list)
    .post(notifs.create);

  app.route('/api/notifs/:notifId').all(notifsPolicy.isAllowed)
    .get(notifs.read)
    .put(notifs.update)
    .delete(notifs.delete);
  app.route('/api/clearAll').all(notifsPolicy.isAllowed).get(notifs.clearAll);
  app.route('/api/countUnchecks').all(notifsPolicy.isAllowed).get(notifs.countUnchecks);
  app.route('/api/markAllRead').all(notifsPolicy.isAllowed).get(notifs.markAllRead);
  app.route('/api/findNotifs/:limit/:page').all(notifsPolicy.isAllowed).get(notifs.findNotifs);
  // Finish by binding the Notif middleware
  app.param('notifId', notifs.notifByID);
};
