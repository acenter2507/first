'use strict';

angular.module('core').service('Notification', Notification);

Notification.$inject = ['$http', 'NotifsService'];
function Notification($http, NotifsService) {
  this.notifCnt = 0;
  this.notifications = [];
  this.loadNotifs = function () {
    $http.get('/api/notifs/load', { ignoreLoadingBar: true })
      .then(res => {
        this.notifCnt = res.data.count || 0;
        this.notifications = res.data.notifs || 0;
      });
  };
  this.clearNotifs = function () {
    $http.get('/api/clearAll', { ignoreLoadingBar: true })
      .then(res => {
        this.notifCnt = 0;
        this.notifications = [];
      });
  };
  this.markReadNotifs = function () {
    $http.get('/api/markAllRead', { ignoreLoadingBar: true })
      .then(res => {
        this.notifications.forEach(function (notif) {
          notif.status = 1;
        });
        this.notifCnt = 0;
      });
  };
  this.markReadNotif = function (notifId) {
    var ntf = _.find(this.notifications, function (item) { return item._id.toString() === notifId.toString(); });
    if (ntf) {
      ntf.status = 1;
      this.notifCnt -= 1;
    }
    let rs_notf = new NotifsService({ _id: notifId });
    rs_notf.status = 1;
    rs_notf.$update();
  };
  this.getData = function () { return { notifCnt: this.notifCnt, notifications: this.notifications }; };
  this.getNotifCnt = function () { return this.notifCnt; };
  this.getNotifications = function () { return this.notifications; };
  return this;
}
