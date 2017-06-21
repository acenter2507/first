// Cmtlikes service used to communicate Cmtlikes REST endpoints
(function () {
  'use strict';

  angular
    .module('cmtlikes')
    .factory('CmtlikesService', CmtlikesService);

  CmtlikesService.$inject = ['$resource'];

  function CmtlikesService($resource) {
    return $resource('api/cmtlikes/:cmtlikeId', {
      cmtlikeId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
