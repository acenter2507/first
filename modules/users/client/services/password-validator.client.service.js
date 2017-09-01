'use strict';

// PasswordValidator service used for testing the password strength
angular.module('users').factory('PasswordValidator', ['$window', '$translate',
  function ($window, $translate) {
    return {
      getResult: function (password) {
        var result = { errors: [] };
        var check = 0;
        if (password.length < 8) {
          result.errors.push('MS_PASS_MINLENGTH_ERROR');
        }
        if (password.length > 32) {
          result.errors.push('MS_PASS_MAXLENGTH_ERROR');
        }
        if (/^[a-zA-Z0-9- ]*$/.test(password) === false) {
          result.errors.push('MS_PASS_ILLEGAL_ERROR');
        }
        return result;
      }
    };
  }
]);
