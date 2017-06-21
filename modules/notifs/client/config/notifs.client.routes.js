(function () {
  'use strict';

  angular
    .module('notifs')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('notifs', {
        abstract: true,
        url: '/notifs',
        template: '<ui-view/>'
      })
      .state('notifs.list', {
        url: '',
        templateUrl: 'modules/notifs/client/views/list-notifs.client.view.html',
        controller: 'NotifsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Notifs List'
        }
      })
      .state('notifs.create', {
        url: '/create',
        templateUrl: 'modules/notifs/client/views/form-notif.client.view.html',
        controller: 'NotifsController',
        controllerAs: 'vm',
        resolve: {
          notifResolve: newNotif
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Notifs Create'
        }
      })
      .state('notifs.edit', {
        url: '/:notifId/edit',
        templateUrl: 'modules/notifs/client/views/form-notif.client.view.html',
        controller: 'NotifsController',
        controllerAs: 'vm',
        resolve: {
          notifResolve: getNotif
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Notif {{ notifResolve.name }}'
        }
      })
      .state('notifs.view', {
        url: '/:notifId',
        templateUrl: 'modules/notifs/client/views/view-notif.client.view.html',
        controller: 'NotifsController',
        controllerAs: 'vm',
        resolve: {
          notifResolve: getNotif
        },
        data: {
          pageTitle: 'Notif {{ notifResolve.name }}'
        }
      });
  }

  getNotif.$inject = ['$stateParams', 'NotifsService'];

  function getNotif($stateParams, NotifsService) {
    return NotifsService.get({
      notifId: $stateParams.notifId
    }).$promise;
  }

  newNotif.$inject = ['NotifsService'];

  function newNotif(NotifsService) {
    return new NotifsService();
  }
}());
