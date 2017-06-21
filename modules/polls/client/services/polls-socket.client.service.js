// Polls service used to communicate Polls REST endpoints
(function() {
  'use strict';

  angular
    .module('polls')
    .factory('PollsSocket', PollsSocket);

  PollsSocket.$inject = [
    '$http',
    '$state'
    'Authentication',
    'Socket',
    'NotifsService',
    'PollsService'
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

    this.pushCmtNotif = (poll) => {
      this.verifyLogin();
      var notif = new NotifsService({
        from: this.authentication.user._id,
        to: poll.user._id,
        content: 'has commented on your poll',
        poll: poll._id
      });
      notif.$save().then(_notif => {
        Socket.emit('notifs', _notif);
      });
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
      //notif.$save().then(_notif => {
        Socket.emit('notifs', _notif);
      });
    };




    return {
      // findOpts: (id) => {
      //   return $http.get('/api/findOpts/' + id);
      // },
      // findCmts: (id) => {
      //   return $http.get('/api/findCmts/' + id);
      // },
      // findTags: (id) => {
      //   return $http.get('/api/findTags/' + id);
      // },
      // findVotes: (id) => {
      //   return $http.get('/api/findVotes/' + id);
      // },
      // findOwnerVote: (id) => {
      //   return $http.get('/api/findOwnerVote/' + id);
      // },
      // findVoteopts: (id) => {
      //   return $http.get('/api/findVoteopts/' + id);
      // },
      // findPollLike: (id) => {
      //   return $http.get('/api/findPollLike/' + id);
      // }
    };
  }
}());
