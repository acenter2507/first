(function () {
  'use strict';

  angular
    .module('cmts')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('cmts', {
        abstract: true,
        url: '/cmts',
        template: '<ui-view/>'
      })
      .state('cmts.list', {
        url: '',
        templateUrl: 'modules/cmts/client/views/list-cmts.client.view.html',
        controller: 'CmtsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Cmts List'
        }
      })
      .state('cmts.create', {
        url: '/create',
        templateUrl: 'modules/cmts/client/views/form-cmt.client.view.html',
        controller: 'CmtsController',
        controllerAs: 'vm',
        resolve: {
          cmtResolve: newCmt
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Cmts Create'
        }
      })
      .state('cmts.edit', {
        url: '/:cmtId/edit',
        templateUrl: 'modules/cmts/client/views/form-cmt.client.view.html',
        controller: 'CmtsController',
        controllerAs: 'vm',
        resolve: {
          cmtResolve: getCmt
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Cmt {{ cmtResolve.name }}'
        }
      })
      .state('cmts.view', {
        url: '/:cmtId',
        templateUrl: 'modules/cmts/client/views/view-cmt.client.view.html',
        controller: 'CmtsController',
        controllerAs: 'vm',
        resolve: {
          cmtResolve: getCmt
        },
        data: {
          pageTitle: 'Cmt {{ cmtResolve.name }}'
        }
      });
  }

  getCmt.$inject = ['$stateParams', 'CmtsService'];

  function getCmt($stateParams, CmtsService) {
    return CmtsService.get({
      cmtId: $stateParams.cmtId
    }).$promise;
  }

  newCmt.$inject = ['CmtsService'];

  function newCmt(CmtsService) {
    return new CmtsService();
  }
}());
