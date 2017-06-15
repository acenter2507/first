// Cmts service used to communicate Cmts REST endpoints
(function () {
  'use strict';

  angular
    .module('cmts')
    .factory('CmtsService', CmtsService);

  CmtsService.$inject = ['$resource'];

  function CmtsService($resource) {
    return $resource('api/cmts/:cmtId', {
      cmtId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
