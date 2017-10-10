'use strict';

//TODO this should be Users service
angular.module('tickets.admin')
  .factory('Admin', admin)
  .factory('AdminApi', AdminApi);

admin.$inject = ['$resource'];
function admin($resource) {
  return $resource('api/tickets/:adticketId', { adticketId: '@_id' }, {
    update: {
      method: 'PUT',
      ignoreLoadingBar: true
    },
  });
}
AdminApi.$inject = ['$http'];
function AdminApi($http) {
  this.get_tickets = (page, condition) => {
    return $http.post('/api/admins/tickets', { page: page, condition: condition }, {
      ignoreLoadingBar: true
    });
  };

  return this;
}
