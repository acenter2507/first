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
    'ReportsService',
    'BookmarksService',
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
    Follows,
    Reports,
    Bookmarks,
    PollsApi,
    VotesApi,
    CmtsApi
  ) {
    this.template = () => {
      return new Promise((resolve, reject) => {
        //(successCb, errorCb);
        function successCb(res) {
          resolve(res);
        }
        function errorCb(err) {
          reject(err);
        }
      });
    };
    // Lưu comment vào db
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
    // Xóa comment
    this.delete_cmt = cmt => {
      return new Promise((resolve, reject) => {
        var rs_cmt = new Cmts(cmt);
        rs_cmt.$remove(() => {
          Socket.emit('cmt_del', { pollId: cmt.poll, cmtId: cmt._id });
          return resolve();
        });
      });
    };
    // Lưu like vào db
    this.save_like = (like, type, poll) => {
      // type: 1: like - 2: dislike;
      return new Promise((resolve, reject) => {
        var cnt = 0;
        var rs_like;
        if (like._id) {
          switch (like.type) {
            case 0:
              cnt = type === 1 ? 1 : -1;
              like.type = type;
              break;

            case 1:
              cnt = type === 1 ? -1 : -2;
              like.type = type === 1 ? 0 : 2;
              break;

            case 2:
              cnt = type === 1 ? 2 : 1;
              like.type = type === 1 ? 1 : 0;
              break;
          }
          rs_like = new Likes(like);
          rs_like.cnt = cnt;
          rs_like.$update(successCb, successCb);
        } else {
          cnt = type === 1 ? 1 : -1;
          rs_like = new Likes({
            poll: poll._id,
            type: type
          });
          rs_like.cnt = cnt;
          rs_like.$save(successCb, successCb);
        }
        function successCb(res) {
          Socket.emit('poll_like', {
            pollId: poll._id,
            likeCnt: res.likeCnt,
            from: Authentication.user._id,
            to: poll.user._id,
            type: res.like.type
          });
          resolve(res);
        }
        function errorCb(err) {
          reject(err);
        }
      });
    };
    // Lưu follow vào db
    this.save_follow = follow => {
      return new Promise((resolve, reject) => {
        var rs_follow = new Follows(follow);
        if (follow._id) {
          rs_follow.following = !follow.following;
          rs_follow.$update(successCb, errorCb);
        } else {
          rs_follow.following = true;
          rs_follow.$save(successCb, errorCb);
        }
        function successCb(res) {
          resolve(res);
        }
        function errorCb(err) {
          reject(err);
        }
      });
    };
    // Lưu vote vào db
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
    // Lưu option
    this.save_opt = opt => {
      return new Promise((resolve, reject) => {
        var rs_opt = new Opts(opt);
        if (opt._id) {
          rs_opt.$update(successCb, errorCb);
        } else {
          rs_opt.$save(successCb, errorCb);
        }
        function successCb(res) {
          Socket.emit('opts_request', { pollId: res.poll });
          resolve(res);
        }
        function errorCb(err) {
          reject(err);
        }
      });
    };
    this.save_like_cmt = (cmt, type) => {
      // type: 1: like - 2: dislike;
      return new Promise((resolve, reject) => {
        var cnt = 0;
        var rs_like;
        if (cmt.like._id) {
          switch (cmt.like.type) {
            case 0:
              cnt = type === 1 ? 1 : -1;
              cmt.like.type = type;
              break;

            case 1:
              cnt = type === 1 ? -1 : -2;
              cmt.like.type = type === 1 ? 0 : 2;
              break;

            case 2:
              cnt = type === 1 ? 2 : 1;
              cmt.like.type = type === 1 ? 1 : 0;
              break;
          }
          rs_like = new Cmtlikes(cmt.like);
          rs_like.cnt = cnt;
          rs_like.$update(successCb, successCb);
        } else {
          cnt = type === 1 ? 1 : -1;
          rs_like = new Cmtlikes({
            cmt: cmt._id,
            type: type
          });
          rs_like.cnt = cnt;
          rs_like.$save(successCb, successCb);
        }
        function successCb(res) {
          Socket.emit('cmt_like', {
            pollId: cmt.poll,
            cmtId: cmt._id,
            likeCnt: res.likeCnt,
            from: res.like.user,
            to: cmt.user._id,
            type: res.like.type
          });
          resolve(res);
        }
        function errorCb(err) {
          reject(err);
        }
      });
    };
    this.save_report = pollId => {
      return new Promise((resolve, reject) => {
        var rs_report = new Reports({
          poll: pollId
        });
        rs_report.$save(
          res => {
            return resolve(res);
          },
          err => {
            return reject(err);
          }
        );
      });
    };
    this.save_bookmark = pollId => {
      return new Promise((resolve, reject) => {
        var rs_bookmark = new Bookmarks({
          poll: pollId
        });
        rs_bookmark.$save(
          res => {
            return resolve(res);
          },
          err => {
            return reject(err);
          }
        );
      });
    };
    return this;
  }
})();
