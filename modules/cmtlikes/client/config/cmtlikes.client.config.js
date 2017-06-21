(function () {
  'use strict';

  angular
    .module('cmtlikes')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Cmtlikes',
      state: 'cmtlikes',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'cmtlikes', {
      title: 'List Cmtlikes',
      state: 'cmtlikes.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'cmtlikes', {
      title: 'Create Cmtlike',
      state: 'cmtlikes.create',
      roles: ['user']
    });
  }
}());
