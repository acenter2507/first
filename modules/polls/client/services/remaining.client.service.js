(function() {
  'use strict';
  angular.module('polls').factory('Remaining', Remaining);

  Remaining.$inject = ['$timeout'];

  function Remaining($timeout) {
    var duration = function(endTime) {
      var timeSpan = getRemainigTime(endTime);
      var days = Math.floor(timeSpan / 86400000);
      var diff = timeSpan - days * 86400000;
      var hours = Math.floor(diff / 3600000);
      diff = diff - hours * 3600000;
      var minutes = Math.floor(diff / 60000);
      diff = diff - minutes * 60000;
      var secs = Math.floor(diff / 1000);
      return { days: days, hours: hours, minutes: minutes, seconds: secs };
    };
    function getRemainigTime(endTime) {
      var now = moment().utc();
      return moment(endTime) - now;
    }
    return {
      duration: duration
    };
  }
})();
