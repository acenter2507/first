'use strict';

angular.module('core.admin').run(['Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Admin',
      state: 'admin.dashboard',
      // type: 'dropdown',
      roles: ['admin'],
      position: 3
    });
  }
]);
