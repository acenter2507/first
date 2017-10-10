'use strict';

// Setting up route
angular.module('tickets.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.tickets', {
        url: '/tickets',
        abstract: true,
        template: '<ui-view></ui-view>',
        ncyBreadcrumb: {
          label: 'Tickets'
        }
      })
      .state('admin.tickets.list', {
        url: '/list',
        templateUrl: 'modules/tickets/client/views/admin/list-tickets.client.view.html',
        controller: 'AdminTicketListController',
        controllerAs: 'vm',
        ncyBreadcrumb: {
          label: 'List'
        },
        data: { roles: ['admin'] }
      })
      .state('admin.tickets.view', {
        url: '/:ticketId',
        templateUrl: 'modules/tickets/client/views/admin/view-ticket.client.view.html',
        controller: 'AdminTicketViewController',
        ncyBreadcrumb: {
          label: 'View ticket info'
        },
        data: { roles: ['admin'] },
        resolve: {
          ticketResolve: ['$stateParams', 'TicketsService', function ($stateParams, TicketsService) {
            return TicketsService.get({
              ticketId: $stateParams.ticketId
            }).$promise;
          }]
        }
      })
      .state('admin.tickets.reply', {
        url: '/:ticketId/reply',
        templateUrl: 'modules/tickets/client/views/admin/reply-ticket.client.view.html',
        controller: 'AdminTicketController',
        ncyBreadcrumb: {
          label: 'Reply ticket'
        },
        data: { roles: ['admin'] },
        resolve: {
          ticketResolve: ['$stateParams', 'TicketsService', function ($stateParams, TicketsService) {
            return TicketsService.get({
              ticketId: $stateParams.ticketId
            }).$promise;
          }]
        }
      })
      .state('admin.tickets.edit', {
        url: '/:ticketId/edit',
        templateUrl: 'modules/tickets/client/views/admin/form-ticket.client.view.html',
        controller: 'AdminTicketController',
        ncyBreadcrumb: {
          label: 'Reply ticket'
        },
        data: { roles: ['admin'] },
        resolve: {
          ticketResolve: ['$stateParams', 'TicketsService', function ($stateParams, TicketsService) {
            return TicketsService.get({
              ticketId: $stateParams.ticketId
            }).$promise;
          }]
        }
      })
      ;
  }
]);