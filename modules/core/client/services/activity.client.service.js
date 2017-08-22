'use strict';

angular.module('core').factory('Activitys', Activitys);

Activitys.$inject = [];
function Activitys() {
  var svc = {};
  svc.list = [];

  svc.add = function (activity) {
    svc.list.push(activity);
  };
  return svc;
}
