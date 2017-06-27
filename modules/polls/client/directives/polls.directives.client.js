(function() {
  'use strict';
  angular.module('polls').directive('ngEnter', ngEnter);

  function ngEnter() {
    return function(scope, element, attrs) {
      element.bind('keydown keypress', function(event) {
        if (event.which === 13) {
          if (attrs.ngIsEnter === 'true') {
            scope.$apply(function() {
              scope.$eval(attrs.ngEnter);
            });
            event.preventDefault();
          }
        }
      });
    };
  }

  angular.module('polls').directive('focusMe', function($timeout) {
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

  angular.module('polls').directive('autoAdjust', function($filter) {
    return {
      restrict: 'AEC',
      scope: {
        value: '=ngBind'
      },
      link: function($scope, element, attrs) {
        var width = element[0].offsetWidth,
          charactersLimit = width / 12,
          text = $filter('splice')($scope.value, charactersLimit, '...');
      }
    };
  });
})();
