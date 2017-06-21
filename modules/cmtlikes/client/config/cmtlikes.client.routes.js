(function () {
  'use strict';

  angular
    .module('cmtlikes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('cmtlikes', {
        abstract: true,
        url: '/cmtlikes',
        template: '<ui-view/>'
      })
      .state('cmtlikes.list', {
        url: '',
        templateUrl: 'modules/cmtlikes/client/views/list-cmtlikes.client.view.html',
        controller: 'CmtlikesListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Cmtlikes List'
        }
      })
      .state('cmtlikes.create', {
        url: '/create',
        templateUrl: 'modules/cmtlikes/client/views/form-cmtlike.client.view.html',
        controller: 'CmtlikesController',
        controllerAs: 'vm',
        resolve: {
          cmtlikeResolve: newCmtlike
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Cmtlikes Create'
        }
      })
      .state('cmtlikes.edit', {
        url: '/:cmtlikeId/edit',
        templateUrl: 'modules/cmtlikes/client/views/form-cmtlike.client.view.html',
        controller: 'CmtlikesController',
        controllerAs: 'vm',
        resolve: {
          cmtlikeResolve: getCmtlike
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Cmtlike {{ cmtlikeResolve.name }}'
        }
      })
      .state('cmtlikes.view', {
        url: '/:cmtlikeId',
        templateUrl: 'modules/cmtlikes/client/views/view-cmtlike.client.view.html',
        controller: 'CmtlikesController',
        controllerAs: 'vm',
        resolve: {
          cmtlikeResolve: getCmtlike
        },
        data: {
          pageTitle: 'Cmtlike {{ cmtlikeResolve.name }}'
        }
      });
  }

  getCmtlike.$inject = ['$stateParams', 'CmtlikesService'];

  function getCmtlike($stateParams, CmtlikesService) {
    return CmtlikesService.get({
      cmtlikeId: $stateParams.cmtlikeId
    }).$promise;
  }

  newCmtlike.$inject = ['CmtlikesService'];

  function newCmtlike(CmtlikesService) {
    return new CmtlikesService();
  }
}());
