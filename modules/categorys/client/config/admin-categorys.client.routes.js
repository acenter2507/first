(function () {
  'use strict';

  angular
    .module('categorys.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.categorys', {
        url: '/categorys',
        abstract: true,
        template: '<ui-view></ui-view>',
        ncyBreadcrumb: {
          label: 'Categorys'
        }
      })
      .state('admin.categorys.list', {
        url: '/list',
        templateUrl: 'modules/categorys/client/views/admin/list-categorys.client.view.html',
        controller: 'AdminCategorysListController',
        ncyBreadcrumb: {
          label: 'List'
        }
      })
      .state('admin.categorys.new', {
        url: '/create',
        templateUrl: 'modules/categorys/client/views/admin/form-category.client.view.html',
        controller: 'CategorysController',
        controllerAs: 'vm',
        resolve: {
          categoryResolve: newCategory
        },
        ncyBreadcrumb: {
          label: 'Create'
        }
      })
      .state('admin.categorys.view', {
        url: '/:categoryId',
        templateUrl: 'modules/categorys/client/views/admin/view-category.client.view.html',
        controller: 'CategorysController',
        controllerAs: 'vm',
        resolve: {
          categoryResolve: getCategory
        },
        data: {
          pageTitle: 'View category'
        },
        ncyBreadcrumb: {
          label: 'View'
        }
      })
      .state('admin.categorys.edit', {
        url: '/:categoryId/edit',
        templateUrl: 'modules/categorys/client/views/admin/form-category.client.view.html',
        controller: 'CategoryInputController',
        controllerAs: 'vm',
        resolve: {
          categoryResolve: getCategory
        },
        data: {
          pageTitle: 'Edit {{ categoryResolve.name }}'
        },
        ncyBreadcrumb: {
          label: 'Edit'
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
