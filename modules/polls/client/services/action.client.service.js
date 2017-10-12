(function () {
  'use strict';
  angular.module('polls').factory('Action', Action);

  Action.$inject = [
    '$http',
    'Authentication',
    'Socket',
    'PollsService',
    'CmtsService',
    'VotesService',
    'OptsService',
    'LikesService',
    'CmtlikesService',
    'FollowsService',
    'ReportsService',
    'BookmarksService',
    'ViewsService'
  ];

  function Action(
    $http,
    Authentication,
    Socket,
    Polls,
    Cmts,
    Votes,
    Opts,
    Likes,
    Cmtlikes,
    Follows,
    Reports,
    Bookmarks,
    Views
  ) {
    /**
     * Lấy danh sách poll cho màn hình polls.list
     */
    this.loadPolls = (_page, language) => {
      var page = _page || 1;
      return $http.get('/api/loadPolls/' + page + '/' + language, { ignoreLoadingBar: true });
    };
    /**
     * Lấy danh sách poll mổi bật cho màn hình polls.list
     */
    this.loadPopularPolls = (_page, language) => {
      var page = _page || 0;
      return $http.get('/api/loadPopularPolls/' + page + '/' + language, { ignoreLoadingBar: true });
    };
    /**
     * Lấy toàn bộ thông tin của user đối với poll màn hình polls.view
     */
    this.loadOwnerInfo = pollId => {
      return $http.get('/api/loadOwnerInfo/' + pollId, { ignoreLoadingBar: true });
    };
    /**
     * Lấy poll bằng poll id
     */
    this.loadPollById = pollId => {
      return new Promise((resolve, reject) => {
        Polls.get({ pollId: pollId }, poll => {
          return resolve(poll);
        });
      });
    };
    /**
    * Tăng count view của point
    */
    this.searchPolls = condition => {
      return $http.post('/api/searchPolls', { condition: condition }, { ignoreLoadingBar: true });
    };
    /**
     * Lưu poll
     */
    this.savePoll = poll => {
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
              Socket.emit('poll_create');
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
    /**
     * Xóa poll
     */
    this.deletePoll = poll => {
      return new Promise((resolve, reject) => {
        var rs_poll = new Polls({ _id: poll._id });
        rs_poll.$remove(() => {
          Socket.emit('poll_delete', { pollId: poll._id });
          return resolve();
        });
      });
    };
    /**
    * Tăng count view của point
    */
    this.upViewPoll = pollId => {
      return $http.get('/api/countUpView/' + pollId, { ignoreLoadingBar: true });
    };
    // ------------------ COMMENT -------------------------------
    /**
     * Load comments màn hình polls.view
     */
    this.loadComments = (pollId, _page, sort) => {
      var page = _page || 1;
      return $http.get('/api/loadComments/' + pollId + '/' + page + '/' + sort, { ignoreLoadingBar: true });
    };
    /**
     * Load comments màn hình polls.view
     */
    this.loadCommentById = cmtId => {
      return new Promise((resolve, reject) => {
        Cmts.get({ cmtId: cmtId }, cmt => {
          return resolve(cmt);
        });
      });
    };
    /**
     * Lưu comment vào db
     */
    this.saveComment = (cmt) => {
      return new Promise((resolve, reject) => {
        var rs_cmt = new Cmts(cmt);
        var isNew = !cmt._id ? true : false;
        if (!isNew) {
          rs_cmt.isEdited = true;
          rs_cmt.updated = moment().utc().format();
          rs_cmt.$update(successCb, errorCb);
        } else {
          rs_cmt.$save(successCb, errorCb);
        }
        function successCb(res) {
          if (Authentication.user) {
            Socket.emit('cmt_add', {
              cmtId: res._id,
              isNew: isNew,
              pollId: res.poll._id || res.poll,
              to: res.to,
              from: Authentication.user._id
            });
          }
          res.isNew = isNew;
          resolve(res);
        }
        function errorCb(err) {
          reject(err);
        }
      });
    };
    /**
     * Xóa comment
     */
    this.deleteComment = cmt => {
      var rs_cmt = new Cmts({ _id: cmt._id });
      rs_cmt.$remove(() => {
        Socket.emit('cmt_del', { pollId: cmt.poll._id, cmtId: cmt._id });
      });
    };

    // ------------------ Views -------------------------------
    /**
    * Lưu poll vào danh sách đã view của user
    */
    this.saveViewPoll = view => {
      return new Promise((resolve, reject) => {
        if (view._id) return resolve();
        var rs_view = new Views(view);
        rs_view.$save();
      });
    };


    // ------------------ Like -------------------------------
    // Lưu like vào db
    this.saveLikePoll = (like, type, poll) => {
      // type: 1: like - 2: dislike;
      return new Promise((resolve, reject) => {
        var rs_like;
        if (like._id) {
          // Bấm lặp lại button
          if (like.type === type) {
            rs_like = new Likes({ _id: like._id });
            return rs_like.$remove(successCb, successCb);
          } else {
            // Trường hợp đổi button
            rs_like = new Likes({ _id: like._id, type: type });
            return rs_like.$update(successCb, successCb);
          }
        } else {
          rs_like = new Likes({ poll: poll._id, type: type });
          return rs_like.$save(successCb, successCb);
        }
        function successCb(res) {
          if (!res.like) return resolve(res);
          if (Authentication.user) {
            Socket.emit('poll_like', {
              pollId: poll._id,
              likeCnt: res.likeCnt,
              from: Authentication.user._id,
              to: poll.user ? poll.user._id : undefined,
              type: res.like.type
            });
          }
          return resolve(res);
        }
        function errorCb(err) {
          reject(err);
        }
      });
    };

    // ------------------ Votes -------------------------------
    /**
     * Lấy toàn bộ thông tin các votes 
     */
    this.loadVotesByPollId = pollId => {
      return $http.get('/api/loadVotesByPoll/' + pollId, { ignoreLoadingBar: true });
    };
    /**
     * Lấy toàn bộ thông tin các vote của 1 option
     */
    this.loadVotesByOptionId = optId => {
      return $http.get('/api/loadVotesByOption/' + optId, { ignoreLoadingBar: true });
    };
    /**
     * Lưu 1 vote của poll
     */
    this.saveVote = (vote, opts, poll) => {
      return new Promise((resolve, reject) => {
        var rs_vote;
        if (vote._id) {
          rs_vote = new Votes({ _id: vote._id });
          rs_vote.opts = opts;
          rs_vote.updateCnt = vote.updateCnt + 1;
          rs_vote.updated = moment().utc().format();
          rs_vote.$update(successCb, errorCb);
        } else {
          rs_vote = new Votes(vote);
          rs_vote.opts = opts;
          rs_vote.$save(successCb, errorCb);
        }
        function successCb(res) {
          Socket.emit('poll_vote', { pollId: poll._id });
          return resolve(res);
        }
        function errorCb(err) {
          console.log(err);
          return reject(err);
        }
      });
    };


    // ------------------ Options -------------------------------
    // Lưu option
    this.saveOption = (opt, poll) => {
      return new Promise((resolve, reject) => {
        var rs_opt = new Opts(opt);
        if (opt._id) {
          rs_opt.$update(successCb, errorCb);
        } else {
          rs_opt.$save(successCb, errorCb);
        }
        function successCb(res) {
          Socket.emit('opts_request', { pollId: res.poll._id || res.poll, from: res.user._id, to: poll.user._id, optId: res._id });
          return resolve(res);
        }
        function errorCb(err) {
          return reject(err);
        }
      });
    };

    // ------------------ Options -------------------------------
    /**
     * Lưu 1 like comment
     */
    this.saveLikeComment = (cmt, type) => {
      // type: 1: like - 2: dislike;
      return new Promise((resolve, reject) => {
        var rs_like;
        if (cmt.like._id) {
          // Bấm lặp lại button
          if (cmt.like.type === type) {
            rs_like = new Cmtlikes({ _id: cmt.like._id });
            return rs_like.$remove(successCb, successCb);
          } else {
            // Trường hợp đổi button
            rs_like = new Cmtlikes({ _id: cmt.like._id, type: type });
            return rs_like.$update(successCb, successCb);
          }
        } else {
          rs_like = new Cmtlikes({ cmt: cmt._id, type: type });
          return rs_like.$save(successCb, successCb);
        }
        function successCb(res) {
          return resolve(res);
        }
        function errorCb(err) {
          return reject(err);
        }
      });
    };

    // ------------------ Reports -------------------------------
    /**
     * Lưu 1 report của user với 1 poll
     */
    this.saveReportPoll = (poll, reason) => {
      return new Promise((resolve, reject) => {
        var rs_report = new Reports({
          poll: poll._id,
          victim: poll.user ? poll.user._id : null,
          reason: reason
        });
        rs_report.$save(res => {
          return resolve(res);
        }, reject);
      });
    };

    // ------------------ Follows -------------------------------
    /**
     * Lưu 1 follow của user với 1 poll
     */
    this.saveFollowPoll = follow => {
      return new Promise((resolve, reject) => {
        var rs_follow;
        if (follow._id) {
          rs_follow = new Follows({ _id: follow._id });
          rs_follow.$remove();
          return resolve();
        } else {
          rs_follow = new Follows(follow);
          rs_follow.$save(successCb, errorCb);
        }
        function successCb(res) {
          return resolve(res);
        }
        function errorCb(err) {
          return reject(err);
        }
      });
    };

    // ------------------ Bookmarks -------------------------------
    /**
     * Lưu 1 bokmark của user với 1 poll
     */
    this.saveBookmarkPoll = pollId => {
      return new Promise((resolve, reject) => {
        var rs_bookmark = new Bookmarks({ poll: pollId });
        rs_bookmark.$save(res => {
          return resolve(res);
        }, err => {
          return reject(err);
        });
      });
    };
    /**
     * Xóa bookmark
     */
    this.removeBookmarkPoll = pollId => {
      return $http.get('/api/removeBookmark/' + pollId, { ignoreLoadingBar: true });
    };

    /**
     * Xử lý poll khi show lên màn hình
     */
    this.prepareShowingData = poll => {
      let isLogged = (Authentication.user);
      if (!isLogged || !poll.user) {
        poll.isCurrentUserOwner = false;
      } else {
        poll.isCurrentUserOwner = Authentication.user._id === poll.user._id;
      }
      poll.chart = {
        options: { responsive: true },
        colors: [],
        labels: [],
        data: []
      };
      var options = this.getOptionsInVotes(poll.votes);
      poll.total = options.length;
      var collect = this.countByOptions(poll.opts, options);
      poll.opts.forEach(opt => {
        opt.voteCnt = _.findWhere(collect, { opt: opt._id }).count;
        opt.progressVal = this.calPercen(poll.total, opt.voteCnt);
        poll.chart.data.push(opt.voteCnt);
        poll.chart.colors.push(opt.color);
        poll.chart.labels.push(opt.title);
      });
      return poll;
    };
    this.getOptionsInVotes = votes => {
      var options = [];
      votes.forEach(vote => {
        vote.opts.forEach(opt => {
          options.push(opt);
        });
      });
      return options;
    };
    this.countByOptions = (opts, voteOpts) => {
      var collect = _.map(opts, function (opt) {
        // var array = _.clone(voteOpts);
        var length = _.reject(voteOpts, function (el) {
          return el.toString() !== opt._id.toString();
        }).length;
        return { opt: opt._id, count: length };
      });
      return collect;
    };
    // Tính phần trăm tỉ lệ vote cho opt
    this.calPercen = (total, value) => {
      if (total === 0) {
        return 0;
      }
      return Math.floor(value * 100 / total) || 0;
    };
    return this;
  }
})();
