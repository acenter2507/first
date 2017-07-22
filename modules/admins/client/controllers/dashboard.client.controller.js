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
    var brandPrimary = '#20a8d8';
    var brandSuccess = '#4dbd74';
    var brandInfo = '#63c2de';
    var brandWarning = '#f8cb00';
    var brandDanger = '#f86c6b';

    var grayDark = '#2a2c36';
    var gray = '#55595c';
    var grayLight = '#818a91';
    var grayLighter = '#d1d4d7';
    var grayLightest = '#f8f9fa';

    $scope.users_chart = init_usersChart();
    $scope.polls_chart = init_pollsChart();
    $scope.cmts_chart = init_cmtsChart();
    $scope.visit_chart = init_visitChart();

    function init_usersChart() {
      var chart = {};
      chart.title = 'Total users';
      chart.mode = 'day'; // week, month, year
      chart.labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
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
              min: Math.min.apply(Math, chart.data[0]) - 5,
              max: Math.max.apply(Math, chart.data[0]) + 5,
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
    function init_pollsChart() {
      var chart = {};
      chart.title = 'Total polls';
      chart.mode = 'day'; // week, month, year
      chart.labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
      chart.data = [
        [1, 18, 9, 17, 34, 22, 11]
      ];
      chart.colors = [{
        backgroundColor: brandInfo,
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
              min: Math.min.apply(Math, chart.data[0]) - 5,
              max: Math.max.apply(Math, chart.data[0]) + 5
            }
          }],
        },
        elements: {
          line: {
            tension: 0.00001,
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
    function init_cmtsChart() {
      var chart = {};
      chart.title = 'Total comments';
      chart.mode = 'day'; // week, month, year
      chart.labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
      chart.data = [
        [78, 81, 80, 45, 34, 12, 40]
      ];
      chart.colors = [{
        backgroundColor: 'rgba(255,255,255,.2)',
        borderColor: 'rgba(255,255,255,.55)',
      }];
      chart.options = {
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            display: false
          }],
          yAxes: [{
            display: false
          }]
        },
        elements: {
          line: {
            borderWidth: 2
          },
          point: {
            radius: 0,
            hitRadius: 10,
            hoverRadius: 4,
          },
        },
      };
      return chart;
    }
    function init_visitChart() {
      var chart = {};
      chart.title = 'Total visited';
      var elements = 16;
      var labels = [];
      var data = [];
      for (var i = 2000; i <= 2000 + elements; i++) {
        labels.push(i);
        data.push(_.random(40, 100));
      }
      chart.mode = 'year'; // week, month, year
      chart.labels = labels;
      chart.data = [data];
      chart.colors = [{
        backgroundColor: 'rgba(255,255,255,.3)',
        borderWidth: 0
      }];
      chart.options = {
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            display: false,
            barPercentage: 0.6,
          }],
          yAxes: [{
            display: false
          }]
        },
      };
      return chart;
    }
  }
})();
