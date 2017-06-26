(function() {
  'use strict';
  angular
    .module('polls')
    .directive('ngEnter', ngEnter);

  function ngEnter() {
    return function(scope, element, attrs) {
      element.bind('keydown keypress', function(event) {
        console.log(attrs);
        if (event.which === 13) {
          if (!attrs.ngIsEnter) {
            return;
          }
          scope.$apply(function() {
            scope.$eval(attrs.ngEnter);
          });

          event.preventDefault();
        }
      });
    };
  }

  angular
    .module('polls').directive('focusMe', function($timeout) {
      return {
        scope: { trigger: '@focusMe' },
        link: function(scope, element) {
          scope.$watch('trigger', function(value) {
            if (value === 'true') {
              $timeout(function() {
                element[0].focus();
              });
            }
          });
        }
      };
    });
}());
