(function (app) {
  'use strict';

  app.registerModule('polls');
  app.registerModule('polls.admin', ['core', 'admin']);
  app.registerModule('polls.admin.routes', ['admin.routes']);
}(ApplicationConfiguration));
