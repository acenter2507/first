(function () {
  'use strict';

  angular
    .module('likes')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Likes',
      state: 'likes',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'likes', {
      title: 'List Likes',
      state: 'likes.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'likes', {
      title: 'Create Like',
      state: 'likes.create',
      roles: ['user']
    });
  }
}());
