(function() {
  'use strict';
  angular
    .module('polls')
    .directive('ngEnter', ngEnter);

  function ngEnter() {
    return function(scope, element, attrs) {
      element.bind("keydown keypress", function(event) {
        if (event.which === 13) {
          scope.$apply(function() {
            scope.$eval(attrs.ngEnter);
          });

          event.preventDefault();
        }
      });
    };
  }

  angular
    .module('polls')
    .directive('focusCmt', focusCmt);
  focusCmt.$inject = [
    '$timeout',
    '$parse',
  ];

  function focusCmt($timeout, $parse) {
    return {
      link: function(scope, element, attrs) {
        var model = $parse(attrs.focusMe);
        scope.$watch(model, function(value) {
          console.log('value=', value);
          if (value === true) {
            $timeout(function() {
              element[0].focus();
            });
          }
        });
        element.bind('blur', function() {
          console.log('blur')
          scope.$apply(model.assign(scope, false));
        })
      }
    };
  }
}());
