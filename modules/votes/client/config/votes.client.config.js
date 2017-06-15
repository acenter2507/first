(function () {
  'use strict';

  angular
    .module('votes')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Votes',
      state: 'votes',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'votes', {
      title: 'List Votes',
      state: 'votes.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'votes', {
      title: 'Create Vote',
      state: 'votes.create',
      roles: ['user']
    });
  }
}());
