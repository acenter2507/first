(function () {
  'use strict';

  angular
    .module('cmtlikes')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Cmtlikes',
      state: 'cmtlikes',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'cmtlikes', {
      title: 'List Cmtlikes',
      state: 'cmtlikes.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'cmtlikes', {
      title: 'Create Cmtlike',
      state: 'cmtlikes.create',
      roles: ['user']
    });
  }
}());
