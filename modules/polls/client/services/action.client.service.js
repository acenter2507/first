(function () {
  'use strict';
  angular.module('polls').factory('Action', Action);

  Action.$inject = [
    '$http',
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
    'CategorysService',
    'PollreportsService',
    'Userreport',
    'ViewsService',
    'PollsApi',
    'VotesApi',
    'CmtsApi',
    'UserApi'
  ];

  function Action(
    $http,
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
    Categorys,
    Pollreports,
    Userreport,
    Views,
    PollsApi,
    VotesApi,
    CmtsApi,
    UserApi
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

    this.get_user_report = userId => {
      return new Promise((resolve, reject) => {
        UserApi.get_user_report(userId)
          .then(res => {
            resolve(res);
          })
          .catch(err => {
            reject(err);
          });
      });
    };
    this.count_up_view_profile = (report, userId) => {
      return new Promise((resolve, reject) => {
        var rs_report;
        if (report._id) {
          rs_report = new Userreport(report);
          rs_report.viewCnt += 1;
          rs_report.$update();
        } else {
          rs_report = new Userreport({ user: userId });
          rs_report.viewCnt = 1;
          rs_report.$save();
        }
        resolve();
      });
    };

    this.get_poll = pollId => {
      return new Promise((resolve, reject) => {
        Polls.get({ pollId: pollId }, _poll => {
          return resolve(_poll);
        });
      });
    };
    this.get_poll_http = pollId => {
      return $http.get('api/polls/' + pollId);
    };
    this.get_polls = (_page) => {
      return new Promise((resolve, reject) => {
        var page = _page || 0;
        PollsApi.findPolls(page)
          .then(res => {
            return resolve(res);
          })
          .catch(err => {
            return reject(err);
          });
      });
    };
    this.get_hot_polls = (_page) => {
      return new Promise((resolve, reject) => {
        var page = _page || 0;
        PollsApi.findHotPolls(page)
          .then(res => {
            return resolve(res);
          })
          .catch(err => {
            return reject(err);
          });
      });
    };
    this.save_poll = poll => {
      return new Promise((resolve, reject) => {
        var isNew = !poll._id ? true : false;
        if (!isNew) {
          poll.$update(successCb, errorCb);
        } else {
          poll.$save(successCb, errorCb);
        }
        function successCb(res) {
          if (isNew) {
            if (res.isPublic) {
              Socket.emit('poll_create', res);
            }
          } else {
            Socket.emit('poll_update', { pollId: res._id });
          }
          resolve(res);
        }
        function errorCb(err) {
          reject(err);
        }
      });
    };
    this.delete_poll = poll => {
      return new Promise((resolve, reject) => {
        var rs_poll = new Polls(poll);
        rs_poll.$remove(() => {
          Socket.emit('poll_delete', { pollId: poll._id });
          return resolve();
        });
      });
    };
    this.get_poll_report = pollId => {
      return new Promise((resolve, reject) => {
        PollsApi.findPollreport(pollId)
          .then(res => {
            return resolve(res);
          })
          .catch(err => {
            return reject(err);
          });
      });
    };
    this.count_up_poll_view = report => {
      return new Promise((resolve, reject) => {
        var rs_report = new Pollreports(report);
        rs_report.viewCnt += 1;
        rs_report.$update(successCb, errorCb);
        function successCb(res) {
          resolve(res);
        }
        function errorCb(err) {
          reject(err);
        }
      });
    };
    this.save_view_poll = pollId => {
      return new Promise((resolve, reject) => {
        PollsApi.findView(pollId)
          .then(res => {
            if (!res.data || !res.data._id) {
              var rs_view = new Views({ poll: pollId, user: Authentication.user._id });
              rs_view.$save();
            }
          });
      });
    };
    // api get comments
    this.get_cmts = (pollId, _page) => {
      return new Promise((resolve, reject) => {
        var page = _page || 0;
        PollsApi.findCmts(pollId, page)
          .then(res => {
            return resolve(res);
          })
          .catch(err => {
            return reject(err);
          });
      });
    };
    // api get comment by Id
    this.get_cmt = cmtId => {
      return $http.get('api/cmts/' + cmtId);
    };
    // Lưu comment vào db
    this.save_cmt = (poll, cmt) => {
      return new Promise((resolve, reject) => {
        var rs_cmt = new Cmts(cmt);
        var isNew = !cmt._id ? true : false;
        var promise;
        if (cmt._id) {
          rs_cmt.isEdited = true;
          rs_cmt.updated = new Date();
          rs_cmt.$update(successCb, errorCb);
        } else {
          rs_cmt.poll = poll._id;
          rs_cmt.$save(successCb, errorCb);
        }
        function successCb(res) {
          Socket.emit('cmt_add', {
            pollId: poll._id,
            cmtId: res._id,
            isNew: isNew,
            from: Authentication.user._id,
            to: res.to,
            displayName: Authentication.user.displayName,
            profileImageURL: Authentication.user.profileImageURL,
            title: poll.title
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
          Socket.emit('cmt_del', { pollId: cmt.poll._id, cmtId: cmt._id });
          return resolve();
        });
      });
    };

    this.get_like = pollId => {
      return new Promise((resolve, reject) => {
        PollsApi.findPollLike(pollId)
          .then(res => {
            return resolve(res);
          })
          .catch(err => {
            return reject(err);
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
            report: res.report,
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

    this.get_opts_for_vote = voteId => {
      return new Promise((resolve, reject) => {
        VotesApi.findOpts(voteId)
          .then(res => {
            return resolve(res);
          })
          .catch(err => {
            return reject(err);
          });
      });
    };
    this.get_vote = pollId => {
      return new Promise((resolve, reject) => {
        PollsApi.findOwnerVote(pollId)
          .then(res => {
            return resolve(res);
          })
          .catch(err => {
            return reject(err);
          });
      });
    };
    // get all vote for option in poll
    this.get_voteopts = pollId => {
      return new Promise((resolve, reject) => {
        PollsApi.findVoteopts(pollId)
          .then(res => {
            return resolve(res);
          })
          .catch(err => {
            return reject(err);
          });
      });
    };
    // Lưu vote vào db
    this.save_vote = (vote, opts, poll) => {
      return new Promise((resolve, reject) => {
        vote.opts = opts;
        var rs_vote = new Votes(vote);
        if (vote._id) {
          rs_vote.updateCnt += 1;
          rs_vote.updated = new Date();
          rs_vote.$update(successCb, errorCb);
        } else {
          rs_vote.$save(successCb, errorCb);
        }
        function successCb(res) {
          Socket.emit('poll_vote', {
            pollId: res.poll,
            from: Authentication.user._id,
            displayName: Authentication.user.displayName,
            profileImageURL: Authentication.user.profileImageURL,
            title: poll.title
          });
          resolve(res);
        }
        function errorCb(err) {
          reject(err);
        }
      });
    };
    // api get all options in poll
    this.get_opts = pollId => {
      return new Promise((resolve, reject) => {
        PollsApi.findOpts(pollId)
          .then(res => {
            return resolve(res);
          })
          .catch(err => {
            return reject(err);
          });
      });
    };
    // Lưu option
    this.save_opt = (opt, poll) => {
      return new Promise((resolve, reject) => {
        var rs_opt = new Opts(opt);
        if (opt._id) {
          rs_opt.$update(successCb, errorCb);
        } else {
          rs_opt.$save(successCb, errorCb);
        }
        function successCb(res) {
          Socket.emit('opts_request', { pollId: res.poll, from: res.user._id, to: poll.user._id });
          resolve(res);
        }
        function errorCb(err) {
          reject(err);
        }
      });
    };
    // api get comments
    this.get_like_cmt = cmtId => {
      return new Promise((resolve, reject) => {
        CmtsApi.findLike(cmtId)
          .then(res => {
            return resolve(res);
          })
          .catch(err => {
            return reject(err);
          });
      });
    };
    // Save like of comment
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
            pollId: cmt.poll._id,
            cmtId: cmt._id,
            likeCnt: res.likeCnt,
            from: res.like.user._id,
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
    // get report info for user in poll
    this.get_report = pollId => {
      return new Promise((resolve, reject) => {
        PollsApi.findReport(pollId)
          .then(res => {
            return resolve(res);
          })
          .catch(err => {
            return reject(err);
          });
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
    this.get_follow = pollId => {
      return new Promise((resolve, reject) => {
        PollsApi.findPolluser(pollId)
          .then(res => {
            return resolve(res);
          })
          .catch(err => {
            return reject(err);
          });
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
    // get info bookmark of user
    this.get_bookmark = pollId => {
      return new Promise((resolve, reject) => {
        PollsApi.findBookmark(pollId)
          .then(res => {
            return resolve(res);
          })
          .catch(err => {
            return reject(err);
          });
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
    // get all tags in poll
    this.get_tags = pollId => {
      return new Promise((resolve, reject) => {
        PollsApi.findTags(pollId)
          .then(res => {
            return resolve(res);
          })
          .catch(err => {
            return reject(err);
          });
      });
    };
    // get categorys
    this.get_categorys = () => {
      return new Promise((resolve, reject) => {
        Categorys.query().$promise.then(res => {
          return resolve(res);
        });
      });
    };
    return this;
  }
})();
