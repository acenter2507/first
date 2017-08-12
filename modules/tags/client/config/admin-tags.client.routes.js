(function () {
  'use strict';

  angular
    .module('tags.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.tags', {
        url: '/tags',
        abstract: true,
        template: '<ui-view></ui-view>',
        ncyBreadcrumb: {
          label: 'Tags'
        }
      })
      .state('admin.tags.list', {
        url: '/list',
        templateUrl: 'modules/tags/client/views/admin/list-tags.client.view.html',
        controller: 'AdminTagsListController',
        controllerAs: 'vm',
        ncyBreadcrumb: {
          label: 'List'
        }
      })
      .state('admin.tags.new', {
        url: '/create',
        templateUrl: 'modules/tags/client/views/admin/form-tag.client.view.html',
        controller: 'TagsController',
        controllerAs: 'vm',
        resolve: {
          tagResolve: newTag
        },
        ncyBreadcrumb: {
          label: 'Create'
        }
      })
      .state('admin.tags.view', {
        url: '/:categoryId',
        templateUrl: 'modules/tags/client/views/admin/view-tag.client.view.html',
        controller: 'TagsController',
        controllerAs: 'vm',
        resolve: {
          tagResolve: getTag
        },
        data: {
          pageTitle: 'View tag'
        },
        ncyBreadcrumb: {
          label: 'View'
        }
      })
      .state('admin.tags.edit', {
        url: '/:tagId/edit',
        templateUrl: 'modules/tags/client/views/admin/form-tag.client.view.html',
        controller: 'TagsController',
        controllerAs: 'vm',
        resolve: {
          tagResolve: getTag
        },
        data: {
          pageTitle: 'Edit {{ tagResolve.name }}'
        },
        ncyBreadcrumb: {
          label: 'Edit'
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
