'use strict';

// Setting up route
angular.module('core.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin', {
        abstract: true,
        url: '/admin',
        templateUrl: 'modules/admins/client/views/admin.client.view.html',
        controller: 'AdminsController',
        data: {
          roles: ['admin']
        }
      });
  }
]);
