(function() {
  'use strict';
  angular.module('mdDatetimePicker', [
      'ngMaterialDatePicker'
    ])
    .controller('DatetimeController', function($scope) {
      $scope.date = new Date();
      $scope.time = new Date();
      $scope.dateTime = new Date();
      $scope.minDate = moment().subtract(1, 'month');
      $scope.maxDate = moment().add(1, 'month');
      $scope.dates = [
        new Date('2016-11-14T00:00:00'), new Date('2016-11-15T00:00:00'),
        new Date('2016-11-30T00:00:00'), new Date('2016-12-12T00:00:00'), new Date('2016-12-13T00:00:00'),
        new Date('2016-12-31T00:00:00')
      ];
    });
})();
