(function () {
  'use strict';

  angular
    .module('voteopts')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('voteopts', {
        abstract: true,
        url: '/voteopts',
        template: '<ui-view/>'
      })
      .state('voteopts.list', {
        url: '',
        templateUrl: 'modules/voteopts/client/views/list-voteopts.client.view.html',
        controller: 'VoteoptsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Voteopts List'
        }
      })
      .state('voteopts.create', {
        url: '/create',
        templateUrl: 'modules/voteopts/client/views/form-voteopt.client.view.html',
        controller: 'VoteoptsController',
        controllerAs: 'vm',
        resolve: {
          voteoptResolve: newVoteopt
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Voteopts Create'
        }
      })
      .state('voteopts.edit', {
        url: '/:voteoptId/edit',
        templateUrl: 'modules/voteopts/client/views/form-voteopt.client.view.html',
        controller: 'VoteoptsController',
        controllerAs: 'vm',
        resolve: {
          voteoptResolve: getVoteopt
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Voteopt {{ voteoptResolve.name }}'
        }
      })
      .state('voteopts.view', {
        url: '/:voteoptId',
        templateUrl: 'modules/voteopts/client/views/view-voteopt.client.view.html',
        controller: 'VoteoptsController',
        controllerAs: 'vm',
        resolve: {
          voteoptResolve: getVoteopt
        },
        data: {
          pageTitle: 'Voteopt {{ voteoptResolve.name }}'
        }
      });
  }

  getVoteopt.$inject = ['$stateParams', 'VoteoptsService'];

  function getVoteopt($stateParams, VoteoptsService) {
    return VoteoptsService.get({
      voteoptId: $stateParams.voteoptId
    }).$promise;
  }

  newVoteopt.$inject = ['VoteoptsService'];

  function newVoteopt(VoteoptsService) {
    return new VoteoptsService();
  }
}());
