'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  multer = require('multer'),
  config = require(path.resolve('./config/config')),
  Poll = mongoose.model('Poll'),
  Opt = mongoose.model('Opt'),
  Vote = mongoose.model('Vote'),
  Voteopt = mongoose.model('Voteopt'),
  Userreport = mongoose.model('Userreport'),
  Polluser = mongoose.model('Polluser'),
  Report = mongoose.model('Report'),
  Bookmark = mongoose.model('Bookmark'),
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
 * Create a Poll
 */
exports.create = function (req, res) {
  var poll = new Poll(req.body);
  poll.user = req.user;

  var tags = req.body.tags || [];
  var opts = req.body.opts || [];
  var promises = [];

  poll.save()
    .then(_poll => {
      poll = _poll;
      return Userreport.countUpPoll(req.user._id);
    }, handleError)
    .then(_report => {
      // Lưu tag vào db
      tags.forEach(tag => {
        var polltag = new Polltag({ tag: tag, poll: poll._id });
        promises.push(polltag.save());
      });
      return Promise.all(promises);
    }, handleError)
    .then(() => {
      // Lưu options vào db
      promises = [];
      opts.forEach(opt => {
        var _opt = new Opt(opt);
        _opt.user = req.user;
        _opt.poll = poll._id;
        promises.push(_opt.save());
      });
      return Promise.all(promises);
    }, handleError)
    .then(() => {
      // Tạo biến follow mới
      promises = [];
      var _polluser = new Polluser({ poll: poll._id, user: req.user._id });
      return _polluser.save();
    }, handleError)
    .then(_polluser => {
      res.jsonp(poll);
    }, handleError);

  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * Show the current Poll
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var poll = req.poll ? req.poll.toJSON() : {};

  poll.isCurrentUserOwner =
    req.user &&
    poll.user &&
    poll.user._id.toString() === req.user._id.toString();
  poll.canEdit =
    req.user &&
    req.user.roles &&
    req.user.roles.length &&
    req.user.roles.indexOf('admin') > -1;
  get_opts_by_pollId(poll._id)
    .then(result => {
      poll.opts = result || [];
      return get_votes_by_pollId(poll._id);
    })
    .then(result => {
      poll.votes = result.votes || [];
      poll.voteopts = result.voteopts || [];
      return get_tags_by_pollId(poll._id);
    })
    .then(result => {
      poll.tags = result || [];
      res.jsonp(poll);
    })
    .catch(err => {
      return handleError(err);
    });

  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * Update a Poll
 */
exports.update = function (req, res) {
  var poll = req.poll;
  poll = _.extend(poll, req.body);
  var tags = req.body.tags || [];
  var opts = req.body.opts || [];
  var promises = [];
  poll.save()
    .then(_poll => {
      poll = _poll;
      return Polltag.remove({ poll: _poll._id });
    }, handleError)
    .then(() => {
      tags.forEach(tag => {
        var polltag = new Polltag({ tag: tag, poll: poll._id });
        promises.push(polltag.save());
      });
      return Promise.all(promises);
    }, handleError)
    .then(() => {
      promises = [];
      opts.forEach(opt => {
        if (opt._id) {
          promises.push(
            Opt.update({ _id: opt._id }, {
              $set: {
                title: opt.title,
                color: opt.color,
                body: opt.body
              }
            }).exec());
        } else {
          var _opt = new Opt(opt);
          _opt.user = req.user;
          _opt.poll = poll;
          promises.push(_opt.save());
        }
      });
      return Promise.all(promises);
    }, handleError)
    .then(_opts => {
      promises = [];
      res.jsonp(poll);
    }, handleError);

  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * Delete an Poll
 */
exports.delete = function (req, res) {
  var poll = req.poll;
  poll.remove()
    .then(() => { // Delete option
      return Opt.remove({ poll: poll._id });
    }, handleError)
    .then(() => { // Xóa like của các commetn trong poll
      var promises = [];
      Cmt.find({ poll: poll._id }).exec((err, cmts) => {
        cmts.forEach(cmt => {
          promises.push(Cmtlike.remove({ cmt: cmt._id }));
        });
        return Promise.all(promises);
      });
    }, handleError)
    .then(() => { // Xóa comment
      return Cmt.remove({ poll: poll._id });
    }, handleError)
    .then(() => { // Xóa thông tin của vote
      var promises = [];
      Vote.find({ poll: poll._id }).exec((err, votes) => {
        votes.forEach(vote => {
          promises.push(Voteopt.remove({ vote: vote._id }));
        });
        return Promise.all(promises);
      });
    }, handleError)
    .then(() => { // Xóa votes
      return Vote.remove({ poll: poll._id });
    }, handleError)
    .then(() => { // Xóa thông tin tag của poll
      return Polltag.remove({ poll: poll._id });
    }, handleError)
    .then(() => { // Xóa thông tin report về poll
      return Report.remove({ poll: poll._id });
    }, handleError)
    .then(() => { // Xóa thông tin bookmark về poll
      return Bookmark.remove({ poll: poll._id });
    }, handleError)
    .then(() => { // Xóa thông tin like
      return Like.remove({ poll: poll._id });
    }, handleError)
    .then(() => { // Xóa thông tin follow
      return Polluser.remove({ poll: poll._id });
    }, handleError)
    .then(() => {
      return Userreport.countDownPoll(poll.user);
    }, handleError)
    .then(() => {
      return View.remove({ poll: poll._id });
    }, handleError)
    .then(() => {
      res.jsonp(poll);
    }, handleError);

  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * List of Polls x
 */
exports.list = function (req, res) {
  Poll.find()
    .sort('-created')
    .populate('category', 'name icon slug')
    .populate('user', 'displayName profileImageURL slug')
    .exec(function (err, polls) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(polls);
      }
    });
};

/**
 * Poll middleware
 */
exports.pollByID = function (req, res, next, id) {
  // if (!mongoose.Types.ObjectId.isValid(id)) {
  //   return res.status(400).send({
  //     message: 'Poll is invalid'
  //   });
  // }
  var query = { $or: [{ slug: id }] };
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    query.$or.push({ _id: id });
  }

  Poll.findOne(query)
    .populate('category', 'name icon slug')
    .populate('user', 'displayName profileImageURL slug')
    .exec(function (err, poll) {
      if (err) {
        return res.status(400).send({
          message: 'Poll is invalid'
        });
      } else if (!poll) {
        return res.status(404).send({
          message: 'No Poll with that identifier has been found'
        });
      }
      req.poll = poll;
      next();
    });
};

