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
      findNotifs: (limit, page) => {
        let _page = page || 0;
        return $http.get('/api/findNotifs/' + limit + '/' + _page);
      },
      countUnchecks: () => {
        return $http.get('/api/countUnchecks');
      },
      markAllRead: () => {
        return $http.get('/api/markAllRead');
      }
    };
  }
})();
