'use strict';

// Setting up route
angular.module('admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.dashboard', {
        url: '/dashboard',
        templateUrl: 'modules/admins/client/views/dashboard.client.view.html',
        controller: 'DashboardController'
      })
      .state('admin.polls', {
        url: '/polls',
        abstract: true,
        template: '<ui-view></ui-view>',
        ncyBreadcrumb: {
          label: 'Polls'
        }
      })
      .state('admin.users', {
        url: '/users',
        abstract: true,
        template: '<ui-view></ui-view>',
        ncyBreadcrumb: {
          label: 'Users'
        }
      })
  }
]);
