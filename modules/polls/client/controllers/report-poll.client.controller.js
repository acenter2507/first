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
    var ctrl = this;
    ctrl.endDate = {};
    ctrl.startDate = {};
    ctrl.years = [];
    ctrl.months = [];
    ctrl.dates = [];
    ctrl.yearCnt = 0;
    ctrl.monthCnt = 0;
    ctrl.weekCnt = 0;

    // Timezone
    ctrl.timezone = 'utc';

    // Chart data
    ctrl.mode = 1; // 1: year - 2: month - 3: date
    ctrl.year = '';
    ctrl.month = '';
    ctrl.date = '';

    // Chart data
    ctrl.series = [];
    ctrl.yearLabels = [];
    ctrl.dateLabels = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];

    onPrepare();

    // Lấy id của poll trong đường dẫn để request API
    function onPrepare() {
      if (!$stateParams.pollId) {
        $state.go('home');
      } else {
        Action.get_poll($stateParams.pollId)
          .then(_poll => {
            ctrl.poll = _poll;
            onCreate();
          });
      }
    }

    // Init data
    function onCreate() {
      // Nếu poll không tồn tại thì về trang chủ
      if (!ctrl.poll || !ctrl.poll._id) {
        $state.go('home');
        $scope.handleShowMessage('LB_POLL_EXIST_ERROR', true);
        return;
      }
      // Kiểm tra nếu poll là private và không có code share thì không show thông tin poll
      if (!ctrl.poll.isCurrentUserOwner && !ctrl.poll.isPublic) {
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
          'LB_POLL_CHART_TRAFFIC_YEAR'];
        $translate(translateIds).then(tsl => {
          angular.forEach(tsl, function (val, key) {
            var array = val.split('_');
            array = _.map(array, function (str) { return str.replace(/_/g, ''); });
            tsl[key] = array;
          });
          // Gán các giá trị translate đã lấy vào biến controller
          ctrl.series = tsl.LB_POLL_CHART_SERIES;
          ctrl.yearLabels = tsl.LB_POLL_CHART_TRAFFIC_YEAR;
          return resolve();
        });
      });
    }
    function prepareShowingData() {
      // Thiết lập các thông tin cho poll
      ctrl.opts = _.where(ctrl.poll.opts, { status: 1 });
      ctrl.votes = ctrl.poll.votes || [];
      ctrl.voteopts = ctrl.poll.voteopts || [];
      ctrl.votedTotal = ctrl.voteopts.length;
      ctrl.opts.forEach(opt => {
        opt.voteCnt = _.where(ctrl.voteopts, { opt: opt._id }).length || 0;
        opt.progressVal = Action.calPercen(ctrl.votedTotal, opt.voteCnt);
      });
    }
    function prepareDays() {
      ctrl.startDate = moment(ctrl.poll.created).utc();
      var now = moment().utc();
      if (!ctrl.poll.close) {
        ctrl.endDate = moment().utc();
      } else {
        var closeDate = moment(ctrl.poll.close).utc();
        if (closeDate.isBefore(now)) {
          ctrl.endDate = closeDate;
        } else {
          ctrl.endDate = now;
        }
      }
    }
    function prepareYears() {
      ctrl.yearCnt = ctrl.endDate.diff(ctrl.startDate, 'years');
      for (var index = 0; index <= ctrl.yearCnt; index++) {
        var item = ctrl.startDate.clone().add(index, 'years').year();
        ctrl.years.push(item);
      }
      ctrl.year = ctrl.years[ctrl.years.length - 1];
      handleChangeYear();
    }
    function prepareMonths() {
      ctrl.monthCnt = ctrl.endDate.diff(ctrl.startDate, 'months');
      for (var index = 0; index <= ctrl.monthCnt; index++) {
        var item = ctrl.startDate.clone().add(index, 'months').month();
        ctrl.months.push(item);
      }
      ctrl.month = ctrl.months[ctrl.months.length - 1];
    }

    /**
     * HANDLES
     */

    ctrl.handleChangeMode = handleChangeMode;
    function handleChangeMode(mode) {
      if (mode === ctrl.mode) return;
      ctrl.mode = mode;
      handleChangeYear();
    }
    ctrl.handleChangeYear = handleChangeYear;
    function handleChangeYear() {
      // Nếu mode đang xem là Năm
      if (ctrl.mode === 1) {
        handleCreateTrafficChart();
      } else {
        ctrl.months = handleGetMonthsOfYear(ctrl.year);
        ctrl.month = ctrl.months[ctrl.months.length - 1];
        handleChangeMonth();
      }
    }
    ctrl.handleChangeMonth = handleChangeMonth;
    function handleChangeMonth() {
      // Nếu mode đang xem là Tháng
      if (ctrl.mode === 2) {
        ctrl.dates = handleGetDatesOfMonth(ctrl.year, ctrl.month);
        ctrl.date = ctrl.dates[ctrl.dates.length - 1];
        handleCreateTrafficChart();
      } else {
        ctrl.dates = handleGetDatesOfMonth(ctrl.year, ctrl.month);
        ctrl.date = ctrl.dates[ctrl.dates.length - 1];
        handleChangeDate();
      }
    }
    ctrl.handleChangeDate = handleChangeDate;
    function handleChangeDate() {
      handleCreateTrafficChart();
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
        if (item.isAfter(ctrl.endDate)) break;
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
        if (item.isAfter(ctrl.endDate)) break;
        dates.push(item.date());
      }
      mmMonth = undefined;
      startDate = undefined;
      endDate = undefined;
      return dates;
    }
    function handleCreateTrafficChart() {
      ctrl.traffic = {};
      ctrl.traffic.data = handleGetDataTraffic();

      if (ctrl.mode === 1) {
        ctrl.traffic.labels = ctrl.yearLabels;
      } else if (ctrl.mode === 2) {
        ctrl.traffic.labels = ctrl.dates;
      } else {
        ctrl.traffic.labels = ctrl.dateLabels;
      }
      ctrl.traffic.option = {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      };
    }
    function handleGetDataTraffic() {
      var rs = [];
      var member = [];
      var guest = [];
      var votes = [];
      var created, downedMonth;
      switch (ctrl.mode) {
        case 1:
          for (let index = 0; index < 12; index++) {
            votes = [];
            ctrl.votes.forEach(vote => {
              if (ctrl.timezone === 'utc') {
                created = moment(vote.updated).utc();
              } else if (ctrl.timezone === 'language') {
                created = moment(vote.updated);
              } else {
                created = moment(vote.updated).local();
              }
              if (created.year() === ctrl.year && created.month() === index) {
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
          downedMonth = ctrl.month - 1;
          for (let index = 0; index < ctrl.dates.length; index++) {
            votes = [];
            ctrl.votes.forEach(vote => {
              if (ctrl.timezone === 'utc') {
                created = moment(vote.updated).utc();
              } else if (ctrl.timezone === 'language') {
                created = moment(vote.updated);
              } else {
                created = moment(vote.updated).local();
              }
              if (created.year() === ctrl.year && created.month() === downedMonth && created.date() === ctrl.dates[index]) {
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
          downedMonth = ctrl.month - 1;
          for (let index = 0; index < 24; index++) {
            votes = [];
            ctrl.votes.forEach(vote => {
              if (ctrl.timezone === 'utc') {
                created = moment(vote.updated).utc();
              } else if (ctrl.timezone === 'language') {
                created = moment(vote.updated);
              } else {
                created = moment(vote.updated).local();
              }
              if (created.year() === ctrl.year && created.month() === downedMonth && created.date() === ctrl.date && created.hour() === index) {
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
  }
})();
