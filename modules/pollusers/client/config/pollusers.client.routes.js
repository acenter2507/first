(function () {
  'use strict';

  angular
    .module('pollusers')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('pollusers', {
        abstract: true,
        url: '/pollusers',
        template: '<ui-view/>'
      })
      .state('pollusers.list', {
        url: '',
        templateUrl: 'modules/pollusers/client/views/list-pollusers.client.view.html',
        controller: 'PollusersListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Pollusers List'
        }
      })
      .state('pollusers.create', {
        url: '/create',
        templateUrl: 'modules/pollusers/client/views/form-polluser.client.view.html',
        controller: 'PollusersController',
        controllerAs: 'vm',
        resolve: {
          polluserResolve: newPolluser
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Pollusers Create'
        }
      })
      .state('pollusers.edit', {
        url: '/:polluserId/edit',
        templateUrl: 'modules/pollusers/client/views/form-polluser.client.view.html',
        controller: 'PollusersController',
        controllerAs: 'vm',
        resolve: {
          polluserResolve: getPolluser
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Polluser {{ polluserResolve.name }}'
        }
      })
      .state('pollusers.view', {
        url: '/:polluserId',
        templateUrl: 'modules/pollusers/client/views/view-polluser.client.view.html',
        controller: 'PollusersController',
        controllerAs: 'vm',
        resolve: {
          polluserResolve: getPolluser
        },
        data: {
          pageTitle: 'Polluser {{ polluserResolve.name }}'
        }
      });
  }

  getPolluser.$inject = ['$stateParams', 'PollusersService'];

  function getPolluser($stateParams, PollusersService) {
    return PollusersService.get({
      polluserId: $stateParams.polluserId
    }).$promise;
  }

  newPolluser.$inject = ['PollusersService'];

  function newPolluser(PollusersService) {
    return new PollusersService();
  }
}());
