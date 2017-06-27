'use strict';

/**
 * Edits by Ryan Hutchison
 * Credit: https://github.com/paulyoder/angular-bootstrap-show-errors */

angular
  .module('core')
  .directive('showErrors', [
    '$timeout',
    '$interpolate',
    function($timeout, $interpolate) {
      var linkFn = function(scope, el, attrs, formCtrl) {
        var inputEl,
          inputName,
          inputNgEl,
          options,
          showSuccess,
          toggleClasses,
          initCheck = false,
          showValidationMessages = false,
          blurred = false;

        options = scope.$eval(attrs.showErrors) || {};
        showSuccess = options.showSuccess || false;
        inputEl =
          el[0].querySelector('.form-control[name]') ||
          el[0].querySelector('[name]');
        inputNgEl = angular.element(inputEl);
        inputName = $interpolate(inputNgEl.attr('name') || '')(scope);

        if (!inputName) {
          throw 'show-errors element has no child input elements with a \'name\' attribute class';
        }

        var reset = function() {
          return $timeout(
            function() {
              el.removeClass('has-error');
              el.removeClass('has-success');
              showValidationMessages = false;
            },
            0,
            false
          );
        };

        scope.$watch(
          function() {
            return formCtrl[inputName] && formCtrl[inputName].$invalid;
          },
          function(invalid) {
            return toggleClasses(invalid);
          }
        );

        scope.$on('show-errors-check-validity', function(event, name) {
          if (angular.isUndefined(name) || formCtrl.$name === name) {
            initCheck = true;
            showValidationMessages = true;

            return toggleClasses(formCtrl[inputName].$invalid);
          }
        });

        scope.$on('show-errors-reset', function(event, name) {
          if (angular.isUndefined(name) || formCtrl.$name === name) {
            return reset();
          }
        });

        toggleClasses = function(invalid) {
          el.toggleClass('has-error', showValidationMessages && invalid);
          if (showSuccess) {
            return el.toggleClass(
              'has-success',
              showValidationMessages && !invalid
            );
          }
        };
      };

      return {
        restrict: 'A',
        require: '^form',
        compile: function(elem, attrs) {
          if (attrs.showErrors.indexOf('skipFormGroupCheck') === -1) {
            if (
              !(elem.hasClass('form-group') || elem.hasClass('input-group'))
            ) {
              throw 'show-errors element does not have the \'form-group\' or \'input-group\' class';
            }
          }
          return linkFn;
        }
      };
    }
  ])
  .filter('splice', function() {
    return function(value, max, tail) {
      if (!value) return '';
      max = parseInt(max, 10);
      if (!max) return value;
      if (value.length <= max) return value;
      value = value.substr(0, max);
      return value + (tail || ' …');
    };
  })
  // Chuyển đổi nội dung comment giữ nguyên line break
  .filter('nl2br', function($sce) {
    return function(msg, is_xhtml) {
      var is_xhtml = is_xhtml || true;
      var breakTag = is_xhtml ? '<br />' : '<br>';
      var msg = (msg + '').replace(
        /([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,
        '$1' + breakTag + '$2'
      );
      return $sce.trustAsHtml(msg);
    };
  });
