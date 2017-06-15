(function () {
  'use strict';

  angular
    .module('cmts')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Cmts',
      state: 'cmts',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'cmts', {
      title: 'List Cmts',
      state: 'cmts.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'cmts', {
      title: 'Create Cmt',
      state: 'cmts.create',
      roles: ['user']
    });
  }
}());
