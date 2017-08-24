(function () {
  'use strict';
  angular.module('polls')
    .directive('pollItem', pollItem)
    // .directive('quickPoll', quickPoll)
    .directive('ngEnter', ngEnter)
    .directive('focusMe', focusMe)
    .directive('autoAdjust', autoAdjust)
    .directive('a', expandCard);

  pollItem.$inject = ['$templateCache'];
  function pollItem($templateCache) {
    return {
      restrict: 'E',
      replace: false,
      template: $templateCache.get('modules/core/client/views/templates/list-poll.client.template.html')
    };
  }
  quickPoll.$inject = ['$http', '$templateCache', '$compile'];
  function quickPoll($http, $templateCache, $compile) {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      link: (scope, element, attrs) => {
        $http.get('modules/polls/client/views/quick-poll.client.view.html', { cache: $templateCache })
          .then(function (res) {
            element.replaceWith($compile(res.data)(scope));
          });
      }
      // template: $templateCache.get('modules/polls/client/views/quick-poll.client.view.html')
    };
  }
  function ngEnter() {
    return function (scope, element, attrs) {
      element.bind('keydown keypress', function (event) {
        if (event.which === 13) {
          if (attrs.ngIsEnter === 'true') {
            scope.$apply(function () {
              scope.$eval(attrs.ngEnter);
            });
            event.preventDefault();
          }
        }
      });
    };
  }
  function focusMe($timeout) {
    return {
      scope: { trigger: '@focusMe' },
      link: function (scope, element) {
        scope.$watch('trigger', function (value) {
          if (value === 'true') {
            $timeout(function () {
              element[0].focus();
            });
          }
        });
      }
    };
  }
  function autoAdjust($filter) {
    return {
      restrict: 'AEC',
      scope: {
        value: '=ngBind'
      },
      link: function ($scope, element, attrs) {
        var width = element[0].offsetWidth,
          charactersLimit = width / 12,
          text = $filter('splice')($scope.value, charactersLimit, '...');
      }
    };
  }
  // expand toggle
  function expandCard() {
    var directive = {
      restrict: 'E',
      link: link
    };
    return directive;

    function link(scope, element, attrs) {
      if (element.hasClass('expand-toggle')) {
        element.on('click', function () {
          angular.element('.card.expand-card').toggleClass('open').find('.open').removeClass('open');
        });
      }
    }
  }

})();
