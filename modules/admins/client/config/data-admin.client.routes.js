'use strict';

// Setting up route
angular.module('admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.polls.list', {
        url: '/list',
        templateUrl: 'modules/admins/client/views/polls/list-polls.client.view.html',
        controller: 'PollListController',
        ncyBreadcrumb: {
          label: 'List'
        }
      });
      // .state('admin.users.new', {
      //   url: '/new',
      //   templateUrl: 'modules/admins/client/views/users/new-user.client.view.html',
      //   controller: 'UserController',
      //   ncyBreadcrumb: {
      //     label: 'Add new'
      //   },
      //   resolve: {
      //     userResolve: ['Admin', function (Admin) {
      //       return new Admin();
      //     }]
      //   }
      // })
      // .state('admin.users.view', {
      //   url: '/:userId',
      //   templateUrl: 'modules/admins/client/views/users/view-user.client.view.html',
      //   controller: 'UserController',
      //   ncyBreadcrumb: {
      //     label: '{{ userResolve.displayName }}'
      //   },
      //   resolve: {
      //     userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
      //       return Admin.get({
      //         userId: $stateParams.userId
      //       });
      //     }]
      //   }
      // })
      // .state('admin.users.edit', {
      //   url: '/:userId/edit',
      //   templateUrl: 'modules/admins/client/views/users/edit-user.client.view.html',
      //   controller: 'UserController',
      //   ncyBreadcrumb: {
      //     label: 'Edit {{ userResolve.displayName }}'
      //   },
      //   resolve: {
      //     userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
      //       return Admin.get({
      //         userId: $stateParams.userId
      //       });
      //     }]
      //   }
      // });
  }
]);
