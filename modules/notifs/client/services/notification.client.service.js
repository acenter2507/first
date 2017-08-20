'use strict';

angular.module('core').service('Notification', Notification);

Notification.$inject = ['$http', 'NotifsService'];
function Notification($http, NotifsService) {
  var notifCnt = 0;
  var notifications = [];
  this.loadNotifs = function () {
    $http.get('/api/notifs/load', { ignoreLoadingBar: true })
      .then(res => {
        notifCnt = res.data.count || 0;
        notifications = res.data.notifs || 0;
      });
  };
  this.clearNotifs = function () {
    $http.get('/api/clearAll', { ignoreLoadingBar: true })
      .then(res => {
        notifCnt = 0;
        notifications = [];
      });
  };
  this.markReadNotifs = function () {
    $http.get('/api/markAllRead', { ignoreLoadingBar: true })
      .then(res => {
        notifications.forEach(function (notif) {
          notif.status = 1;
        });
      });
  };
  this.markReadNotif = function (notifId) {
    var ntf = _.find(notifications, function (item) { return item._id.toString() === notifId.toString(); });
    if (ntf) {
      ntf.status = 1;
      notifCnt -= 1;
    }
    let rs_notf = new NotifsService({ _id: notifId });
    rs_notf.status = 1;
    rs_notf.$save();
  };
  this.getData = function () { return { notifCnt: notifCnt, notifications: notifications }; };
  // return this;
}
