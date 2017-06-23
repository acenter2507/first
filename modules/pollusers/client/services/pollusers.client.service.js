// Pollusers service used to communicate Pollusers REST endpoints
(function () {
  'use strict';

  angular
    .module('pollusers')
    .factory('PollusersService', PollusersService);

  PollusersService.$inject = ['$resource'];

  function PollusersService($resource) {
    return $resource('api/pollusers/:polluserId', {
      polluserId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
