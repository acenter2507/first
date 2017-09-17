'use strict';

angular.module('core').controller('ContactSupportController', [
  '$scope',
  'vcRecaptchaService',
  '$http',
  'Constants',
  'amMoment',
  '$translate',
  function ($scope, vcRecaptchaService, $http, Constants, amMoment, $translate) {
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
      $scope.ticket.date = moment();
      // Cài đặt ngôn ngữ cho account
      $http.post('/api/other/ticket', $scope.ticket).success(function (response) {
        delete $scope.ticket;
        $scope.busy = false;
        $scope.ticketTest = response;
        $scope.show_message('LB_SUPPORT_SUCCESS', false);
      }).error(function (err) {
        $scope.busy = false;
        $scope.show_message(err.message, true);
      });
    };

    $scope.ticketTest = {};
    $scope.test = {};
    $scope.test.momentTest = moment();
    $scope.test.language = $translate.use();

    $scope.setLocale = () => {
      moment.tz.setDefault('Asia/Tokyo');
      moment.locale('vi');
      amMoment.changeLocale('vi');
      $translate.use('vi');
      $scope.test.momentTest = moment();
      $scope.test.language = $translate.use();
    };
  }
]);
