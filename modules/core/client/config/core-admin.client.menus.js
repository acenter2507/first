'use strict';

angular.module('core.admin').run(['Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Adminsssss',
      state: 'admin',
      type: 'button',
      roles: ['admin']
    });
  }
]);
