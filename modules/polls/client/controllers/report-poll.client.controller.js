(function () {
  'use strict';
  // Poll report controller
  angular.module('polls')
    .controller('PollReportController', PollReportController);

  PollsController.$inject = [
    '$location',
    '$scope',
    '$stateParams',
    '$state',
    'Action',
  ];

  function PollsController(
    $location,
    $scope,
    $stateParams,
    $state,
    Action,
  ) {
    var ctrl = this;
    ctrl.form = {};

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
    }

    function prepareShowingData() {
      // Thiết lập các thông tin cho poll
      ctrl.poll.close = ctrl.poll.close ? moment(ctrl.poll.close) : ctrl.poll.close;
      ctrl.isClosed = ctrl.poll.close ? moment(ctrl.poll.close).isBefore(new moment().utc()) : false;
      ctrl.opts = _.where(ctrl.poll.opts, { status: 1 });
      ctrl.chart = {
        type: 'pie',
        options: { responsive: true },
        colors: [],
        labels: [],
        data: []
      };
      ctrl.votes = ctrl.poll.votes || [];
      ctrl.voteopts = ctrl.poll.voteopts || [];
      ctrl.votedTotal = ctrl.voteopts.length;
      ctrl.opts.forEach(opt => {
        opt.voteCnt = _.where(ctrl.voteopts, { opt: opt._id }).length || 0;
        opt.progressVal = Action.calPercen(ctrl.votedTotal, opt.voteCnt);
        ctrl.chart.colors.push(opt.color);
        ctrl.chart.labels.push(opt.title);
        ctrl.chart.data.push(opt.voteCnt);
      });
    }
  }
})();
