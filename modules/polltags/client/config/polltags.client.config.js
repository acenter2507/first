(function () {
  'use strict';

  angular
    .module('polltags')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Polltags',
      state: 'polltags',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'polltags', {
      title: 'List Polltags',
      state: 'polltags.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'polltags', {
      title: 'Create Polltag',
      state: 'polltags.create',
      roles: ['user']
    });
  }
}());
