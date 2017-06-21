(function () {
  'use strict';

  angular
    .module('likes')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Likes',
      state: 'likes',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'likes', {
      title: 'List Likes',
      state: 'likes.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'likes', {
      title: 'Create Like',
      state: 'likes.create',
      roles: ['user']
    });
  }
}());
