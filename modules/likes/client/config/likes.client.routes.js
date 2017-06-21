(function () {
  'use strict';

  angular
    .module('likes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('likes', {
        abstract: true,
        url: '/likes',
        template: '<ui-view/>'
      })
      .state('likes.list', {
        url: '',
        templateUrl: 'modules/likes/client/views/list-likes.client.view.html',
        controller: 'LikesListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Likes List'
        }
      })
      .state('likes.create', {
        url: '/create',
        templateUrl: 'modules/likes/client/views/form-like.client.view.html',
        controller: 'LikesController',
        controllerAs: 'vm',
        resolve: {
          likeResolve: newLike
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Likes Create'
        }
      })
      .state('likes.edit', {
        url: '/:likeId/edit',
        templateUrl: 'modules/likes/client/views/form-like.client.view.html',
        controller: 'LikesController',
        controllerAs: 'vm',
        resolve: {
          likeResolve: getLike
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Like {{ likeResolve.name }}'
        }
      })
      .state('likes.view', {
        url: '/:likeId',
        templateUrl: 'modules/likes/client/views/view-like.client.view.html',
        controller: 'LikesController',
        controllerAs: 'vm',
        resolve: {
          likeResolve: getLike
        },
        data: {
          pageTitle: 'Like {{ likeResolve.name }}'
        }
      });
  }

  getLike.$inject = ['$stateParams', 'LikesService'];

  function getLike($stateParams, LikesService) {
    return LikesService.get({
      likeId: $stateParams.likeId
    }).$promise;
  }

  newLike.$inject = ['LikesService'];

  function newLike(LikesService) {
    return new LikesService();
  }
}());
