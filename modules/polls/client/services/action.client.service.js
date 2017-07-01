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
    this.save_cmt = (pollId, cmt) => {
      return new Promise((resolve, reject) => {
        var rs_cmt = new Cmts(cmt);
        var isNew = !cmt._id ? true : false;
        var promise;
        if (cmt._id) {
          rs_cmt.isEdited = true;
          rs_cmt.updated = new Date();
          promise = rs_cmt.$update().$promise;
        } else {
          rs_cmt.poll = pollId;
          promise = rs_cmt.$save().$promise;
        }
        promise.then(res => {
          Socket.emit('cmt_add', {
            pollId: pollId,
            cmtId: res._id,
            isNew: isNew,
            from: Authentication.user._id,
            to: res.to
          });
          return resolve(res);
        }).catch(err => {
          return reject(err);
        });
        // function successCb(res) {
        // }
        // function errorCb(err) {
        //   Socket.emit('cmt_add', {
        //     pollId: pollId,
        //     cmtId: res._id,
        //     isNew: isNew,
        //     from: Authentication.user._id,
        //     to: res.to
        //   });
        //   resolve(res);
        // }
      });
    };
    this.save_like = like => {};
    this.save_like_cmt = likeCmt => {};
    this.save_follow = polluser => {};
    this.save_report = report => {};
    this.save_vote = vote => {};
  }
})();
