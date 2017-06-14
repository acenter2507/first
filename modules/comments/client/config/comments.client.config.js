(function () {
  'use strict';

  angular
    .module('comments')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Comments',
      state: 'comments',
      type: 'dropdown',
      roles: ['admin']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'comments', {
      title: 'List Comments',
      state: 'comments.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'comments', {
      title: 'Create Comment',
      state: 'comments.create',
      roles: ['user']
    });
  }
}());
