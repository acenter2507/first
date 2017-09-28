(function () {
  'use strict';

  angular
    .module('opts.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.opts', {
        url: '/opts',
        abstract: true,
        template: '<ui-view></ui-view>'
      })
      .state('admin.opts.list', {
        url: '/list',
        templateUrl: 'modules/opts/client/views/admin/admin-opts.client.view.html',
        controller: 'AdminOptsController',
        controllerAs: 'ctrl',
        data: { roles: ['admin'] }
      })
      .state('admin.opts.view', {
        url: '/:optId',
        templateUrl: 'modules/opts/client/views/admin/admin-view-opt.client.view.html',
        controller: 'AdminOptController',
        controllerAs: 'ctrl',
        resolve: {
          optResolve: getOpt
        },
        data: { roles: ['admin'] }
      });
  }

  getOpt.$inject = ['$stateParams', 'OptsService'];

  function getOpt($stateParams, OptsService) {
    return OptsService.get({
      optId: $stateParams.optId
    }).$promise;
  }
}());
