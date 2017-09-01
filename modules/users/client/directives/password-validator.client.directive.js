'use strict';

angular.module('users')
  .directive('passwordValidator', ['PasswordValidator', function(PasswordValidator) {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        ngModel.$validators.requirements = function (password) {
          var status = true;
          if (password) {
            var result = {};
            PasswordValidator.getResult(password)
              .then(rs => {
                result = rs;
              });
            
            if (result.errors.length) {
              scope.passwordErrors = result.errors;
              status = false;
            } else {
              scope.passwordErrors = [];
              status = true;
            }
          }
          return status;
        };
      }
    };
  }]);
