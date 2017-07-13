(function() {
  'use strict';
  angular.module('polls').config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('polls', {
        abstract: true,
        url: '/polls',
        template: '<ui-view/>'
      })
      .state('polls.list', {
        url: '',
        templateUrl: 'modules/polls/client/views/list-polls.client.view.html',
        controller: 'PollsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Polls List'
        }
      })
      .state('polls.create', {
        url: '/create',
        templateUrl: 'modules/polls/client/views/form-poll.client.view.html',
        controller: 'PollInputController',
        controllerAs: 'vm',
        resolve: {
          pollResolve: newPoll
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Polls Create'
        }
      })
      .state('polls.edit', {
        url: '/:pollId/edit',
        templateUrl: 'modules/polls/client/views/form-poll.client.view.html',
        controller: 'PollInputController',
        controllerAs: 'vm',
        resolve: {
          pollResolve: getPoll
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Poll {{ pollResolve.name }}'
        }
      })
      .state('polls.view', {
        url: '/:pollId?notifId=:notifId',
        views: {
          '': {
            templateUrl: 'modules/polls/client/views/view-poll.client.view.html',
            controller: 'PollsController',
            controllerAs: 'vm',
            resolve: {
              pollResolve: getPoll
            },
            data: {
              pageTitle: 'Poll {{ pollResolve.name }}'
            }
          },
          'opts@polls.view': {
            templateUrl: 'modules/polls/client/views/list-opts.client.view.html'
          },
          'cmts@polls.view': {
            templateUrl: 'modules/polls/client/views/list-cmts.client.view.html'
          }
        }
      });
  }

  getPoll.$inject = ['$stateParams', 'PollsService'];

  function getPoll($stateParams, PollsService) {
    return PollsService.get({
      pollId: $stateParams.pollId
    }).$promise;
  }

  getNotifi.$inject = ['$stateParams', 'NotifisService'];

  function getNotifi($stateParams, PollsService) {
    const notifiId = $stateParams.notifiId;
    return notifiId ? NotifisService.get({
      notifiId: $stateParams.notifiId
    }).$promise : null;
  }

  newPoll.$inject = ['PollsService'];

  function newPoll(PollsService) {
    return new PollsService();
  }
})();
