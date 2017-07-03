'use strict';

// Setting up route
angular.module('core.admin.routes').config(['$stateProvider',
// angular.module('core').config(['$stateProvider',
  function ($stateProvider) {
    console.log('config admis');
    $stateProvider
      .state('admins', {
        abstract: true,
        url: '/admin',
        template: '<ui-view/>',
        data: {
          roles: ['admin']
        }
      });
  }
]);
