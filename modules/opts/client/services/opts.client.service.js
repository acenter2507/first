// Opts service used to communicate Opts REST endpoints
(function () {
  'use strict';

  angular
    .module('opts')
    .factory('OptsService', OptsService);

  OptsService.$inject = ['$resource'];

  function OptsService($resource) {
    return $resource('api/opts/:optId', {
      optId: '@_id'
    }, {
      update: {
        method: 'PUT',
        ignoreLoadingBar: true
      }
    });
  }
}());
