(function () {
  'use strict';

  angular
    .module('tags')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Tags',
      state: 'tags',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'tags', {
      title: 'List Tags',
      state: 'tags.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'tags', {
      title: 'Create Tag',
      state: 'tags.create',
      roles: ['user']
    });
  }
}());
