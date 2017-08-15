(function () {
  'use strict';

  angular
    .module('categorys')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: '',
      state: 'categorys.list',
      roles: ['*'],
      icon: 'fa-list',
      position: 1
    });

    // // Add the dropdown list item
    // menuService.addSubMenuItem('topbar', 'categorys', {
    //   title: 'List Categorys',
    //   state: 'categorys.list',
    //   roles: ['*']
    // });

    // // Add the dropdown create item
    // menuService.addSubMenuItem('topbar', 'categorys', {
    //   title: 'Create Category',
    //   state: 'categorys.create',
    //   roles: ['admin']
    // });
  }
}());
