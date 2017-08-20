'use strict';

angular.module('core').factory('Notification', Notification);

Notification.$inject = ['$http', 'NotifsService'];
function Notification($http, NotifsService) {
  var notifCnt = 0;
  var notifications = [];
  function loadNotifs() {
    $http.get('/api/notifs/load', { ignoreLoadingBar: true })
      .then(res => {
        notifCnt = res.data.count || 0;
        notifications = res.data.notifs || 0;
      });
  };
  function clearNotifs() {
    $http.get('/api/clearAll', { ignoreLoadingBar: true })
      .then(res => {
        notifCnt = 0;
        notifications = [];
      });
  };
  function markReadNotifs() {
    $http.get('/api/markAllRead', { ignoreLoadingBar: true })
      .then(res => {
        notifications.forEach(function (notif) {
          notif.status = 1;
        });
      });
  };
  function markReadNotif(notifId) {
    var ntf = _.find(notifications, function (item) { return item._id.toString() === notifId.toString(); });
    if (ntf) {
      ntf.status = 1;
      notifCnt -= 1;
    }
    let rs_notf = new NotifsService({ _id: notifId });
    rs_notf.status = 1;
    rs_notf.$save();
  };
  function getData() { return { notifCnt: notifCnt, notifications: notifications }; };
  function getNotifCnt() { return notifCnt; };
  function getNotifications() { return notifications; };
  return {
    loadNotifs: loadNotifs,
    clearNotifs: clearNotifs,
    markReadNotifs: markReadNotifs,
    markReadNotif: markReadNotif,
    getData: getData,
    getNotifCnt: getNotifCnt,
    getNotifications: getNotifications
  };
  // return this;
}
