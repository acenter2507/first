(function () {
  'use strict';

  angular
    .module('votes')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Votes',
      state: 'votes',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'votes', {
      title: 'List Votes',
      state: 'votes.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'votes', {
      title: 'Create Vote',
      state: 'votes.create',
      roles: ['user']
    });
  }
}());
