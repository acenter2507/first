(function (app) {
  'use strict';

  app.registerModule('tickets');
  app.registerModule('tickets.admin', ['core', 'admin']);
  app.registerModule('tickets.admin.routes', ['admin.routes']);
}(ApplicationConfiguration));
