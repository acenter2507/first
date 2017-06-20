(function () {
  'use strict';

  angular
    .module('votes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('votes', {
        abstract: true,
        url: '/votes',
        template: '<ui-view/>'
      })
      .state('votes.list', {
        url: '',
        templateUrl: 'modules/votes/client/views/list-votes.client.view.html',
        controller: 'VotesListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Votes List'
        }
      })
      .state('votes.create', {
        url: '/create',
        templateUrl: 'modules/votes/client/views/form-vote.client.view.html',
        controller: 'VotesController',
        controllerAs: 'vm',
        resolve: {
          voteResolve: newVote
        },
        data: {
          // roles: ['user', 'admin'],
          roles: ['*'],
          pageTitle: 'Votes Create'
        }
      })
      .state('votes.edit', {
        url: '/:voteId/edit',
        templateUrl: 'modules/votes/client/views/form-vote.client.view.html',
        controller: 'VotesController',
        controllerAs: 'vm',
        resolve: {
          voteResolve: getVote
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Vote {{ voteResolve.name }}'
        }
      })
      .state('votes.view', {
        url: '/:voteId',
        templateUrl: 'modules/votes/client/views/view-vote.client.view.html',
        controller: 'VotesController',
        controllerAs: 'vm',
        resolve: {
          voteResolve: getVote
        },
        data: {
          pageTitle: 'Vote {{ voteResolve.name }}'
        }
      });
  }

  getVote.$inject = ['$stateParams', 'VotesService'];

  function getVote($stateParams, VotesService) {
    return VotesService.get({
      voteId: $stateParams.voteId
    }).$promise;
  }

  newVote.$inject = ['VotesService'];

  function newVote(VotesService) {
    return new VotesService();
  }
}());
