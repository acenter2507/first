(function () {
  'use strict';
  // Poll report controller
  angular.module('polls')
    .controller('PollReportController', PollReportController);

  PollReportController.$inject = [
    '$location',
    '$scope',
    '$stateParams',
    '$state',
    'Action',
    '$translate',
  ];

  function PollReportController(
    $location,
    $scope,
    $stateParams,
    $state,
    Action,
    $translate
  ) {
    var vm = this;

    vm.endDate = {};
    vm.startDate = {};

    // Timezone
    vm.timezone = 'utc';
    vm.years = [];
    vm.months = [];
    vm.dates = [];
    vm.year = '';
    vm.month = '';
    vm.date = '';


    // Line chart data
    vm.chartMode = 1; // 1: year - 2: month - 3: date

    // Chart data
    vm.chartSeries = [];
    vm.chartColors = ['#267ed5', '#ffa500'];
    vm.chartOption = {
      legend: { display: true },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    };
    vm.yearLabels = [];
    vm.dateLabels = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];

    onPrepare();

    // Lấy id của poll trong đường dẫn để request API
    function onPrepare() {
      if (!$stateParams.pollId) {
        $state.go('home');
      } else {
        Action.loadPollById($stateParams.pollId)
          .then(_poll => {
            vm.poll = _poll;
            onCreate();
          });
      }
    }

    // Init data
    function onCreate() {
      // Nếu poll không tồn tại thì về trang chủ
      if (!vm.poll || !vm.poll._id) {
        $state.go('home');
        $scope.handleShowMessage('LB_POLL_EXIST_ERROR', true);
        return;
      }
      // Kiểm tra nếu poll là private và không có code share thì không show thông tin poll
      if (!vm.poll.isCurrentUserOwner && !vm.poll.isPublic) {
        $state.go('home');
        $scope.handleShowMessage('LB_POLLS_PRIVATE_ERROR', true);
        return;
      }
      // Collect dữ liệu hiển thị màn hình
      preapreTranslateData().then(() => {
        prepareShowingData();
        prepareDays();
        prepareYears();
      });
    }

    /**
     * PREPARE
     */
    // Lấy các thông tin vote
    function preapreTranslateData() {
      return new Promise((resolve, reject) => {
        var translateIds = [
          'LB_POLL_CHART_SERIES',
          'LB_POLL_CHART_LINE_YEAR'];
        $translate(translateIds).then(tsl => {
          angular.forEach(tsl, function (val, key) {
            var array = val.split('_');
            array = _.map(array, function (str) { return str.replace(/_/g, ''); });
            tsl[key] = array;
          });
          // Gán các giá trị translate đã lấy vào biến controller
          vm.chartSeries = tsl.LB_POLL_CHART_SERIES;
          vm.yearLabels = tsl.LB_POLL_CHART_LINE_YEAR;
          return resolve();
        });
      });
    }
    function prepareShowingData() {
      // Thiết lập các thông tin cho poll
      vm.opts = _.where(vm.poll.opts, { status: 1 });
      vm.votes = vm.poll.votes || [];
      vm.barChartLabels = _.pluck(vm.opts, 'title');
    }
    function prepareDays() {
      vm.startDate = moment(vm.poll.created).utc();
      var now = moment().utc();
      if (!vm.poll.close) {
        vm.endDate = moment().utc();
      } else {
        var closeDate = moment(vm.poll.close).utc();
        if (closeDate.isBefore(now)) {
          vm.endDate = closeDate;
        } else {
          vm.endDate = now;
        }
      }
    }
    function prepareYears() {
      var durration = vm.endDate.diff(vm.startDate, 'years');
      for (var index = 0; index <= durration; index++) {
        var item = vm.startDate.clone().add(index, 'years').year();
        vm.years.push(item);
      }
      vm.year = vm.years[vm.years.length - 1];
      handleChangeYear();
    }

    /**
     * HANDLES
     */
    // Sự kiện thay đổi mode của line chart
    vm.handleChangeChartMode = handleChangeChartMode;
    function handleChangeChartMode(mode) {
      if (mode === vm.chartMode) return;
      vm.chartMode = mode;
      handleChangeYear();
    }
    // Sự kiện thay đổi năm của line chart
    vm.handleChangeYear = handleChangeYear;
    function handleChangeYear() {
      // Nếu mode đang xem là Năm
      if (vm.chartMode === 1) {
        handleCreateLineChart();
        handleCreateBarChart();
      } else {
        vm.months = handleGetMonthsOfYear(vm.year);
        vm.month = vm.months[vm.months.length - 1];
        handleChangeMonth();
      }
    }
    // Sự kiện thay đổi tháng của line chart
    vm.handleChangeMonth = handleChangeMonth;
    function handleChangeMonth() {
      // Nếu mode đang xem là Tháng
      if (vm.chartMode === 2) {
        vm.dates = handleGetDatesOfMonth(vm.year, vm.month);
        vm.date = vm.dates[vm.dates.length - 1];
        handleCreateLineChart();
        handleCreateBarChart();
      } else {
        vm.dates = handleGetDatesOfMonth(vm.year, vm.month);
        vm.date = vm.dates[vm.dates.length - 1];
        handleChangeDate();
      }
    }
    // Sự kiện thay đổi ngày của line chart
    vm.handleChangeDate = handleChangeDate;
    function handleChangeDate() {
      handleCreateLineChart();
      handleCreateBarChart();
    }
    // Tạo lại object line chart
    vm.handleCreateLineChart = handleCreateLineChart;
    function handleCreateLineChart() {
      vm.lineChart = {
        series: vm.chartSeries,
        colors: vm.chartColors
      };
      vm.lineChart.data = handleGetDataLineChart();

      if (vm.chartMode === 1) {
        vm.lineChart.labels = vm.yearLabels;
      } else if (vm.chartMode === 2) {
        vm.lineChart.labels = vm.dates;
      } else {
        vm.lineChart.labels = vm.dateLabels;
      }
      vm.lineChart.option = vm.chartOption;
    }
    // Tạo lại object line chart
    vm.handleCreateBarChart = handleCreateBarChart;
    function handleCreateBarChart() {
      vm.barChart = {
        series: vm.chartSeries,
        labels: vm.barChartLabels,
        colors: vm.chartColors,
        option: vm.chartOption
      };
      vm.barChart.data = handleGetDataBarChart();
    }

    /**
     * LOCAL HANDLE
     */
    function handleGetMonthsOfYear(year) {
      var mmYear = moment().utc().year(year);
      var startMonth = mmYear.clone().startOf('year');
      var endMonth = mmYear.clone().endOf('year').subtract(1, 'days');
      var durration = endMonth.diff(startMonth, 'months');
      var months = [];
      for (var index = 0; index <= durration; index++) {
        // Tháng bắt đầu từ 0 nên phải + 1
        var item = startMonth.clone().add(index, 'months');
        // Nếu ngày đang lấy lớn hơn ngày kết thúc thì stop for
        if (item.isAfter(vm.endDate)) break;
        months.push(item.month() + 1);
      }
      mmYear = undefined;
      startMonth = undefined;
      endMonth = undefined;
      return months;
    }
    function handleGetDatesOfMonth(year, month) {
      // Khi truyền ngày vào, phải - 1 vì tháng bắt đầu từ 0
      var mmMonth = moment().utc().year(year).month(month - 1);
      var startDate = mmMonth.clone().startOf('month');
      var endDate = mmMonth.clone().endOf('month').subtract(1, 'hour');
      var duration = endDate.diff(startDate, 'days');
      var dates = [];
      for (var index = 0; index <= duration; index++) {
        var item = startDate.clone().add(index, 'day');
        // Nếu ngày đang lấy lớn hơn ngày kết thúc thì stop for
        if (item.isAfter(vm.endDate)) break;
        dates.push(item.date());
      }
      mmMonth = undefined;
      startDate = undefined;
      endDate = undefined;
      return dates;
    }
    function handleGetDataLineChart() {
      var rs = [];
      var member = [];
      var guest = [];
      var votes = [];
      var created, downedMonth;
      switch (vm.chartMode) {
        case 1:
          for (let index = 0; index < 12; index++) {
            votes = [];
            vm.votes.forEach(vote => {
              if (vm.timezone === 'utc') {
                created = moment(vote.updated).utc();
              } else if (vm.timezone === 'language') {
                created = moment(vote.updated);
              } else {
                created = moment(vote.updated).local();
              }
              if (created.year() === vm.year && created.month() === index) {
                votes.push(vote);
              }
            });
            let collect = _.countBy(votes, function (vote) {
              return vote.guest ? 'guest' : 'user';
            });
            member.push(collect.user || 0);
            guest.push(collect.guest || 0);
          }
          rs.push(member, guest);
          break;
        case 2:
          // Hạ tháng xuống 1 đơn vị vì tháng bắt đầu từ 0
          downedMonth = vm.month - 1;
          for (let index = 0; index < vm.dates.length; index++) {
            votes = [];
            vm.votes.forEach(vote => {
              if (vm.timezone === 'utc') {
                created = moment(vote.updated).utc();
              } else if (vm.timezone === 'language') {
                created = moment(vote.updated);
              } else {
                created = moment(vote.updated).local();
              }
              if (created.year() === vm.year && created.month() === downedMonth && created.date() === vm.dates[index]) {
                votes.push(vote);
              }
            });
            let collect = _.countBy(votes, function (vote) {
              return vote.guest ? 'guest' : 'user';
            });
            member.push(collect.user || 0);
            guest.push(collect.guest || 0);
          }
          rs.push(member, guest);
          break;
        case 3:
          // Hạ tháng xuống 1 đơn vị vì tháng bắt đầu từ 0
          downedMonth = vm.month - 1;
          for (let index = 0; index < 24; index++) {
            votes = [];
            vm.votes.forEach(vote => {
              if (vm.timezone === 'utc') {
                created = moment(vote.updated).utc();
              } else if (vm.timezone === 'language') {
                created = moment(vote.updated);
              } else {
                created = moment(vote.updated).local();
              }
              if (created.year() === vm.year && created.month() === downedMonth && created.date() === vm.date && created.hour() === index) {
                votes.push(vote);
              }
            });
            let collect = _.countBy(votes, function (vote) {
              return vote.guest ? 'guest' : 'user';
            });
            member.push(collect.user || 0);
            guest.push(collect.guest || 0);
          }
          rs.push(member, guest);
          break;
        default:
          break;
      }
      return rs;
    }
    function handleGetDataBarChart() {
      var data = [];
      var member = [];
      var guest = [];
      var memberCnt, guestCnt, created, isMatch;
      vm.opts.forEach(opt => {
        memberCnt = 0;
        guestCnt = 0;
        vm.votes.forEach(vote => {
          if (!_.contains(vote.opts, opt._id)) return;
          if (vm.timezone === 'utc') {
            created = moment(vote.updated).utc();
          } else if (vm.timezone === 'language') {
            created = moment(vote.updated);
          } else {
            created = moment(vote.updated).local();
          }
          switch (vm.chartMode) {
            case 1:
              isMatch = created.year() === vm.year;
              break;
            case 2:
              isMatch = created.year() === vm.year && created.month() === (vm.month - 1);
              break;
            case 3:
              isMatch = created.year() === vm.year && created.month() === (vm.month - 1) && created.date() === vm.date;
              break;
          }
          if (isMatch) {
            if (vote.guest) {
              guestCnt++;
            } else {
              memberCnt++;
            }
          }

        });
        member.push(memberCnt);
        guest.push(guestCnt);
      });
      data.push(member);
      data.push(guest);
      return data;
    }
  }
})();
