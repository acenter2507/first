(function () {
  'use strict';

  angular
    .module('')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: '',
      state: '',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', '', {
      title: 'List ',
      state: '.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', '', {
      title: 'Create ',
      state: '.create',
      roles: ['user']
    });
  }
}());
