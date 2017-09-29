(function (app) {
  'use strict';

  app.registerModule('opts');
  app.registerModule('opts.admin', ['core', 'admin']);
  app.registerModule('opts.admin.routes', ['admin.routes']);
}(ApplicationConfiguration));
