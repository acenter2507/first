// Tickets service used to communicate Tickets REST endpoints
(function () {
  'use strict';

  angular
    .module('tickets')
    .factory('TicketsService', TicketsService)
    .factory('TicketsAdminService', TicketsAdminService);

  TicketsService.$inject = ['$resource'];
  function TicketsService($resource) {
    return $resource('api/tickets/:ticketId', { ticketId: '@_id' }, {
      update: {
        method: 'PUT'
      }
    });
  }
  // truyen id vao ah Ko truyen lay gi no request cha
  TicketsAdminService.$inject = ['$http'];
  function TicketsAdminService($http) {
    this.send = (ticketId, responseBody) => {
      return $http.post('/api/tickets/' + ticketId + '/send', { responseBody: responseBody }, {
        ignoreLoadingBar: true
      });
    };

    this.getTickets = (page, condition) => {
      return $http.post('/api/tickets/search', { page: page, condition: condition }, {
        ignoreLoadingBar: true
      });
    };
    return this;
  }
}());
