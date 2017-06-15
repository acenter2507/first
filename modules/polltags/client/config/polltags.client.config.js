(function () {
  'use strict';

  angular
    .module('polltags')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Polltags',
      state: 'polltags',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'polltags', {
      title: 'List Polltags',
      state: 'polltags.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'polltags', {
      title: 'Create Polltag',
      state: 'polltags.create',
      roles: ['user']
    });
  }
}());
