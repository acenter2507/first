'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Poll = mongoose.model('Poll'),
  Polluser = mongoose.model('Polluser'),
  Report = mongoose.model('Report'),
  Bookmark = mongoose.model('Bookmark'),

  Opt = mongoose.model('Opt'),
  Vote = mongoose.model('Vote'),
  Voteopt = mongoose.model('Voteopt'),
  Userreport = mongoose.model('Userreport'),
  Like = mongoose.model('Like'),
  Cmt = mongoose.model('Cmt'),
  Cmtlike = mongoose.model('Cmtlike'),
  View = mongoose.model('View'),
  Tag = mongoose.model('Tag'),
  Polltag = mongoose.model('Polltag'),
  errorHandler = require(path.resolve(
    './modules/core/server/controllers/errors.server.controller'
  )),
  _ = require('lodash'),
  __ = require('underscore'),
  _moment = require('moment');

/**
 * Search Polls
 */
exports.search = function (req, res) {
  const condition = req.body.condition;
  var search = condition_analysis(condition);
  console.log(search);
  var sort = condition.sort || '-created';
  Poll.find(search)
    .populate('category', 'name')
    .populate('user', 'displayName profileImageURL')
    .sort(sort).exec()
    .then(polls => {
      if (polls.length === 0) return res.jsonp(polls);
      var length = polls.length;
      var counter = 0;
      polls.forEach(function (instance, index, array) {
        array[index] = instance.toObject();
        count_followed(array[index]._id)
          .then(result => {
            array[index].followed = result || 0;
            return count_bookmarked(array[index]._id);
          })
          .then(result => {
            array[index].bookmarked = result || 0;
            return count_reported(array[index]._id);
          })
          .then(result => {
            array[index].reported = result || 0;
            if (++counter === length) {
              res.jsonp(polls);
            }
          })
          .catch(handleError);
      });
    }, handleError);

  function handleError(err) {
    console.log(err);
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

// Phan tich dieu kien search
function condition_analysis(condition) {
  var search = {};
  var and_arr = [];
  // Search by user
  if (condition.by) {
    and_arr.push({ user: condition.by });
  }
  if (condition.ctgr) {
    and_arr.push({ category: condition.ctgr });
  }
  if (condition.isPublic) {
    let isPublic = condition.isPublic === 'true';
    and_arr.push({ isPublic: isPublic });
  }
  if (condition.created_start) {
    let start = new _moment(condition.created_start).utc();
    and_arr.push({ created: { $gte: start } });
  }
  if (condition.created_end) {
    let end = new _moment(condition.created_end).utc();
    and_arr.push({ created: { $lt: end } });
  }
  if (condition.allow_multiple) {
    let allow_multiple = condition.allow_multiple === 'true';
    and_arr.push({ allow_multiple: allow_multiple });
  }
  if (condition.allow_add) {
    let allow_add = condition.allow_add === 'true';
    and_arr.push({ allow_add: allow_add });
  }
  if (condition.allow_guest) {
    let allow_guest = condition.allow_guest === 'true';
    and_arr.push({ allow_add: allow_guest });
  }
  if (condition.cmts && parseInt(condition.cmts)) {
    let cmtCnt = parseInt(condition.cmts);
    if (condition.cmts_pref === 'least') {
      and_arr.push({ cmtCnt: { $lt: cmtCnt } });
    } else {
      and_arr.push({ cmtCnt: { $gte: cmtCnt } });
    }
  }
  if (condition.votes && parseInt(condition.votes)) {
    let voteCnt = parseInt(condition.votes);
    if (condition.votes_pref === 'least') {
      and_arr.push({ voteCnt: { $lt: voteCnt } });
    } else {
      and_arr.push({ voteCnt: { $gte: voteCnt } });
    }
  }
  if (condition.likes && parseInt(condition.likes)) {
    let likeCnt = parseInt(condition.likes);
    if (condition.likes_pref === 'least') {
      and_arr.push({ likeCnt: { $lt: likeCnt } });
    } else {
      and_arr.push({ likeCnt: { $gte: likeCnt } });
    }
  }
  if (condition.views && parseInt(condition.views)) {
    let viewCnt = parseInt(condition.views);
    if (condition.views_pref === 'least') {
      and_arr.push({ viewCnt: { $lt: viewCnt } });
    } else {
      and_arr.push({ viewCnt: { $gte: viewCnt } });
    }
  }
  // Search by key in title
  if (condition.search && condition.search !== '') {
    and_arr.push({ $or: [{ title: { $regex: '.*' + condition.search + '.*' } }, { body: { $regex: '.*' + condition.search + '.*' } }] });
  }
  if (condition.status) {
    if (condition.status === 'infinity') {
      and_arr.push({ close: null });
    }
    if (condition.status === 'limit') {
      let now = new _moment().utc().fomart();
      and_arr.push({ $and: [{ close: { $ne: null } }, { close: { $gte: now } }] });
    }
    if (condition.status === 'closed') {
      let now = new _moment().utc().fomart();
      and_arr.push({ $and: [{ close: { $ne: null } }, { close: { $lt: now } }] });
    }
  }
  if (and_arr.length > 0) {
    search = { $and: and_arr };
  }
  return search;
}

function count_followed(pollId) {
  return new Promise((resolve, reject) => {
    Opt.find({ poll: pollId }).exec().count((cnt, err) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(cnt);
      }
    });
  });
}
function count_bookmarked(pollId) {
  return new Promise((resolve, reject) => {
    Bookmark.find({ poll: pollId }).exec().count((cnt, err) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(cnt);
      }
    });
  });
}
function count_reported(pollId) {
  return new Promise((resolve, reject) => {
    Report.find({ poll: pollId }).exec().count((cnt, err) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(cnt);
      }
    });
  });
}
// Lấy các option có status = 1 cho poll
function get_opts_by_pollId(pollId) {
  return new Promise((resolve, reject) => {
    Opt.find({ poll: pollId }).exec((err, opts) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(opts);
      }
    });
  });
}
// Lấy các comment có cho poll
function get_cmts_by_pollId(pollId) {
  return new Promise((resolve, reject) => {
    Cmt.find({ poll: pollId }).exec((err, cmts) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(cmts);
      }
    });
  });
}
// Lấy thông tin vote và các option được vote cho poll
function get_votes_by_pollId(pollId) {
  return new Promise((resolve, reject) => {
    var rs = {}, ids;
    Vote.find({ poll: pollId }).exec()
      .then(votes => {
        rs.votes = votes;
        ids = _.pluck(votes, '_id');
        Voteopt.find({ vote: { $in: ids } }).exec(function (err, opts) {
          if (err) {
            return reject(err);
          } else {
            rs.voteopts = opts;
            return resolve(rs);
          }
        });
      }, err => {
        return reject(err);
      });
  });
}
// Lấy thông tin following 1 poll của user hiện hành
function get_follow_by_pollId(pollId, userId) {
  return new Promise((resolve, reject) => {
    if (!userId) return resolve();
    Polluser.findOne({
      poll: pollId,
      user: userId
    }).exec((err, follow) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(follow);
      }
    });
  });
}
// Lấy thông tin user đã report poll hay chưa
function get_report_by_pollId(pollId, userId) {
  return new Promise((resolve, reject) => {
    if (!userId) return resolve();
    Report.findOne({
      poll: pollId,
      user: userId
    }).exec((err, report) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(report);
      }
    });
  });
}
// Lấy thông tin user đã bookmark poll hay chưa
function get_bookmark_by_pollId(pollId, userId) {
  return new Promise((resolve, reject) => {
    if (!userId) return resolve();
    Bookmark.findOne({
      poll: pollId,
      user: userId
    }).exec((err, bookmark) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(bookmark);
      }
    });
  });
}
// Lấy thông tin view poll của user
function get_view_by_pollId(pollId, userId) {
  return new Promise((resolve, reject) => {
    if (!userId) return resolve();
    View.findOne({
      poll: pollId,
      user: userId
    }).exec((err, view) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(view);
      }
    });
  });
}
// Lấy list tag đã add cho poll
function get_tags_by_pollId(pollId) {
  return new Promise((resolve, reject) => {
    Polltag.find({ poll: pollId })
      .populate('tag').exec(function (err, polltags) {
        if (err) {
          return reject(err);
        } else {
          var tags = [];
          polltags.forEach(function (pt) {
            tags.push(pt.tag);
          });
          return resolve(tags);
        }
      });
  });
}
// Lấy thông tin vote của user hiện hành đối với poll (nếu là guest thì sử dụng ip)
function get_vote_by_pollId_and_userId(pollId, userId, ip) {
  return new Promise((resolve, reject) => {
    var condition = {};
    condition.poll = pollId;
    if (userId) {
      condition.user = userId;
      condition.guest = false;
    } else {
      condition.ip = ip;
      condition.guest = true;
    }
    Vote.findOne(condition)
      .exec(function (err, vote) {
        if (err) {
          return reject(err);
        } else {
          return resolve(vote);
        }
      });
  });
}
// Lấy danh sách các option của 1 vote
function get_opts_by_voteId(voteId) {
  return new Promise((resolve, reject) => {
    if (!voteId) return resolve();
    Voteopt.find({ vote: voteId })
      .populate('opt', 'title')
      .exec(function (err, voteopts) {
        if (err) {
          return reject(err);
        } else {
          var opts = _.pluck(voteopts, 'opt') || [];
          return resolve(opts);
        }
      });
  });
}
// Lấy thông tin like của user đối với 1 poll
function get_like_by_pollId_and_userId(pollId, userId) {
  return new Promise((resolve, reject) => {
    if (!userId) return resolve();
    Like.findOne({ poll: pollId, user: userId }).exec(function (err, like) {
      if (err) {
        return reject(err);
      } else {
        return resolve(like);
      }
    });
  });
}
// Lấy thông tin like của user hiện hành đối với 1 comment
function get_like_by_cmtId_and_userId(cmtId, userId) {
  return new Promise((resolve, reject) => {
    if (!userId) return resolve();
    Cmtlike.findOne({ cmt: cmtId, user: userId }).exec(function (err, cmtlike) {
      if (err) {
        return reject(err);
      } else {
        return resolve(cmtlike);
      }
    });
  });
}

