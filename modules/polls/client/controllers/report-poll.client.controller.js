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
        var item = vm.startDate.clone().add(index, 'years').year();
        ctrl.years.push(item);
      }
    }
    function prepareMonths() {
      ctrl.monthCnt = ctrl.endDate.diff(ctrl.startDate, 'months');
      for (var index = 0; index < ctrl.monthCnt; index++) {
        var item = vm.startDate.clone().add(index, 'months').month();
        ctrl.months.push(item);
      }
    }
    function prepareWeeks() {
      ctrl.weekCnt = ctrl.endDate.diff(ctrl.startDate, 'weeks');
    }
    function prepareReportTraffic() {
      ctrl.traffic = {};
    }
  }
})();
