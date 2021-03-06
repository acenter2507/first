'use strict';

// Setting up route
angular.module('admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.dashboard', {
        url: '/dashboard',
        ncyBreadcrumb: {
          label: 'Dashboard',
        },
        templateUrl: 'modules/admins/client/views/dashboard.client.view.html',
        controller: 'DashboardController'
      });
  }
]);
