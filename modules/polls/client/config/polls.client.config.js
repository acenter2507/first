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
      state: 'polls.list'
    });
    // Menus.addMenuItem('topbar', {
    //   title: 'Polls',
    //   state: 'polls',
    //   type: 'dropdown',
    //   roles: ['*']
    // });

    // // Add the dropdown list item
    // Menus.addSubMenuItem('topbar', 'polls', {
    //   title: 'List Polls',
    //   state: 'polls.list'
    // });

    // // Add the dropdown create item
    // Menus.addSubMenuItem('topbar', 'polls', {
    //   title: 'Create Poll',
    //   state: 'polls.create',
    //   roles: ['user']
    // });
  }
}());
