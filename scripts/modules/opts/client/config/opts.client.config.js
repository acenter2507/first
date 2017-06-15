(function () {
  'use strict';

  angular
    .module('opts')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Opts',
      state: 'opts',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'opts', {
      title: 'List Opts',
      state: 'opts.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'opts', {
      title: 'Create Opt',
      state: 'opts.create',
      roles: ['user']
    });
  }
}());
