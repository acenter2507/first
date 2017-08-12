(function (app) {
  'use strict';

  app.registerModule('categorys');
  app.registerModule('categorys.admin', ['admin']);
  app.registerModule('categorys.admin.routes', ['admin.routes']);
}(ApplicationConfiguration));
