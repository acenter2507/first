(function() {
  'use strict';
  // Setting up route
  angular.module('users').config(routeConfig);
  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    // Users state routing
    $stateProvider
      .state('profile', {
        abstract: true,
        url: '/profile/:userId',
        templateUrl: 'modules/users/client/views/profiles/profile.client.view.html',
        controller: 'ProfileController',
        resolve: {
          profileResolve: getProfile
        }
      })
      .state('profile.edit', {
        url: '/edit',
        templateUrl: 'modules/users/client/views/profiles/profile.edit.client.view.html'
      })
      .state('profile.info', {
        url: '/info',
        templateUrl: 'modules/users/client/views/profiles/profile.info.client.view.html'
      })
      .state('profile.polls', {
        url: '/polls',
        templateUrl: 'modules/users/client/views/profiles/profile.polls.client.view.html'
      })
      .state('profile.cmts', {
        url: '/comments',
        templateUrl: 'modules/users/client/views/profiles/profile.cmts.client.view.html'
      })
      .state('profile.votes', {
        url: '/votes',
        templateUrl: 'modules/users/client/views/profiles/profile.votes.client.view.html'
      })
      .state('profile.follows', {
        url: '/follows',
        templateUrl: 'modules/users/client/views/profiles/profile.follows.client.view.html'
      })
      .state('profile.bookmarks', {
        url: '/bookmarks',
        templateUrl: 'modules/users/client/views/profiles/profile.bookmarks.client.view.html'
      })
      .state('profile.views', {
        url: '/views',
        templateUrl: 'modules/users/client/views/profiles/profile.views.client.view.html'
      })
      .state('profile.likes', {
        url: '/likes',
        templateUrl: 'modules/users/client/views/profiles/profile.likes.client.view.html'
      })
      .state('profile.dislikes', {
        url: '/dislikes',
        templateUrl: 'modules/users/client/views/profiles/profile.dislikes.client.view.html'
      })
      .state('settings', {
        abstract: true,
        url: '/settings',
        templateUrl: 'modules/users/client/views/settings/settings.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('settings.profile', {
        url: '/profile',
        templateUrl: 'modules/users/client/views/settings/edit-profile.client.view.html'
      })
      .state('settings.password', {
        url: '/password',
        templateUrl: 'modules/users/client/views/settings/change-password.client.view.html'
      })
      .state('settings.accounts', {
        url: '/accounts',
        templateUrl: 'modules/users/client/views/settings/manage-social-accounts.client.view.html'
      })
      .state('settings.picture', {
        url: '/picture',
        templateUrl: 'modules/users/client/views/settings/change-profile-picture.client.view.html'
      })
      .state('authentication', {
        abstract: true,
        url: '/authentication',
        templateUrl: 'modules/users/client/views/authentication/authentication.client.view.html'
      })
      .state('authentication.signup', {
        url: '/signup',
        templateUrl: 'modules/users/client/views/authentication/signup.client.view.html'
      })
      .state('authentication.signin', {
        url: '/signin?err',
        templateUrl: 'modules/users/client/views/authentication/signin.client.view.html'
      })
      .state('verification', {
        abstract: true,
        url: '/verification',
        template: '<ui-view>'
      })
      .state('verification.send', {
        url: '/send',
        templateUrl: 'modules/users/client/views/authentication/send.client.view.html'
      })
      .state('verification.error', {
        url: '/error?err',
        templateUrl: 'modules/users/client/views/authentication/error.client.view.html'
      })
      .state('password', {
        abstract: true,
        url: '/password',
        template: '<ui-view/>'
      })
      .state('password.forgot', {
        url: '/forgot',
        templateUrl: 'modules/users/client/views/password/forgot-password.client.view.html'
      })
      .state('password.reset', {
        abstract: true,
        url: '/reset',
        template: '<ui-view/>'
      })
      .state('password.reset.invalid', {
        url: '/invalid',
        templateUrl: 'modules/users/client/views/password/reset-password-invalid.client.view.html'
      })
      .state('password.reset.success', {
        url: '/success',
        templateUrl: 'modules/users/client/views/password/reset-password-success.client.view.html'
      })
      .state('password.reset.form', {
        url: '/:token',
        templateUrl: 'modules/users/client/views/password/reset-password.client.view.html'
      });
  }

  getProfile.$inject = ['$stateParams', 'Profile'];

  function getProfile($stateParams, Profile) {
    return Profile.get({
      userId: $stateParams.userId
    }).$promise;
  }
})();
