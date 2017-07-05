(function () {
  'use strict';

  angular
    .module('views')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('views', {
        abstract: true,
        url: '/views',
        template: '<ui-view/>'
      })
      .state('views.list', {
        url: '',
        templateUrl: 'modules/views/client/views/list-views.client.view.html',
        controller: 'ViewsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Views List'
        }
      })
      .state('views.create', {
        url: '/create',
        templateUrl: 'modules/views/client/views/form-view.client.view.html',
        controller: 'ViewsController',
        controllerAs: 'vm',
        resolve: {
          viewResolve: newView
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Views Create'
        }
      })
      .state('views.edit', {
        url: '/:viewId/edit',
        templateUrl: 'modules/views/client/views/form-view.client.view.html',
        controller: 'ViewsController',
        controllerAs: 'vm',
        resolve: {
          viewResolve: getView
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit View {{ viewResolve.name }}'
        }
      })
      .state('views.view', {
        url: '/:viewId',
        templateUrl: 'modules/views/client/views/view-view.client.view.html',
        controller: 'ViewsController',
        controllerAs: 'vm',
        resolve: {
          viewResolve: getView
        },
        data: {
          pageTitle: 'View {{ viewResolve.name }}'
        }
      });
  }

  getView.$inject = ['$stateParams', 'ViewsService'];

  function getView($stateParams, ViewsService) {
    return ViewsService.get({
      viewId: $stateParams.viewId
    }).$promise;
  }

  newView.$inject = ['ViewsService'];

  function newView(ViewsService) {
    return new ViewsService();
  }
}());
