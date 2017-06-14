(function () {
  'use strict';

  angular
    .module('comments')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Comments',
      state: 'comments',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'comments', {
      title: 'List Comments',
      state: 'comments.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'comments', {
      title: 'Create Comment',
      state: 'comments.create',
      roles: ['user']
    });
  }
}());
