(function () {
  'use strict';

  angular
    .module('categorys')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('categorys', {
        abstract: true,
        url: '/categorys',
        template: '<ui-view/>'
      })
      .state('categorys.list', {
        url: '',
        templateUrl: 'modules/categorys/client/views/list-categorys.client.view.html',
        controller: 'CategorysListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Categorys List'
        }
      })
      .state('categorys.polls', {
        url: '/:categoryId/polls',
        templateUrl: 'modules/categorys/client/views/polls-category.client.view.html',
        controller: 'CategoryPollsController',
        controllerAs: 'vm',
        resolve: {
          categoryResolve: getCategory
        },
        data: {
          pageTitle: '{{ categoryResolve.name }}'
        }
      });
  }

  getCategory.$inject = ['$stateParams', 'CategorysService'];

  function getCategory($stateParams, CategorysService) {
    return CategorysService.get({
      categoryId: $stateParams.categoryId
    }).$promise;
  }

  newCategory.$inject = ['CategorysService'];

  function newCategory(CategorysService) {
    return new CategorysService();
  }
}());
