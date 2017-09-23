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

    // Chart data
    ctrl.mode = 1; // 1: year - 2: month - 3: weeks
    ctrl.year = '';
    ctrl.month = '';
    ctrl.date = '';
    ctrl.series = handleGetTranslate('LB_POLL_CHART_SERIES');
    var labels = [
      handleGetTranslate('LB_POLL_CHART_TRAFFIC_YEAR'),
      handleGetTranslate('LB_POLL_CHART_TRAFFIC_MONTH'),
      handleGetTranslate('LB_POLL_CHART_TRAFFIC_DATE')
    ];
    ctrl.yearLabels = handleGetTranslate('LB_POLL_CHART_TRAFFIC_YEAR');
    ctrl.monthLabels = handleGetTranslate('LB_POLL_CHART_TRAFFIC_MONTH');
    ctrl.dateLabels = handleGetTranslate('LB_POLL_CHART_TRAFFIC_DATE');

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
      prepareShowingData();
      prepareDays();
      prepareYears();
    }

    /**
     * PREPARE
     */
    // Lấy các thông tin vote
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
      var labelId = '';
      switch (ctrl.mode) {
        case 1:
          labelId = 'LB_POLL_CHART_TRAFFIC_YEAR';
          break;
        case 2:
          labelId = 'LB_POLL_CHART_TRAFFIC_MONTH';
          break;
        case 3:
          labelId = 'LB_POLL_CHART_TRAFFIC_DATE';
          break;
        default:
          labelId = 'LB_POLL_CHART_TRAFFIC_YEAR';
      }
      ctrl.traffic = resolveProperties({
        data: handleGetDataTraffic(),
        labels: handleGetTranslate(labelId)
      });
    }
    function handleGetTranslate(translateId) {
      return new Promise((resolve, reject) => {
        $translate(translateId).then(tsl => {
          var labels = tsl.split('_');
          labels = _.map(labels, function (str) { return str.replace(/_/g, ''); });
          return resolve(labels);
        });
      });
    }
    function handleGetDataTraffic() {
      return new Promise((resolve, reject) => {
        var data = [];
        var member = [];
        var guest = [];
        switch (ctrl.mode) {
          case 1:
            for (var index = 0; index < 12; index++) {
              var votes = [];
              ctrl.votes.forEach(vote => {
                let created = moment(vote.updated).utc();
                if (created.year() === ctrl.year && created.month() === index) {
                  votes.push(vote);
                }
              });
              var collect = _.countBy(votes, function (vote) {
                return vote.guest ? 'guest' : 'user';
              });
              member.push(collect.user || 0);
              guest.push(collect.guest || 0);
            }
            data.push(member, guest);
            break;
          case 2:
            break;
          case 3:
            break;
          default:
            break;
        }
        return resolve(data);
      });
    }

    function resolveProperties(obj) {
      angular.forEach(obj, function (val, key) {
        if (angular.isFunction(val.then)) {
          val.then(function (data) {
            obj[key] = data;
          });
        }
      });
    }
  }
})();
