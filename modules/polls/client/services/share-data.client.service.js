(function() {
  'use strict';
  angular.module('polls')
    .service('ShareData', ShareData);

  ShareData.$inject = [];

  function ShareData() {
    return this;
  }
})();
