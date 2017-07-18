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
          categoryResolve: newCategory
        },
        data: {
          pageTitle: 'Categorys Polls'
        }
      })
      .state('categorys.create', {
        url: '/create',
        templateUrl: 'modules/categorys/client/views/form-category.client.view.html',
        controller: 'CategoryInputController',
        controllerAs: 'vm',
        resolve: {
          categoryResolve: newCategory
        },
        data: {
          roles: ['admin'],
          pageTitle: 'Categorys Create'
        }
      })
      .state('categorys.edit', {
        url: '/:categoryId/edit',
        templateUrl: 'modules/categorys/client/views/form-category.client.view.html',
        controller: 'CategoryInputController',
        controllerAs: 'vm',
        resolve: {
          categoryResolve: getCategory
        },
        data: {
          roles: ['admin'],
          pageTitle: 'Edit Category {{ categoryResolve.name }}'
        }
      })
      .state('categorys.view', {
        url: '/:categoryId',
        templateUrl: 'modules/categorys/client/views/view-category.client.view.html',
        controller: 'CategorysController',
        controllerAs: 'vm',
        resolve: {
          categoryResolve: getCategory
        },
        data: {
          roles: ['admin'],
          pageTitle: 'Category {{ categoryResolve.name }}'
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
