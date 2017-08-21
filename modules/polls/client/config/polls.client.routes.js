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
        controllerAs: 'ctrl',
        resolve: {
          pollResolve: newPoll,
          notifResolve: getNotif
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Polls Create'
        }
      })
      .state('polls.edit', {
        url: '/:pollId/edit?notif',
        templateUrl: 'modules/polls/client/views/form-poll.client.view.html',
        controller: 'PollInputController',
        controllerAs: 'ctrl',
        resolve: {
          pollResolve: getPoll,
          notifResolve: getNotif
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Poll {{ pollResolve.name }}'
        }
      })
      .state('polls.view', {
        url: '/:pollId?notif?share',
        views: {
          '': {
            templateUrl: 'modules/polls/client/views/view-poll.client.view.html',
            controller: 'PollsController',
            controllerAs: 'vm',
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
      })
      .state('search', {
        url: '/search?key?in?status?sort?by?ctgr?created_start?created_end?allow_multiple?allow_add?allow_guest?cmts_pref?cmts?likes_pref?likes?votes_pref?votes?views_pref?views',
        templateUrl: 'modules/polls/client/views/search.client.view.html',
        controller: 'PollsSearchController',
        data: {
          pageTitle: 'Search'
        }
      });
  }

  getPoll.$inject = ['$stateParams', 'PollsService'];

  function getPoll($stateParams, PollsService) {
    return PollsService.get({
      pollId: $stateParams.pollId
    }).$promise;
  }
  getNotif.$inject = ['$stateParams', 'NotifsService'];

  function getNotif($stateParams, NotifsService) {
    return $stateParams.notif ? NotifsService.get({
      notifId: $stateParams.notif
    }).$promise : null;
  }
  
  newPoll.$inject = ['PollsService'];

  function newPoll(PollsService) {
    return new PollsService();
  }
})();
