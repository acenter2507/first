(function () {
  'use strict';

  angular
    .module('opts')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('opts', {
        abstract: true,
        url: '/opts',
        template: '<ui-view/>'
      })
      .state('opts.list', {
        url: '',
        templateUrl: 'modules/opts/client/views/list-opts.client.view.html',
        controller: 'OptsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Opts List'
        }
      })
      .state('opts.create', {
        url: '/create',
        templateUrl: 'modules/opts/client/views/form-opt.client.view.html',
        controller: 'OptsController',
        controllerAs: 'vm',
        resolve: {
          optResolve: newOpt
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Opts Create'
        }
      })
      .state('opts.edit', {
        url: '/:optId/edit',
        templateUrl: 'modules/opts/client/views/form-opt.client.view.html',
        controller: 'OptsController',
        controllerAs: 'vm',
        resolve: {
          optResolve: getOpt
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Opt {{ optResolve.name }}'
        }
      })
      .state('opts.view', {
        url: '/:optId',
        templateUrl: 'modules/opts/client/views/view-opt.client.view.html',
        controller: 'OptsController',
        controllerAs: 'vm',
        resolve: {
          optResolve: getOpt
        },
        data: {
          pageTitle: 'Opt {{ optResolve.name }}'
        }
      });
  }

  getOpt.$inject = ['$stateParams', 'OptsService'];

  function getOpt($stateParams, OptsService) {
    return OptsService.get({
      optId: $stateParams.optId
    }).$promise;
  }

  newOpt.$inject = ['OptsService'];

  function newOpt(OptsService) {
    return new OptsService();
  }
}());
