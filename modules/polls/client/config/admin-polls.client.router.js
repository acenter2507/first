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
        template: '<ui-view></ui-view>',
        ncyBreadcrumb: {
          label: 'Polls'
        }
      })
      .state('admin.polls.list', {
        url: '/list',
        templateUrl: 'modules/polls/client/views/admin/list-polls.client.view.html',
        controller: 'AdminPollsListController',
        controllerAs: 'vm',
        ncyBreadcrumb: {
          label: 'List'
        }
      })
      .state('admin.polls.view', {
        url: '/:pollId',
        templateUrl: 'modules/polls/client/views/admin/view-poll.client.view.html',
        controller: 'AdminPollController',
        controllerAs: 'vm',
        resolve: {
          pollResolve: getPoll
        },
        data: {
          pageTitle: 'View poll'
        },
        ncyBreadcrumb: {
          label: 'View'
        }
      });
  }

  getPoll.$inject = ['$stateParams', 'PollsService'];

  function getPoll($stateParams, PollsService) {
    return PollsService.get({
      pollId: $stateParams.pollId
    }).$promise;
  }
}());
