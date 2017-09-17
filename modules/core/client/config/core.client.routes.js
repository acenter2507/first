'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise(function ($injector, $location) {
      $injector.get('$state').transitionTo('not-found', null, {
        location: false
      });
    });

    // Home state routing
    $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'modules/polls/client/views/list-polls.client.view.html',
      controller: 'PollsListController',
      controllerAs: 'vm',
      data: {
        pageTitle: 'Polls List'
      }
    })
    .state('not-found', {
      url: '/not-found',
      templateUrl: 'modules/core/client/views/404.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('bad-request', {
      url: '/bad-request',
      templateUrl: 'modules/core/client/views/400.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('forbidden', {
      url: '/forbidden',
      templateUrl: 'modules/core/client/views/403.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('about-us', {
      url: '/about-us',
      templateUrl: 'modules/core/client/views/other/about.client.view.html'
    })
    .state('guide', {
      abstract: true,
      url: '/guide',
      templateUrl: 'modules/core/client/views/other/guide/guide.client.view.html'
    })
    .state('guide.signup', {
      url: '/how-to-signup',
      templateUrl: 'modules/core/client/views/other/guide/signup.client.view.html'
    })
    .state('guide.poll', {
      url: '/how-to-create-poll',
      templateUrl: 'modules/core/client/views/other/guide/poll.client.view.html'
    })
    .state('guide.quick-poll', {
      url: '/how-to-create-quick-poll',
      templateUrl: 'modules/core/client/views/other/guide/quick-poll.client.view.html'
    })
    .state('guide.vote', {
      url: '/how-to-vote',
      templateUrl: 'modules/core/client/views/other/guide/vote.client.view.html'
    })
    .state('support', {
      url: '/support',
      templateUrl: 'modules/core/client/views/other/support.client.view.html'
    })
    .state('policy', {
      url: '/policy',
      templateUrl: 'modules/core/client/views/other/policy.client.view.html'
    })
    .state('term', {
      url: '/terms-of-service',
      templateUrl: 'modules/core/client/views/other/term.client.view.html'
    });
  }
]);
