(function (app) {
  'use strict';

  app.registerModule('polls');
  app.registerModule('polls.admin', ['admin']);
  app.registerModule('polls.admin.routes', ['admin.routes']);
}(ApplicationConfiguration));
