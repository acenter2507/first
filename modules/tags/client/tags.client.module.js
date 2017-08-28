(function (app) {
  'use strict';

  app.registerModule('tags');
  app.registerModule('tags.admin', ['core', 'admin']);
  app.registerModule('tags.admin.routes', ['admin.routes']);
}(ApplicationConfiguration));
