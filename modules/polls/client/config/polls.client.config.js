(function () {
  'use strict';

  angular
    .module('polls')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Polls',
      state: 'polls',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'polls', {
      title: 'List Polls',
      state: 'polls.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'polls', {
      title: 'Create Poll',
      state: 'polls.create',
      roles: ['user']
    });
  }
}());
