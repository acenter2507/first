// Notifs service used to communicate Notifs REST endpoints
(function () {
  'use strict';

  angular
    .module('notifs')
    .factory('NotifsService', NotifsService);

  NotifsService.$inject = ['$resource'];

  function NotifsService($resource) {
    return $resource('api/notifs/:notifId', {
      notifId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
