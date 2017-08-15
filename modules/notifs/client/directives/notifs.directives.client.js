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
      element.on('click', function (event) {
        if (element.hasClass('notif-read-toggle')) {
          console.log('XXXXX');
          event.stopPropagation();
        }
      });
    }
  }

})();
