(function() {
  'use strict';
  angular.module('polls').filter('splice', function() {
    return function(value, max, tail) {
      if (!value) return '';
      max = parseInt(max, 10);
      if (!max) return value;
      if (value.length <= max) return value;
      value = value.substr(0, max);
      return value + (tail || ' …');
    };
  });
})();
