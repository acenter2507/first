'use strict';

// Setting up route
angular.module('users.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.users', {
        url: '/users',
        abstract: true,
        template: '<ui-view></ui-view>'
      })
      .state('admin.users.list', {
        url: '/list',
        templateUrl: 'modules/users/client/views/admin/admin-users.client.view.html',
        controller: 'AdminUsersController',
        controllerAs: 'vm',
        data: { roles: ['admin'] }
      })
      .state('admin.users.new', {
        url: '/new',
        templateUrl: 'modules/users/client/views/admin/admin-form-user.client.view.html',
        controller: 'AdminUserController',
        controllerAs: 'vm',
        data: { roles: ['admin'] },
        resolve: {
          userResolve: ['AdminUserService', function (AdminUserService) {
            return new AdminUserService();
          }]
        }
      })
      .state('admin.users.view', {
        url: '/:userId',
        templateUrl: 'modules/users/client/views/admin/admin-view-user.client.view.html',
        controller: 'AdminViewUserController',
        controllerAs: 'vm',
        data: { roles: ['admin'] },
        resolve: {
          userResolve: ['$stateParams', 'AdminUserService', function ($stateParams, AdminUserService) {
            return AdminUserService.get({
              aduserId: $stateParams.userId
            }).$promise;
          }]
        }
      })
      .state('admin.users.edit', {
        url: '/:userId/edit',
        templateUrl: 'modules/users/client/views/admin/admin-form-user.client.view.html',
        controller: 'AdminUserController',
        controllerAs: 'vm',
        data: { roles: ['admin'] },
        resolve: {
          userResolve: ['$stateParams', 'AdminUserService', function ($stateParams, AdminUserService) {
            return AdminUserService.get({
              aduserId: $stateParams.userId
            }).$promise;
          }]
        }
      })
      .state('admin.users.resetpass', {
        url: '/:userId/resetpass',
        templateUrl: 'modules/users/client/views/admin/admin-resetpass-user.client.view.html',
        controller: 'AdminUserController',
        controllerAs: 'vm',
        data: { roles: ['admin'] },
        resolve: {
          userResolve: ['$stateParams', 'AdminUserService', function ($stateParams, AdminUserService) {
            return AdminUserService.get({
              aduserId: $stateParams.userId
            }).$promise;
          }]
        }
      });
  }
]);
