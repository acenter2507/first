'use strict';

// Setting up route
angular.module('admin.routes').config(['$stateProvider', '$breadcrumbProvider',
  function ($stateProvider, $breadcrumbProvider) {
    $stateProvider
      .state('admin.dashboard', {
        url: '/dashboard',
        ncyBreadcrumb: {
          label: 'Dashboard',
        },
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
