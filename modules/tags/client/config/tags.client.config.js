(function () {
  'use strict';

  angular
    .module('tags')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Tags',
      state: 'tags',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'tags', {
      title: 'List Tags',
      state: 'tags.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'tags', {
      title: 'Create Tag',
      state: 'tags.create',
      roles: ['user']
    });
  }
}());
