// Polls service used to communicate Polls REST endpoints
(function() {
  'use strict';

  angular
    .module('polls')
    .service('PollsSocket', PollsSocket);

  PollsSocket.$inject = [
    '$http',
    '$state',
    'Authentication',
    'Socket',
    'NotifsService',
    'PollsService',
  ];

  function PollsSocket($http, $state, Authentication, Socket, NotifsService, PollsService) {
    this.init = () => {
      this.authentication = Authentication;
      if (!Socket.socket) {
        Socket.connect();
      }
    };
    this.init();

    this.verifyLogin = () => {
      if (!this.authentication.user) {
        $state.go('authentication.signin');
      }
    };

    this.pushCmt = (cmt) => {
      this.verifyLogin();
      Socket.emit('comment', cmt);
      Socket.on('comment_result', this.pushCmtResponse);

    };
    this.pushCmtResponse = (res) => {
      if (res.success) {
        alert('Comment successed.');
      } else {
        alert('Comment failed.');
        console.log(res.err);
      }
      Socket.removeListener('comment_result');
    };
    this.pushReplyNotif = (poll, userId) => {
      this.verifyLogin();
      var notif = new NotifsService({
        from: this.authentication.user._id,
        to: userId,
        content: 'has replied your comment',
        poll: poll._id
      });
      notif.$save().then(_notif => {
        Socket.emit('notifs', _notif);
      });
    };
    this.pushLikePollNotif = (poll) => {
      this.verifyLogin();
      var notif = new NotifsService({
        from: this.authentication.user._id,
        to: poll.user._id,
        content: 'has liked your poll',
        poll: poll._id
      });
      notif.$save().then(_notif => {
        Socket.emit('notifs', _notif);
      });
    };
  }
}());