function get_full_by_pollId(pollId, userId) {
  var info = {};
  return new Promise((resolve, reject) => {
    // Lấy các options
    get_opts_by_pollId(pollId)
      .then(result => {
        info.opts = _.filter(result, { status: 1 }) || [];
        return get_votes_by_pollId(pollId);
      })
      // Lấy toàn bộ thông tin votes
      .then(result => {
        info.votes = result.votes || [];
        info.voteopts = result.voteopts || [];
        return get_follow_by_pollId(pollId, userId);
      })
      // Lấy follow của user hiện hành
      .then(result => {
        info.follow = result || { poll: pollId };
        return get_report_by_pollId(pollId, userId);
      })
      // Lấy report của user hiện hành
      .then(result => {
        info.reported = (result) ? true : false;
        return get_bookmark_by_pollId(pollId, userId);
      })
      // Lấy bookmark của user hiện hành
      .then(result => {
        info.bookmarked = (result) ? true : false;
        return resolve(info);
      })
      .catch(err => {
        return resolve(err);
      });
  });
}
exports.get_full_by_pollId = get_full_by_pollId;
exports.get_opts_by_pollId = get_opts_by_pollId;
exports.get_votes_by_pollId = get_votes_by_pollId;
exports.get_follow_by_pollId = get_follow_by_pollId;
exports.get_report_by_pollId = get_report_by_pollId;
exports.get_bookmark_by_pollId = get_bookmark_by_pollId;
exports.get_like_by_cmtId_and_userId = get_like_by_cmtId_and_userId;
exports.get_opts_by_voteId = get_opts_by_voteId;
