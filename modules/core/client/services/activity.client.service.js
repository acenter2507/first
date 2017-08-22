'use strict';

angular.module('core').service('Activitys', Activitys);

Activitys.$inject = ['Socket'];
function Activitys(Socket) {
  this.list = [];
  this.add = function (activity) {
    var time = new Date().toString();
    console.log(time);
    activity.time = time;
    this.list.push(activity);
  };
  return this;
}
