(function () {
  'use strict';

  angular
    .module('voteopts')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Voteopts',
      state: 'voteopts',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'voteopts', {
      title: 'List Voteopts',
      state: 'voteopts.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'voteopts', {
      title: 'Create Voteopt',
      state: 'voteopts.create',
      roles: ['user']
    });
  }
}());
