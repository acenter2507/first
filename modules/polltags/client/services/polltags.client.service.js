// Polltags service used to communicate Polltags REST endpoints
(function () {
  'use strict';

  angular
    .module('polltags')
    .factory('PolltagsService', PolltagsService);

  PolltagsService.$inject = ['$resource'];

  function PolltagsService($resource) {
    return $resource('api/polltags/:polltagId', {
      polltagId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
