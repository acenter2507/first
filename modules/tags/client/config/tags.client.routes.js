(function () {
  'use strict';

  angular
    .module('tags')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('tags', {
        abstract: true,
        url: '/tags',
        template: '<ui-view/>'
      })
      .state('tags.list', {
        url: '',
        templateUrl: 'modules/tags/client/views/list-tags.client.view.html',
        controller: 'TagsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Tags List'
        }
      })
      .state('tags.create', {
        url: '/create',
        templateUrl: 'modules/tags/client/views/form-tag.client.view.html',
        controller: 'TagsController',
        controllerAs: 'vm',
        resolve: {
          tagResolve: newTag
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Tags Create'
        }
      })
      .state('tags.edit', {
        url: '/:tagId/edit',
        templateUrl: 'modules/tags/client/views/form-tag.client.view.html',
        controller: 'TagsController',
        controllerAs: 'vm',
        resolve: {
          tagResolve: getTag
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Tag {{ tagResolve.name }}'
        }
      })
      .state('tags.view', {
        url: '/:tagId',
        templateUrl: 'modules/tags/client/views/view-tag.client.view.html',
        controller: 'TagsController',
        controllerAs: 'vm',
        resolve: {
          tagResolve: getTag
        },
        data: {
          pageTitle: 'Tag {{ tagResolve.name }}'
        }
      });
  }

  getTag.$inject = ['$stateParams', 'TagsService'];

  function getTag($stateParams, TagsService) {
    return TagsService.get({
      tagId: $stateParams.tagId
    }).$promise;
  }

  newTag.$inject = ['TagsService'];

  function newTag(TagsService) {
    return new TagsService();
  }
}());
