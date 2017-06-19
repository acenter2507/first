(function () {
  'use strict';

  angular
    .module('cmts')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    // Menus.addMenuItem('topbar', {
    //   title: 'Cmts',
    //   state: 'cmts',
    //   type: 'dropdown',
    //   roles: ['*']
    // });

    // // Add the dropdown list item
    // Menus.addSubMenuItem('topbar', 'cmts', {
    //   title: 'List Cmts',
    //   state: 'cmts.list'
    // });

    // // Add the dropdown create item
    // Menus.addSubMenuItem('topbar', 'cmts', {
    //   title: 'Create Cmt',
    //   state: 'cmts.create',
    //   roles: ['user']
    // });
  }
}());
