// Pollreports service used to communicate Pollreports REST endpoints
(function () {
  'use strict';

  angular
    .module('pollreports')
    .factory('PollreportsService', PollreportsService);

  PollreportsService.$inject = ['$resource'];

  function PollreportsService($resource) {
    return $resource('api/pollreports/:pollreportId', {
      pollreportId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
