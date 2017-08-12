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
      .state('tags.polls', {
        url: '/:tagId',
        templateUrl: 'modules/tags/client/views/polls-tag.client.view.html',
        controller: 'PollsTagController',
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
}());
