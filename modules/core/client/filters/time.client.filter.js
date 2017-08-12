'use strict';

angular
  .module('core')
  .filter('LL_format', LL_format)
  .filter('ll_format', ll_format)
  .filter('LLL_format', LLL_format);

function LL_format() {
  return function (time) {
    return moment(time).format('LL');
  };
}
function ll_format() {
  return function (time) {
    return moment(time).format('ll');
  };
}
function LLL_format() {
  return function (time) {
    return moment(time).format('LLL');
  };
}
