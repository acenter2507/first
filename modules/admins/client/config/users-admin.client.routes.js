'use strict';

// Setting up route
angular.module('admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.users.list', {
        url: '/list',
        templateUrl: 'modules/admins/client/views/users/list-users.client.view.html',
        controller: 'UserListController',
        ncyBreadcrumb: {
          label: 'List'
        }
      })
      .state('admin.users.new', {
        url: '/new',
        templateUrl: 'modules/admins/client/views/users/form-user.client.view.html',
        controller: 'UserController',
        ncyBreadcrumb: {
          label: 'Add new'
        },
        resolve: {
          userResolve: ['Admin', function (Admin) {
            return new Admin();
          }]
        }
      })
      .state('admin.users.view', {
        url: '/:userId',
        templateUrl: 'modules/admins/client/views/users/view-user.client.view.html',
        controller: 'ViewUserController',
        ncyBreadcrumb: {
          label: '{{ userResolve.displayName }}'
        },
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              aduserId: $stateParams.userId
            });
          }]
        }
      })
      .state('admin.users.edit', {
        url: '/:userId/edit',
        templateUrl: 'modules/admins/client/views/users/form-user.client.view.html',
        controller: 'UserController',
        ncyBreadcrumb: {
          label: 'Edit {{ userResolve.displayName }}'
        },
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              aduserId: $stateParams.userId
            });
          }]
        }
      })
      .state('admin.users.resetpass', {
        url: '/:userId/resetpass',
        templateUrl: 'modules/admins/client/views/users/resetpass-user.client.view.html',
        controller: 'UserController',
        ncyBreadcrumb: {
          label: 'Reset password'
        },
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              aduserId: $stateParams.userId
            });
          }]
        }
      });
  }
]);
