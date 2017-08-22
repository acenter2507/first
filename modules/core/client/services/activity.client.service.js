'use strict';

angular.module('core').factory('Activitys', Activitys);

Activitys.$inject = [];
function Activitys() {
  var svc = {};
  svc.list = [];

  svc.add = function (activity) {
    var time = moment().format();
    activity.time = time;
    svc.list.push(activity);
  };
  return svc;
}
