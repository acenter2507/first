(function () {
  'use strict';

  angular
    .module('options')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Options',
      state: 'options',
      type: 'dropdown',
      roles: ['admin']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'options', {
      title: 'List Options',
      state: 'options.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'options', {
      title: 'Create Option',
      state: 'options.create',
      roles: ['user']
    });
  }
}());
