// Views service used to communicate Views REST endpoints
(function () {
  'use strict';

  angular
    .module('views')
    .factory('ViewsService', ViewsService);

  ViewsService.$inject = ['$resource'];

  function ViewsService($resource) {
    return $resource('api/views/:viewId', {
      viewId: '@_id'
    }, {
      update: {
        method: 'PUT',
        ignoreLoadingBar: true
      }
    });
  }
}());
