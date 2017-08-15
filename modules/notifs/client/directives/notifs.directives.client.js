(function () {
  'use strict';
  angular.module('notif')
    .directive('span', markReadNotif);

  function markReadNotif() {
    var directive = {
      restrict: 'E',
      link: link
    };
    return directive;

    function link(scope, element, attrs) {
    }
  }

})();
