(function () {
  'use strict';

  angular
    .module('notifs')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Notifs',
      state: 'notifs',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'notifs', {
      title: 'List Notifs',
      state: 'notifs.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'notifs', {
      title: 'Create Notif',
      state: 'notifs.create',
      roles: ['user']
    });
  }
}());
