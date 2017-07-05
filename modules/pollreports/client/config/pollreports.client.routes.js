(function () {
  'use strict';

  angular
    .module('pollreports')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('pollreports', {
        abstract: true,
        url: '/pollreports',
        template: '<ui-view/>'
      })
      .state('pollreports.list', {
        url: '',
        templateUrl: 'modules/pollreports/client/views/list-pollreports.client.view.html',
        controller: 'PollreportsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Pollreports List'
        }
      })
      .state('pollreports.create', {
        url: '/create',
        templateUrl: 'modules/pollreports/client/views/form-pollreport.client.view.html',
        controller: 'PollreportsController',
        controllerAs: 'vm',
        resolve: {
          pollreportResolve: newPollreport
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Pollreports Create'
        }
      })
      .state('pollreports.edit', {
        url: '/:pollreportId/edit',
        templateUrl: 'modules/pollreports/client/views/form-pollreport.client.view.html',
        controller: 'PollreportsController',
        controllerAs: 'vm',
        resolve: {
          pollreportResolve: getPollreport
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Pollreport {{ pollreportResolve.name }}'
        }
      })
      .state('pollreports.view', {
        url: '/:pollreportId',
        templateUrl: 'modules/pollreports/client/views/view-pollreport.client.view.html',
        controller: 'PollreportsController',
        controllerAs: 'vm',
        resolve: {
          pollreportResolve: getPollreport
        },
        data: {
          pageTitle: 'Pollreport {{ pollreportResolve.name }}'
        }
      });
  }

  getPollreport.$inject = ['$stateParams', 'PollreportsService'];

  function getPollreport($stateParams, PollreportsService) {
    return PollreportsService.get({
      pollreportId: $stateParams.pollreportId
    }).$promise;
  }

  newPollreport.$inject = ['PollreportsService'];

  function newPollreport(PollreportsService) {
    return new PollreportsService();
  }
}());
