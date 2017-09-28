(function () {
  'use strict';

  angular
    .module('polls')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Polls',
      state: 'polls.list',
      roles: ['*'],
      position: 0
    });
  }
}());
