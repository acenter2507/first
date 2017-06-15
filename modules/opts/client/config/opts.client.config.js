(function () {
  'use strict';

  angular
    .module('opts')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Opts',
      state: 'opts',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'opts', {
      title: 'List Opts',
      state: 'opts.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'opts', {
      title: 'Create Opt',
      state: 'opts.create',
      roles: ['user']
    });
  }
}());
