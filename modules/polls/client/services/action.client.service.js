(function() {
  'use strict';
  angular.module('polls').factory('Action', Action);

  Action.$inject = [
    'Authentication',
    'Socket',
    'PollsService',
    'TagsService',
    'CmtsService',
    'VotesService',
    'OptsService',
    'LikesService',
    'CmtlikesService',
    'PollusersService',
    'PollsApi',
    'VotesApi',
    'CmtsApi'
  ];

  function Action(
    Authentication,
    Socket,
    Polls,
    Tags,
    Cmts,
    Votes,
    Opts,
    Likes,
    Cmtlikes,
    Pollusers,
    PollsApi,
    VotesApi,
    CmtsApi
  ) {
    this.template = () => {
      return new Promise((resolve, reject) => {
        //(successCb, errorCb);
        function successCb(res) {
          Socket.emit('cmt_add', {
            pollId: pollId,
            cmtId: res._id,
            isNew: isNew,
            from: Authentication.user._id,
            to: res.to
          });
          resolve(res);
        }
        function errorCb(err) {
          reject(err);
        }
      });
    };
    this.save_cmt = (pollId, cmt) => {
      return new Promise((resolve, reject) => {
        var rs_cmt = new Cmts(cmt);
        var isNew = !cmt._id ? true : false;
        var promise;
        if (cmt._id) {
          rs_cmt.isEdited = true;
          rs_cmt.updated = new Date();
          promise = rs_cmt.$update(successCb, errorCb);
        } else {
          rs_cmt.poll = pollId;
          promise = rs_cmt.$save(successCb, errorCb);
        }
        function successCb(res) {
          Socket.emit('cmt_add', {
            pollId: pollId,
            cmtId: res._id,
            isNew: isNew,
            from: Authentication.user._id,
            to: res.to
          });
          resolve(res);
        }
        function errorCb(err) {
          reject(err);
        }
      });
    };
    this.save_like = like => {};
    this.save_like_cmt = likeCmt => {};
    this.save_follow = polluser => {};
    this.save_report = report => {};
    this.save_vote = (vote, opts) => {
      return new Promise((resolve, reject) => {
        vote.opts = opts;
        var rs_vote = new Votes(vote);
        if (vote._id) {
          rs_vote.updateCnt += 1;
          rs_vote.$update(successCb, errorCb);
        } else {
          rs_vote.$save(successCb, errorCb);
        }
        function successCb(res) {
          Socket.emit('poll_vote', { pollId: res.poll });
          resolve(res);
        }
        function errorCb(err) {
          reject(err);
        }
      });
    };
    return this;
  }
})();
