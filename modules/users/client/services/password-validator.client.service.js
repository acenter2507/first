'use strict';

// PasswordValidator service used for testing the password strength
angular.module('users').factory('PasswordValidator', ['$window', '$translate',
  function ($window, $translate) {
    var owaspPasswordStrengthTest = $window.owaspPasswordStrengthTest;

    return {
      getResult: function (password) {
        return new Promise((resolve, reject) => {
          var result = { errors: [] };
          var check = 0;
          if (password.length < 8) {
            $translate('MS_PASS_MINLENGTH_ERROR').then(tsl => {
              result.errors.push[tsl];
              check += 1;
            });
          } else {
            check += 1;
          }
          if (password.length > 32) {
            $translate('MS_PASS_MAXLENGTH_ERROR').then(tsl => {
              result.errors.push[tsl];
              check += 1;
            });
          } else {
            check += 1;
          }
          if(/^[a-zA-Z0-9- ]*$/.test(str) === false) {
            $translate('MS_PASS_ILLEGAL_ERROR').then(tsl => {
              result.errors.push[tsl];
              check += 1;
            });
          } else {
            check += 1;
          }
          while(true) {
            if (check === 3) {
              return resolve(result);
            }
          }
        });
      },
      getPopoverMsg: function () {
        var popoverMsg = 'Please enter a passphrase or password with greater than 10 characters, numbers, lowercase, upppercase, and special characters.';
        return popoverMsg;
      }
    };
  }
]);
