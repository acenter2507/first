(function () {
  'use strict';
  angular
    .module('admin')
    .controller('DashboardController', DashboardController);

  DashboardController.$inject = [
    '$state',
    '$scope',
    'Authentication'
  ];

  function DashboardController(
    $state,
    $scope,
    Authentication
  ) {
    var brandPrimary =  '#20a8d8';
    var brandSuccess =  '#4dbd74';
    var brandInfo =     '#63c2de';
    var brandWarning =  '#f8cb00';
    var brandDanger =   '#f86c6b';

    var grayDark =      '#2a2c36';
    var gray =          '#55595c';
    var grayLight =     '#818a91';
    var grayLighter =   '#d1d4d7';
    var grayLightest =  '#f8f9fa';

    $scope.users_chart = init_usersChart();
    $scope.polls_chart = {};
    $scope.cmts_chart = {};
    $scope.visit_chart = {};

    function init_usersChart() {
      var chart = {};
      chart.mode = 'day'; // week, month, year
      chart.labels = ['January','February','March','April','May','June','July'];
      chart.data = [
        [65, 59, 84, 84, 51, 55, 40]
      ];
      chart.colors = [{
        backgroundColor: brandPrimary,
        borderColor: 'rgba(255,255,255,.55)',
      }];
      chart.options = {
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            gridLines: {
              color: 'transparent',
              zeroLineColor: 'transparent'
            },
            ticks: {
              fontSize: 2,
              fontColor: 'transparent',
            }
          }],
          yAxes: [{
            display: false,
            ticks: {
              display: false,
              min: Math.min.apply(Math, $scope.data[0]) - 5,
              max: Math.max.apply(Math, $scope.data[0]) + 5,
            }
          }],
        },
        elements: {
          line: {
            borderWidth: 1
          },
          point: {
            radius: 4,
            hitRadius: 10,
            hoverRadius: 4,
          },
        },
      };
      return chart;
    }
  }
})();
