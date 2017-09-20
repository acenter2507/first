'use strict';

angular.module('core').controller('ContactSupportController', [
  '$scope',
  'vcRecaptchaService',
  '$http',
  'Constants',
  'amMoment',
  '$translate',
  '$window',
  function ($scope, vcRecaptchaService, $http, Constants, amMoment, $translate, $window) {
    $scope.reCaptcha = Constants.reCaptcha;
    $scope.response = null;
    $scope.widgetId = null;

    $scope.busy = false;

    $scope.setResponse = function (response) {
      // console.info('Response available');
      $scope.response = response;
    };
    $scope.setWidgetId = function (widgetId) {
      // console.info('Created widget ID: %s', widgetId);
      $scope.widgetId = widgetId;
    };
    $scope.cbExpiration = function () {
      vcRecaptchaService.reload($scope.widgetId);
      $scope.response = null;
    };


    $scope.send = function (isValid) {
      if ($scope.busy) return;
      $scope.busy = true;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'ticketForm');
        $scope.busy = false;
        return false;
      }
      $scope.ticket.date = moment().utc();
      // Cài đặt ngôn ngữ cho account
      $http.post('/api/other/ticket', $scope.ticket).success(function (response) {
        delete $scope.ticket;
        $scope.busy = false;
        console.log(response);
        $scope.handleShowMessage('LB_SUPPORT_SUCCESS', false);
      }).error(function (err) {
        $scope.busy = false;
        $scope.handleShowMessage(err.message, true);
      });
    };

  }
]);
