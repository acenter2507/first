(function () {
  'use strict';

  angular
    .module('categorys')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Categorys',
      state: 'categorys',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'categorys', {
      title: 'List Categorys',
      state: 'categorys.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'categorys', {
      title: 'Create Category',
      state: 'categorys.create',
      roles: ['user']
    });
  }
}());
