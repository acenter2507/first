'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Poll = mongoose.model('Poll'),
  Opt = mongoose.model('Opt'),
  Vote = mongoose.model('Vote'),
  Voteopt = mongoose.model('Voteopt'),
  Polltag = mongoose.model('Polltag'),
  Pollreport = mongoose.model('Pollreport'),
  Userreport = mongoose.model('Userreport'),
  Polluser = mongoose.model('Polluser'),
  Report = mongoose.model('Report'),
  Bookmark = mongoose.model('Bookmark'),
  Like = mongoose.model('Like'),
  Cmt = mongoose.model('Cmt'),
  Cmtlike = mongoose.model('Cmtlike'),
  View = mongoose.model('View'),
  errorHandler = require(path.resolve(
    './modules/core/server/controllers/errors.server.controller'
  )),
  _ = require('lodash'),
  __ = require('underscore');
/**
 * Create a Poll
 */
exports.create = function (req, res) {
  var poll = new Poll(req.body);
  poll.user = req.user;

  var tags = req.body.tags || [];
  var opts = req.body.opts || [];
  var promises = [];

  poll
    .save()
    .then(_poll => {
      poll = _poll;
      // Tạo report cho poll
      var report = new Pollreport({ poll: poll._id });
      return report.save();
    }, handleError)
    .then(_report => {
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

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  poll.isCurrentUserOwner =
    req.user &&
    poll.user &&
    poll.user._id.toString() === req.user._id.toString();
  poll.canEdit =
    req.user &&
    req.user.roles &&
    req.user.roles.length &&
    req.user.roles.indexOf('admin') > -1;

  res.jsonp(poll);
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
  poll
    .save()
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
            Opt.update(
              {
                _id: opt._id
              },
              {
                $set: {
                  title: opt.title,
                  color: opt.color,
                  body: opt.body
                }
              }
            ).exec()
          );
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
    .then(() => { // Xóa thông tin report của poll
      return Pollreport.remove({ poll: poll._id });
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
 * List of Polls
 */
exports.list = function (req, res) {
  Poll.find()
    .sort('-created')
    .populate('category', 'name icon')
    .populate('user', 'displayName profileImageURL')
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
 * Lấy danh sách poll cho màn hình polls.list
 */
exports.findPolls = function (req, res) {
  var page = req.params.page || 0;
  var userId = req.user ? req.user._id : undefined;
  Poll.find({ isPublic: true })
    .sort('-created')
    .populate('category', 'name icon')
    .populate('user', 'displayName profileImageURL')
    .skip(10 * page).limit(10).exec()
    .then(polls => {
      if (polls.length === 0) return res.jsonp(polls);
      var length = polls.length;
      var counter = 0;
      polls.forEach(function (instance, index, array) {
        array[index] = instance.toObject();
        // Lấy thông tin count
        get_info_by_pollId(array[index]._id)
          .then(result => {
            array[index].report = result || {};
            return get_opts_by_pollId(array[index]._id);
          })
          // Lấy các options
          .then(result => {
            array[index].opts = result || [];
            return get_votes_by_pollId(array[index]._id);
          })
          // Lấy toàn bộ thông tin votes
          .then(result => {
            array[index].votes = result.votes || [];
            array[index].voteopts = result.voteopts || [];
            return get_follow_by_pollId(array[index]._id, userId);
          })
          // Lấy follow của user hiện hành
          .then(result => {
            array[index].follow = result || { poll: array[index]._id };
            return get_report_by_pollId(array[index]._id, userId);
          })
          // Lấy report của user hiện hành
          .then(result => {
            array[index].reported = (result) ? true : false;
            return get_bookmark_by_pollId(array[index]._id, userId);
          })
          // Lấy bookmark của user hiện hành
          .then(result => {
            array[index].bookmarked = (result) ? true : false;
            if (++counter === length) {
              res.json(polls);
            }
          })
          .catch(err => {
            return handleError(err);
          });
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
exports.findHotPolls = function (req, res) {
  var page = req.params.page || 0;
  Poll.find({ isPublic: true })
    .sort('-likeCnt')
    .populate('category', 'name icon')
    .populate('user', 'displayName profileImageURL')
    .skip(10 * page)
    .limit(10)
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
 * List of Opts in poll
 */
exports.findOpts = function (req, res) {
  Poll.findOpts(req.poll._id)
    .populate('user', 'displayName')
    .exec(function (err, opts) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(opts);
      }
    });
};

/**
 * List of Cmts in poll
 */
exports.findCmts = function (req, res) {
  var page = req.params.page || 0;
  Poll.findCmts(req.poll._id)
    .sort('-created')
    .populate('user', 'displayName profileImageURL')
    .skip(10 * page)
    .limit(10)
    .exec(function (err, cmts) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(cmts);
      }
    });
};

/**
 * List of Tags in poll
 */
exports.findTags = function (req, res) {
  Poll.findTags(req.poll._id).populate('tag').exec(function (err, polltags) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(polltags);
    }
  });
};

/**
 * List of Votes in poll
 */
exports.findVotes = function (req, res) {
  Poll.findVotes(req.poll._id).exec(function (err, votes) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(votes);
    }
  });
};

/**
 * Vote in poll of user
 */
exports.findOwnerVote = function (req, res) {
  var condition = {};
  condition.poll = req.poll._id;
  if (req.user) {
    condition.user = req.user._id;
    condition.guest = false;
  } else {
    condition.ip =
      req.headers['X-Forwarded-For'] ||
      req.headers['x-forwarded-for'] ||
      req.client.remoteAddress;
    condition.guest = true;
  }
  Poll.findOwnerVote(condition).exec(function (err, vote) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(vote);
    }
  });
};

/**
 * Get all info of vote in poll
 */
exports.findVoteopts = function (req, res) {
  var rs = {}, ids;
  Poll.findVotes(req.poll._id).exec(function (err, _votes) {
    if (err) {
      handleError(err);
    } else {
      rs.votes = _votes;
      rs.voteopts = [];
      ids = _.pluck(_votes, '_id');
      Voteopt.find({ vote: { $in: ids } }).exec(function (err, opts) {
        if (err) {
          handleError(err);
        } else {
          rs.voteopts = opts;
          res.jsonp(rs);
        }
      });
    }
  });

  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * Get Like of user on this poll
 */
exports.findPollLike = function (req, res) {
  var condition = { poll: req.poll._id, user: req.user._id };
  Like.findOne(condition).exec(function (err, like) {
    if (err) {
      handleError(err);
    } else {
      res.jsonp(like);
    }
  });

  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * Find pollusers xxxx
 */
exports.findPolluser = function (req, res) {
  Polluser.findOne({
    poll: req.poll._id,
    user: req.user._id
  }).exec((err, _polluser) => {
    if (err) {
      handleError(err);
    } else {
      res.jsonp(_polluser);
    }
  });
  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * Find report xxxx
 */
exports.findReport = function (req, res) {
  Report.findOne({
    poll: req.poll._id,
    user: req.user._id
  }).exec((err, _report) => {
    if (err) {
      handleError(err);
    } else {
      var result = _report ? true : false;
      res.jsonp(result);
    }
  });
  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * Find Bookmark xxxx
 */
exports.findBookmark = function (req, res) {
  Bookmark.findOne({
    poll: req.poll._id,
    user: req.user._id
  }).exec((err, _bookmark) => {
    if (err) {
      handleError(err);
    } else {
      var result = _bookmark ? true : false;
      res.jsonp(result);
    }
  });
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

/**
 * Find report xxxx
 */
exports.findPollreport = function (req, res) {
  Pollreport.findOne({ poll: req.poll._id }).exec((err, _report) => {
    if (err) {
      handleError(err);
    } else {
      res.jsonp(_report);
    }
  });
  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * Find view
 */
exports.findView = function (req, res) {
  View.findOne({
    poll: req.poll._id,
    user: req.user._id
  }).exec((err, _view) => {
    if (err) {
      handleError(err);
    } else {
      res.jsonp(_view);
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
  var search = {};
  var and_arr = [];
  and_arr.push({ isPublic: true });
  // Search by category
  if (condition.ctgr) {
    and_arr.push({ category: condition.ctgr });
  }
  // Search by status
  if (condition.status) {
    if (condition.status === 'opening') {
      and_arr.push({ $or: [{ close: { $exists: false } }, { close: { $gte: new Date() } }] });
    } else {
      and_arr.push({ $and: [{ close: { $exists: true } }, { close: { $lt: new Date() } }] });
    }
  }
  // Search by user
  if (condition.by) {
    and_arr.push({ user: condition.by });
  }
  // Search by created time
  if (condition.created) {
    var today = new Date().getTime();
    var created = new Date(today - (parseInt(condition.created) * 1000));
    if (condition.timing === 'old') {
      and_arr.push({ created: { $lt: created } });
    } else {
      and_arr.push({ created: { $gte: created } });
    }
  }
  // Search by key in title
  if (condition.key) {
    if (!condition.in || condition.in === 'polltitle') {
      and_arr.push({ title: { $regex: '.*' + condition.key + '.*' } });
    }
  }
  if (and_arr.length > 0) {
    search = { $and: and_arr };
  }
  var polls = [];
  _polls(search)
    .then(_polls => {
      var promise = [];
      _polls.forEach(poll => {
        promise.push(_poll_report(poll));
      });
      return Promise.all(promise);
    })
    .then(_polls => {
      var result = [];
      if (condition.cmt && parseInt(condition.cmt)) {
        var cmtCnt = parseInt(condition.cmt);
        _polls.forEach(item => {
          if (condition.compare === 'most') {
            if (item.report.cmtCnt >= cmtCnt) {
              result.push(item);
            }
          } else {
            if (item.report.cmtCnt < cmtCnt) {
              result.push(item);
            }
          }
        });
      } else {
        result = _polls;
      }
      return new Promise((resolve, reject) => {
        return resolve(result);
      });
    })
    .then(_polls => {
      var promise = [];
      _polls.forEach(poll => {
        promise.push(_poll_opts(poll));
      });
      return Promise.all(promise);
    })
    .then(_polls => {
      var promise = [];
      _polls.forEach(poll => {
        promise.push(_poll_cmts(poll));
      });
      return Promise.all(promise);
    })
    .then(_polls => {
      var result = [];
      if (condition.key && condition.in === 'pollcontent') {
        _polls.forEach(item => {
          if (item.poll.title.indexOf(condition.key) >= 0) return result.push(item);
          if (item.poll.body.indexOf(condition.key) >= 0) return result.push(item);
          var check = false;
          for (let index = 0; index < item.opts.length; index++) {
            let element = item.opts[index];
            if (element.title.indexOf(condition.key) >= 0 || element.body.indexOf(condition.key) >= 0) {
              check = true;
              break;
            }
          }
          if (check) return result.push(item);
        });
      } else if (condition.key && condition.in === 'pollcmt') {
        _polls.forEach(item => {
          if (item.poll.title.indexOf(condition.key) >= 0) return result.push(item);
          if (item.poll.body.indexOf(condition.key) >= 0) return result.push(item);
          var check = false;
          for (let index = 0; index < item.opts.length; index++) {
            let element = item.opts[index];
            if (element.title.indexOf(condition.key) >= 0 || element.body.indexOf(condition.key) >= 0) {
              check = true;
              break;
            }
          }
          if (check) return result.push(item);
          for (let index = 0; index < item.cmts.length; index++) {
            let element = item.cmts[index];
            if (element.body.indexOf(condition.key) >= 0) {
              check = true;
              break;
            }
          }
          if (check) return result.push(item);
        });
      } else {
        result = _polls;
      }
      res.jsonp(result);
    })
    .catch(err => {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });

  function _polls(con) {
    return new Promise((resolve, reject) => {
      Poll.find(con)
        .populate('category', 'name icon')
        .populate('user', 'displayName profileImageURL')
        .exec((err, polls) => {
          if (err) {
            return reject(err);
          } else {
            return resolve(polls);
          }
        });
    });
  }

  function _poll_report(poll) {
    return new Promise((resolve, reject) => {
      Pollreport.findOne({ poll: poll._id }).exec((err, _report) => {
        if (err) {
          return reject(err);
        } else {
          return resolve({ poll: poll, report: _report });
        }
      });
    });
  }
  function _poll_opts(poll) {
    return new Promise((resolve, reject) => {
      Opt.find({ poll: poll.poll._id, status: 1 }).exec((err, opts) => {
        if (err) {
          return reject(err);
        } else {
          return resolve({ poll: poll.poll, report: poll.report, opts: opts });
        }
      });
    });
  }
  function _poll_cmts(poll) {
    return new Promise((resolve, reject) => {
      Cmt.find({ poll: poll.poll._id }).exec((err, cmts) => {
        if (err) {
          return reject(err);
        } else {
          return resolve({ poll: poll.poll, report: poll.report, opts: poll.opts, cmts: cmts });
        }
      });
    });
  }
  function _filter_cmt(polls, condition) {
    return new Promise((resolve, reject) => {
      if (!condition.cmt) return resolve(polls);
      const cmtCnt = parseInt(condition.cmt);
      if (!cmtCnt) return resolve(polls);
      var con = {};
      var ids = _.pluck(polls, '_id');
      con.poll = { $in: ids };
      if (condition.compare === 'most') {
        con.cmtCnt = { $gte: cmtCnt };
      } else {
        con.cmtCnt = { $lt: cmtCnt };
      }
      Pollreport.find(con).exec((err, _reports) => {
        if (err) {
          return reject(err);
        } else {
          var pollIds = [];
          _reports.forEach(report => {
            pollIds.push(report.poll.toString());
          });
          var new_polls = [];
          polls.forEach(poll => {
            if (__.contains(pollIds, poll._id.toString())) {
              new_polls.push(poll);
            }
          });
          return resolve(new_polls);
        }
      });
    });
  }

  function _filter_key(polls, condition) {
    return new Promise((resolve, reject) => {
      if (polls.length === 0) return resolve(polls);
      polls.forEach(item => {

      });
    });
  }
};

/**
 * Poll middleware
 */
exports.pollByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Poll is invalid'
    });
  }

  Poll.findById(id)
    .populate('category', 'name icon')
    .populate('user', 'displayName profileImageURL')
    .exec(function (err, poll) {
      if (err) {
        return next(err);
      } else if (!poll) {
        return res.status(404).send({
          message: 'No Poll with that identifier has been found'
        });
      }
      req.poll = poll;
      next();
    });
};

function temp() {
  return new Promise((resolve, reject) => { });
}
// Lấy các report của poll
function get_info_by_pollId(pollId) {
  return new Promise((resolve, reject) => {
    Pollreport.findOne({ poll: pollId }).exec((err, report) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(report);
      }
    });
  });
}
// Lấy các option có status = 1 cho poll
function get_opts_by_pollId(pollId) {
  return new Promise((resolve, reject) => {
    Opt.find({ poll: pollId, status: 1 }).exec((err, opts) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(opts);
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
