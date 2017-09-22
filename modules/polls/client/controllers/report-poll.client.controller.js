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
  ];

  function PollReportController(
    $location,
    $scope,
    $stateParams,
    $state,
    Action
  ) {
    var ctrl = this;
    ctrl.endDate = {};
    ctrl.startDate = {};
    ctrl.years = [];
    ctrl.months = [];
    ctrl.weeks = [];
    ctrl.yearCnt = 0;
    ctrl.monthCnt = 0;
    ctrl.weekCnt = 0;

    // Chart data
    ctrl.mode = 1; // 1: month - 2: year - 3: weeks
    ctrl.year = '';
    ctrl.month = '';
    ctrl.series = ['Thành viên', 'Khách'];


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
      prepareMonths();
      prepareWeeks();
    }
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
      for (var index = 0; index < ctrl.yearCnt; index++) {
        var item = ctrl.startDate.clone().add(index, 'years').year();
        ctrl.years.push(item);
      }
      ctrl.year = ctrl.years[ctrl.years.length - 1];
    }
    function prepareMonths() {
      ctrl.monthCnt = ctrl.endDate.diff(ctrl.startDate, 'months');
      for (var index = 0; index <= ctrl.monthCnt; index++) {
        var item = ctrl.startDate.clone().add(index, 'months').month();
        ctrl.months.push(item);
      }
      ctrl.month = ctrl.months[ctrl.months.length - 1];
    }
    function prepareWeeks() {
      ctrl.weekCnt = ctrl.endDate.diff(ctrl.startDate, 'weeks');
    }
    function prepareReportTraffic() {
      ctrl.traffic = {};
      ctrl.traffic.labels = 1;

    }

    /**
     * HANDLES
     */
    ctrl.handleChangeYear = handleChangeYear;
    function handleChangeYear() {
      ctrl.months = handleGetMonthsOfYear(ctrl.year);
      ctrl.month = ctrl.months[ctrl.months.length - 1];
    }
    ctrl.handleChangeMonth = handleChangeMonth;
    function handleChangeMonth() {
    }
    function handleGetMonthsOfYear(year) {
      var year = moment().utc().year(year);
      var startMonth = year.clone().startOf('year');
      var endMonth = year.clone().endOf('year').subtract(1, 'days');
      var durration = endMonth.diff(startMonth, 'months');
      var months = [];
      for (var index = 0; index <= durration; index++) {
        var item = startMonth.clone().add(index, 'months').month() + 1;
        months.push(item);
      }
      year = undefined;
      startMonth = undefined;
      endMonth = undefined;
      return months;
    }
    function handleGetDatesOfMonth(month) {
      var startDate = month.clone().startOf('month');
      var endDate = month.clone().startOf('month');
    }
  }
})();
