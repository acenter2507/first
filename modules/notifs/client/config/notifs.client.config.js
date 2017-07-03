(function () {
  'use strict';

  angular
    .module('notifs')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    // Menus.addMenuItem('topbar', {
    //   title: 'Notifs',
    //   state: 'notifs',
    //   type: 'dropdown',
    //   roles: ['*']
    // });

    // // Add the dropdown list item
    // Menus.addSubMenuItem('topbar', 'notifs', {
    //   title: 'List Notifs',
    //   state: 'notifs.list'
    // });

    // // Add the dropdown create item
    // Menus.addSubMenuItem('topbar', 'notifs', {
    //   title: 'Create Notif',
    //   state: 'notifs.create',
    //   roles: ['user']
    // });
  }
}());
