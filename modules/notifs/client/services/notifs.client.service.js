// Notifs service used to communicate Notifs REST endpoints
(function() {
  'use strict';
  angular.module('notifs').factory('NotifsService', NotifsService);

  NotifsService.$inject = ['$resource'];

  function NotifsService($resource) {
    return $resource(
      'api/notifs/:notifId',
      {
        notifId: '@_id'
      },
      {
        update: {
          method: 'PUT'
        }
      }
    );
  }

  angular.module('notifs').factory('NotifsApi', NotifsApi);

  NotifsApi.$inject = ['$http'];

  function NotifsApi($http) {
    return {
      findNotifs: limit => {
        return $http.post('/api/findNotifs', { limit: limit });
      },
      countUnchecks: () => {
        return $http.get('/api/countUnchecks');
      }
    };
  }
})();
