'use strict';

// Setting up route
angular.module('admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.manage', {
        url: '/manage',
        templateUrl: 'modules/admins/client/views/manage.client.view.html',
        controller: 'ManageController'
      })
      .state('admin.users', {
        url: '/users',
        templateUrl: 'modules/admins/client/views/list-users.client.view.html',
        controller: 'UserListController'
      })
      .state('admin.user', {
        url: '/users/:userId',
        templateUrl: 'modules/admins/client/views/view-user.client.view.html',
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
        templateUrl: 'modules/admins/client/views/edit-user.client.view.html',
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
