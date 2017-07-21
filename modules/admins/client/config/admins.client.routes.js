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
        templateUrl: 'modules/admins/client/views/polls/list-polls.client.view.html',
        controller: 'PollListController'
      })
      .state('admin.users', {
        url: '/users',
        templateUrl: 'modules/admins/client/views/users/list-users.client.view.html',
        controller: 'UserListController'
      })
      .state('admin.user-new', {
        url: '/users/new',
        templateUrl: 'modules/admins/client/views/users/new-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['Admin', function (Admin) {
            return new Admin();
          }]
        }
      })
      .state('admin.user', {
        url: '/users/:userId',
        templateUrl: 'modules/admins/client/views/users/view-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      })
      .state('admin.user-edit', {
        url: '/users/:userId/edit',
        templateUrl: 'modules/admins/client/views/users/edit-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      });
  }
]);
