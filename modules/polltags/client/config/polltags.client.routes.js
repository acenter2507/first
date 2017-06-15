(function () {
  'use strict';

  angular
    .module('polltags')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('polltags', {
        abstract: true,
        url: '/polltags',
        template: '<ui-view/>'
      })
      .state('polltags.list', {
        url: '',
        templateUrl: 'modules/polltags/client/views/list-polltags.client.view.html',
        controller: 'PolltagsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Polltags List'
        }
      })
      .state('polltags.create', {
        url: '/create',
        templateUrl: 'modules/polltags/client/views/form-polltag.client.view.html',
        controller: 'PolltagsController',
        controllerAs: 'vm',
        resolve: {
          polltagResolve: newPolltag
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Polltags Create'
        }
      })
      .state('polltags.edit', {
        url: '/:polltagId/edit',
        templateUrl: 'modules/polltags/client/views/form-polltag.client.view.html',
        controller: 'PolltagsController',
        controllerAs: 'vm',
        resolve: {
          polltagResolve: getPolltag
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Polltag {{ polltagResolve.name }}'
        }
      })
      .state('polltags.view', {
        url: '/:polltagId',
        templateUrl: 'modules/polltags/client/views/view-polltag.client.view.html',
        controller: 'PolltagsController',
        controllerAs: 'vm',
        resolve: {
          polltagResolve: getPolltag
        },
        data: {
          pageTitle: 'Polltag {{ polltagResolve.name }}'
        }
      });
  }

  getPolltag.$inject = ['$stateParams', 'PolltagsService'];

  function getPolltag($stateParams, PolltagsService) {
    return PolltagsService.get({
      polltagId: $stateParams.polltagId
    }).$promise;
  }

  newPolltag.$inject = ['PolltagsService'];

  function newPolltag(PolltagsService) {
    return new PolltagsService();
  }
}());
