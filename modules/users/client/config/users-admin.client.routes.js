'use strict';

// Setting up route
angular.module('users.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.users', {
        url: '/users',
        abstract: true,
        template: '<ui-view></ui-view>',
        ncyBreadcrumb: {
          label: 'Users'
        }
      })
      .state('admin.users.list', {
        url: '/list',
        templateUrl: 'modules/users/client/views/admin/admin-users.client.view.html',
        controller: 'AdminUserListController',
        ncyBreadcrumb: {
          label: 'List'
        }
      })
      .state('admin.users.new', {
        url: '/new',
        templateUrl: 'modules/users/client/views/admin/form-user.client.view.html',
        controller: 'AdminUserController',
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
        templateUrl: 'modules/users/client/views/admin/view-user.client.view.html',
        controller: 'AdminViewUserController',
        ncyBreadcrumb: {
          label: 'View user info'
        },
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              aduserId: $stateParams.userId
            }).$promise;
          }]
        }
      })
      .state('admin.users.edit', {
        url: '/:userId/edit',
        templateUrl: 'modules/users/client/views/admin/form-user.client.view.html',
        controller: 'AdminUserController',
        ncyBreadcrumb: {
          label: 'Edit {{ userResolve.displayName }}'
        },
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              aduserId: $stateParams.userId
            }).$promise;
          }]
        }
      })
      .state('admin.users.resetpass', {
        url: '/:userId/resetpass',
        templateUrl: 'modules/users/client/views/admin/resetpass-user.client.view.html',
        controller: 'AdminUserController',
        ncyBreadcrumb: {
          label: 'Reset password'
        },
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              aduserId: $stateParams.userId
            }).$promise;
          }]
        }
      });
  }
]);
