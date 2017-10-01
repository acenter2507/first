(function () {
  'use strict';

  angular
    .module('polls.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.polls', {
        url: '/polls',
        abstract: true,
        template: '<ui-view></ui-view>'
      })
      .state('admin.polls.list', {
        url: '/list',
        templateUrl: 'modules/polls/client/views/admin/admin-polls.client.view.html',
        controller: 'AdminPollsController',
        controllerAs: 'vm',
        data: { roles: ['admin'] }
      })
      .state('admin.polls.view', {
        url: '/:pollId',
        templateUrl: 'modules/polls/client/views/admin/admin-view-poll.client.view.html',
        controller: 'AdminPollController',
        controllerAs: 'vm',
        resolve: {
          pollResolve: getPoll
        },
        data: { roles: ['admin'] }
      });
  }

  getPoll.$inject = ['$stateParams', 'PollsService'];

  function getPoll($stateParams, PollsService) {
    return PollsService.get({
      pollId: $stateParams.pollId
    }).$promise;
  }
}());