/**
 * Lấy danh sách poll cho màn hình polls.list
 */
exports.findPolls = function (req, res) {
  var page = req.params.page || 0;
  var userId = req.user ? req.user._id : undefined;
  Poll.find({ isPublic: true })
    .sort('-created')
    .populate('category', 'name icon slug')
    .populate('user', 'displayName profileImageURL slug')
    .skip(10 * page).limit(10).exec()
    .then(polls => {
      if (polls.length === 0) return res.jsonp(polls);
      var length = polls.length;
      var counter = 0;
      polls.forEach(function (instance, index, array) {
        array[index] = instance.toObject();
        get_full_by_pollId(array[index]._id, userId)
          .then(result => {
            array[index].opts = result.opts;
            array[index].votes = result.votes;
            array[index].voteopts = result.voteopts;
            array[index].follow = result.follow;
            array[index].reported = result.reported;
            array[index].bookmarked = result.bookmarked;
            if (++counter === length) {
              res.jsonp(polls);
            }
          })
          .catch(handleError);
      });
    }, handleError);
  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * Lấy danh sách poll nổi bật cho màn hình polls.list
 */
exports.findPopulars = function (req, res) {
  let rs = {};
  let sort = '-likeCnt';
  let limit = 10;
  get_polls_by_sort_and_limit(sort, limit)
    .then(result => {
      rs.likes = result || [];
      sort = '-voteCnt';
      return get_polls_by_sort_and_limit(sort, limit);
    })
    .then(result => {
      rs.votes = result || [];
      sort = '-cmtCnt';
      return get_polls_by_sort_and_limit(sort, limit);
    })
    .then(result => {
      rs.cmts = result || [];
      res.jsonp(rs);
    })
    .catch(handleError);


  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * Lấy thông tin của user hiện hành đối với poll cho màn hình polls.view
 */
exports.findOwners = function (req, res) {
  var userId = req.user ? req.user._id : undefined;
  var ip =
    req.headers['X-Forwarded-For'] ||
    req.headers['x-forwarded-for'] ||
    req.client.remoteAddress;
  var result = {};
  get_vote_by_pollId_and_userId(req.poll._id, userId, ip)
    .then(_result => {
      result.ownVote = _result || { poll: req.poll._id };
      return get_opts_by_voteId(result.ownVote._id);
    })
    .then(_result => {
      result.votedOpts = _.pluck(_result, '_id') || [];
      return get_follow_by_pollId(req.poll._id, userId);
    })
    .then(_result => {
      result.follow = _result || { poll: req.poll._id };
      return get_report_by_pollId(req.poll._id, userId);
    })
    .then(_result => {
      result.reported = (_result) ? true : false;
      return get_bookmark_by_pollId(req.poll._id, userId);
    })
    .then(_result => {
      result.bookmarked = (_result) ? true : false;
      return get_like_by_pollId_and_userId(req.poll._id, userId);
    })
    .then(_result => {
      result.like = _result || {};
      return get_view_by_pollId(req.poll._id, userId);
    })
    .then(_result => {
      result.view = _result || { poll: req.poll._id };
      res.jsonp(result);
    })
    .catch(err => {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};

/**
 * Load comment cho màn hình poll.view theo page
 */
exports.findCmts = function (req, res) {
  var userId = req.user ? req.user._id : undefined;
  var page = req.params.page || 0;
  var sort = req.params.sort || '-created';
  Cmt.find({ poll: req.poll._id })
    .sort(sort)
    .populate('user', 'displayName profileImageURL slug')
    .skip(10 * page)
    .limit(10).exec()
    .then(cmts => {
      if (cmts.length === 0) return res.jsonp(cmts);
      var length = cmts.length;
      var counter = 0;
      cmts.forEach(function (instance, index, array) {
        array[index] = instance.toObject();
        get_like_by_cmtId_and_userId(array[index]._id, userId)
          .then(result => {
            array[index].like = result || {};
            if (++counter === length) {
              res.jsonp(cmts);
            }
          })
          .catch(handleError);
      });
    }, handleError);
  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * Lấy toàn bộ thông tin các vote và các opt của vote (polls.view)
 */
exports.findVoteopts = function (req, res) {
  get_votes_by_pollId(req.poll._id)
    .then(result => {
      res.jsonp(result);
    })
    .catch(handleError);
  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

exports.removeBookmark = function (req, res) {
  Bookmark.findOne({
    poll: req.poll._id,
    user: req.user._id
  }).remove().exec((err, result) => {
    if (err) {
      handleError(err);
    } else {
      res.jsonp(result);
    }
  });
  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

exports.search = function (req, res) {
  const condition = req.body.condition;
  var search = search_condition_analysis(condition);
  var userId = req.user ? req.user._id : undefined;
  var sort = condition.sort || '-created';
  Poll.find(search)
    .populate('category', 'name icon slug')
    .populate('user', 'displayName profileImageURL slug')
    .sort(sort).exec()
    .then(polls => {
      if (polls.length === 0) return res.jsonp(polls);
      var length = polls.length;
      var counter = 0;
      polls.forEach(function (instance, index, array) {
        array[index] = instance.toObject();
        get_full_by_pollId(array[index]._id, userId)
          .then(result => {
            array[index].opts = result.opts;
            array[index].votes = result.votes;
            array[index].voteopts = result.voteopts;
            array[index].follow = result.follow;
            array[index].reported = result.reported;
            array[index].bookmarked = result.bookmarked;
            if (++counter === length) {
              polls = _filter_key(polls, condition);
              res.jsonp(polls);
            }
          })
          .catch(handleError);
      });
    }, handleError);

  function _filter_key(polls, con) {

    var result = [];
    if (con.key && con.in === 'options') {
      polls.forEach(item => {
        if (item.title.indexOf(con.key) >= 0) return result.push(item);
        if (item.body.indexOf(con.key) >= 0) return result.push(item);
        var check = false;
        for (let index = 0; index < item.opts.length; index++) {
          let element = item.opts[index];
          if (element.title.indexOf(con.key) >= 0 || element.body.indexOf(con.key) >= 0) {
            check = true;
            break;
          }
        }
        if (check) return result.push(item);
      });
    } else {
      result = polls;
    }
    return result;
  }
  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

exports.countUpView = function (req, res) {
  Poll.countUpView(req.poll._id);
  res.end();
};

/**
 * Update profile picture
 */
exports.images_upload = function (req, res) {
  var user = req.user;
  var message = null;
  var upload = multer(config.uploads.imagesUpload).single('imagesUpload');
  var imagesUploadFileFilter = require(path.resolve('./config/lib/multer')).imagesUploadFileFilter;

  // Filtering to upload only images
  upload.fileFilter = imagesUploadFileFilter;

  if (user) {
    upload(req, res, function (uploadError) {
      if (uploadError) {
        return res.status(400).send({
          message: 'Error occurred while uploading images'
        });
      } else {
        res.jsonp(req.file.path);
      }
    });
  } else {
    res.status(400).send({
      message: 'You are not authorized.'
    });
  }
};

// Phan tich dieu kien search
function search_condition_analysis(condition) {
  var search = {};
  var and_arr = [];
  and_arr.push({ isPublic: true });
  // Search by user
  if (condition.by) {
    and_arr.push({ user: condition.by });
  }
  if (condition.ctgr) {
    and_arr.push({ category: condition.ctgr });
  }
  if (condition.created_start) {
    let start = new _moment(condition.created_start).utc().startOf('day');
    and_arr.push({ created: { $gte: start } });
  }
  if (condition.created_end) {
    let end = new _moment(condition.created_end).utc().startOf('day');
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
  if (condition.status) {
    let now = new _moment().utc().fomart();
    if (condition.status === 'opening') {
      and_arr.push({ $or: [{ close: { $exists: false } }, { close: null }, { close: { $gte: now } }] });
    } else {
      and_arr.push({ $and: [{ close: { $exists: true } }, { close: { $ne: null } }, { close: { $lt: now } }] });
    }
  }
  // Search by key in title
  if (condition.key && condition.key) {
    if (!condition.in || condition.in === 'title') {
      and_arr.push({ title: { $regex: '.*' + condition.key + '.*' } });
    } else if (condition.in === 'content') {
      and_arr.push({ $or: [{ title: { $regex: '.*' + condition.key + '.*' } }, { body: { $regex: '.*' + condition.key + '.*' } }] });
    }
  }
  search = { $and: and_arr };
  return search;
}
// Lấy các option có status = 1 cho poll
function get_opts_by_pollId(pollId) {
  return new Promise((resolve, reject) => {
    Opt.find({ poll: pollId })
      .populate('user', 'displayName profileImageURL slug')
      .exec((err, opts) => {
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
    Cmt.find({ poll: pollId })
      .populate('user', 'displayName profileImageURL slug')
      .exec((err, cmts) => {
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
// Lấy full info của poll và các thông tin của user hiện hành với poll
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

function get_polls_by_sort_and_limit(sort, limit) {
  return new Promise((resolve, reject) => {
    Poll.find({ isPublic: true })
      .sort(sort)
      .populate('user', 'displayName profileImageURL slug')
      .limit(limit)
      .exec(function (err, polls) {
        if (err) {
          return reject(err);
        } else {
          return resolve(polls);
        }
      });
  });
}
exports.get_full_by_pollId = get_full_by_pollId;
exports.get_opts_by_pollId = get_opts_by_pollId;
exports.get_cmts_by_pollId = get_cmts_by_pollId;
exports.get_votes_by_pollId = get_votes_by_pollId;
exports.get_follow_by_pollId = get_follow_by_pollId;
exports.get_report_by_pollId = get_report_by_pollId;
exports.get_bookmark_by_pollId = get_bookmark_by_pollId;
exports.get_like_by_cmtId_and_userId = get_like_by_cmtId_and_userId;
exports.get_opts_by_voteId = get_opts_by_voteId;
