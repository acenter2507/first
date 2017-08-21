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
    'PollusersService',
    'ReportsService',
    'BookmarksService',
    'CategorysService',
    'TagsService',
    'Userreport',
    'ViewsService',
    'UserApi'
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
    Categorys,
    Tags,
    Userreport,
    Views,
    UserApi
  ) {
    /**
     * Lấy danh sách poll cho màn hình polls.list
     */
    this.get_polls = (_page) => {
      return new Promise((resolve, reject) => {
        var page = _page || 0;
        $http.get('/api/findPolls/' + page, {
          ignoreLoadingBar: true
        })
          .then(res => {
            return resolve(res);
          }, err => {
            return reject(err);
          });
      });
    };
    /**
     * Lấy danh sách poll mổi bật cho màn hình polls.list
     */
    this.get_populars = (_page) => {
      return new Promise((resolve, reject) => {
        var page = _page || 0;
        $http.get('/api/findPopulars/' + page, {
          ignoreLoadingBar: true
        })
          .then(res => {
            return resolve(res);
          }, err => {
            return reject(err);
          });
      });
    };
    /**
     * Lấy danh sách category (Kèm count poll)
     */
    this.get_categorys = () => {
      return new Promise((resolve, reject) => {
        Categorys.query().$promise
          .then(res => {
            return resolve(res);
          }, err => {
            return reject(err);
          });
      });
    };
    /**
     * Lấy toàn bộ thông tin của user đối với poll màn hình polls.view
     */
    this.get_owner_by_pollId = pollId => {
      return new Promise((resolve, reject) => {
        $http.get('/api/findOwners/' + pollId, {
          ignoreLoadingBar: true
        })
          .then(res => {
            return resolve(res);
          }, err => {
            return reject(err);
          });
      });
    };
    /**
     * Load comments màn hình polls.view
     */
    this.get_cmts = (pollId, _page, sort) => {
      return new Promise((resolve, reject) => {
        var page = _page || 0;
        $http.get('/api/findCmts/' + pollId + '/' + page + '/' + sort, {
          ignoreLoadingBar: true
        })
          .then(res => {
            return resolve(res);
          }, err => {
            return reject(err);
          });
      });
    };
    /**
     * Load comments màn hình polls.view
     */
    this.get_cmt = cmtId => {
      return new Promise((resolve, reject) => {
        $http.get('api/cmts/' + cmtId, {
          ignoreLoadingBar: true
        })
          .then(res => {
            return resolve(res);
          }, err => {
            return reject(err);
          });
      });
    };
    /**
     * Lấy thông tin count của user
     */
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
    /**
     * Tăng giá trị view profile cho user
     */
    this.count_up_view_profile = (report, userId) => {
      return new Promise((resolve, reject) => {
        var rs_report;
        if (report._id) {
          rs_report = new Userreport({ _id: report._id });
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
        var rs_poll = new Polls({ _id: poll._id });
        rs_poll.$remove(() => {
          Socket.emit('poll_delete', { pollId: poll._id });
          return resolve();
        });
      });
    };
    /**
    * Lưu poll vào danh sách đã view của user
    */
    this.save_view_poll = view => {
      return new Promise((resolve, reject) => {
        if (view._id) return resolve();
        var rs_view = new Views(view);
        rs_view.user = Authentication.user._id;
        rs_view.$save();
      });
    };
    /**
    * Tăng count view của point
    */
    this.count_up_view_poll = pollId => {
      return new Promise((resolve, reject) => {
        $http.get('/api/countUpView/' + pollId, {
          ignoreLoadingBar: true
        })
          .then(res => {
            return resolve(res);
          }, err => {
            return reject(err);
          });
      });
    };
    // Lưu comment vào db
    this.save_cmt = (poll, cmt) => {
      return new Promise((resolve, reject) => {
        var rs_cmt = new Cmts(cmt);
        var isNew = !cmt._id ? true : false;
        var promise;
        if (!isNew) {
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
        var rs_cmt = new Cmts({ _id: cmt._id });
        rs_cmt.$remove(() => {
          Socket.emit('cmt_del', { pollId: cmt.poll._id, cmtId: cmt._id });
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
          rs_like = new Likes({ _id: like._id });
          rs_like.cnt = cnt;
          rs_like.type = like.type;
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

    /**
     * Lấy toàn bộ thông tin các vote và các opt của vote
     */
    this.get_voteopts = pollId => {
      return new Promise((resolve, reject) => {
        $http.get('/api/findVoteopts/' + pollId, {
          ignoreLoadingBar: true
        })
          .then(res => {
            return resolve(res);
          }, err => {
            return reject(err);
          });
      });
    };
    /**
     * Lưu 1 vote của poll
     */
    this.save_vote = (vote, opts, poll) => {
      return new Promise((resolve, reject) => {
        var rs_vote;
        if (vote._id) {
          rs_vote = new Votes({ _id: vote._id });
          rs_vote.opts = opts;
          rs_vote.updateCnt += 1;
          rs_vote.updated = moment().formart();
          rs_vote.$update(successCb, errorCb);
        } else {
          rs_vote = new Votes(vote);
          rs_vote.opts = opts;
          rs_vote.$save(successCb, errorCb);
        }
        function successCb(res) {
          Socket.emit('poll_vote', {
            pollId: res.poll._id || res.poll,
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
          Socket.emit('opts_request', { pollId: res.poll._id || res.poll, from: res.user._id, to: poll.user._id });
          resolve(res);
        }
        function errorCb(err) {
          reject(err);
        }
      });
    };
    /**
     * Lưu 1 like comment
     */
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
          rs_like = new Cmtlikes({ _id: cmt.like._id });
          rs_like.cnt = cnt;
          rs_like.cnt = cmt.like.type;
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
            pollId: cmt.poll._id ? cmt.poll._id : cmt.poll,
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
    this.save_report = (poll, reason) => {
      return new Promise((resolve, reject) => {
        var rs_report = new Reports({
          poll: poll._id,
          victim: poll.user._id,
          reason: reason
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
    // Lưu follow vào db
    this.save_follow = follow => {
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
          resolve(res);
        }
        function errorCb(err) {
          reject(err);
        }
      });
    };
    this.save_bookmark = pollId => {
      return new Promise((resolve, reject) => {
        var rs_bookmark = new Bookmarks({ poll: pollId });
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
    /**
     * Xóa bookmark
     */
    this.remove_bookmark = pollId => {
      return new Promise((resolve, reject) => {
        $http.get('/api/removeBookmark/' + pollId, {
          ignoreLoadingBar: true
        })
          .then(res => {
            return resolve(res);
          }, err => {
            return reject(err);
          });
      });
    };
    /**
     * Lấy list poll thuộc category
     */
    this.get_category_polls = (categoryId, page, sort) => {
      return $http.get('/api/categorys/' + categoryId + '/polls/' + page + '/' + sort, {
        ignoreLoadingBar: true
      });
    };
    this.search = condition => {
      return $http.post('/api/search', { condition: condition }, {
        ignoreLoadingBar: true
      });
    };
    this.search_user_by_name = name => {
      return $http.get('/api/users/search/s=' + name, {
        ignoreLoadingBar: true
      });
    };
    this.get_tags = () => {
      return new Promise((resolve, reject) => {
        Tags.query().$promise
          .then(res => {
            return resolve(res);
          }, err => {
            return reject(err);
          });
      });
    };
    this.get_popular_tags = () => {
      return $http.get('/api/tags/popular', {
        ignoreLoadingBar: true
      });
    };
    /**
     * Lấy list poll thuộc tag
     */
    this.get_tag_polls = (tagId) => {
      return $http.get('/api/tags/' + tagId + '/polls', {
        ignoreLoadingBar: true
      });
    };
    /**
     * Xử lý poll khi show lên màn hình
     */
    this.process_before_show = poll => {
      let isLogged = (Authentication.user);
      poll.isCurrentUserOwner = isLogged && Authentication.user._id === poll.user._id;
      poll.chart = {
        options: { responsive: true },
        colors: [],
        labels: [],
        data: []
      };
      poll.total = poll.voteopts.length;
      poll.opts.forEach(opt => {
        opt.voteCnt = _.where(poll.voteopts, { opt: opt._id }).length || 0;
        opt.progressVal = calPercen(poll.total, opt.voteCnt);
        poll.chart.data.push(opt.voteCnt);
        poll.chart.colors.push(opt.color);
        poll.chart.labels.push(opt.title);
      });
      return poll;
    };
    // Tính phần trăm tỉ lệ vote cho opt
    this.calPercen = calPercen;
    function calPercen(total, value) {
      if (total === 0) {
        return 0;
      }
      return Math.floor(value * 100 / total) || 0;
    }
    return this;
  }
})();
