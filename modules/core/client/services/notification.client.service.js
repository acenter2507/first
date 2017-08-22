'use strict';

angular.module('core').service('Notifications', Notifications);

Notifications.$inject = ['$http', 'NotifsService'];
function Notifications($http, NotifsService) {
  var sv = {};
  sv.notifCnt = 0;
  sv.notifications = [];
  sv.loadNotifs = function () {
    $http.get('/api/notifs/load', { ignoreLoadingBar: true })
      .then(res => {
        sv.notifCnt = res.data.count || 0;
        sv.notifications = res.data.notifs || 0;
      });
  };
  sv.clearNotifs = function () {
    $http.get('/api/clearAll', { ignoreLoadingBar: true })
      .then(res => {
        sv.notifCnt = 0;
        sv.notifications = [];
      });
  };
  sv.markReadNotifs = function () {
    return new Promise((resolve, reject) => {
      $http.get('/api/markAllRead', { ignoreLoadingBar: true })
        .then(res => {
          sv.notifications.forEach(function (notif) {
            notif.status = 1;
          });
          sv.notifCnt = 0;
          return resolve();
        })
        .catch(err => {
          return reject();
        });
    });
  };
  sv.markReadNotif = function (notifId, status) {
    var _status = status === undefined ? 1 : status;
    var ntf = _.find(sv.notifications, function (item) { return item._id.toString() === notifId.toString(); });
    if (ntf) {
      ntf.status = _status;
      sv.notifCnt += _status === 1 ? -1 : 1;
    }
    let rs_notf = new NotifsService({ _id: notifId });
    rs_notf.status = _status;
    rs_notf.$update();
  };
  sv.markUnReadNotif = function (notifId) {
    var ntf = _.find(sv.notifications, function (item) { return item._id.toString() === notifId.toString(); });
    if (ntf) {
      ntf.status = 0;
      sv.notifCnt += 1;
    }
    let rs_notf = new NotifsService({ _id: notifId });
    rs_notf.status = 1;
    rs_notf.$update();
  };
  sv.getData = function () { return { notifCnt: this.notifCnt, notifications: this.notifications }; };
  sv.getNotifCnt = function () { return this.notifCnt; };
  sv.getNotifications = function () { return this.notifications; };
  return sv;
}
