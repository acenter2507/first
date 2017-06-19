(function () {
  'use strict';

  angular
    .module('voteopts')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Voteopts',
      state: 'voteopts',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'voteopts', {
      title: 'List Voteopts',
      state: 'voteopts.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'voteopts', {
      title: 'Create Voteopt',
      state: 'voteopts.create',
      roles: ['user']
    });
  }
}());
