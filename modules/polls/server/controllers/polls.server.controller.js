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
  _ = require('lodash');
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
 * List of Offset
 */
exports.findPolls = function (req, res) {
  var page = req.params.page || 0;
  Poll.find({ isPublic: true })
    .sort('-created')
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
 * List of Hot
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
 * Find pollusers
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
 * Find report
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
 * Find Bookmark
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
 * Find report
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
  console.log(condition);
  var search = {};
  var and_arr = [];
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
  search = { $and: and_arr };
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
      if (condition.cmt) {
        var cmtCnt = parseInt(condition.cmt);
        if (condition.compare === 'most') {
          polls = _.filter(_polls, poll => {
            return poll.cmtCnt >= cmtCnt;
          });
        } else {
          polls = _.filter(_polls, poll => {
            return poll.cmtCnt < cmtCnt;
          });
        }
      }
      res.jsonp(polls);
    })
    .catch(err => {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });

  function _polls(con) {
    return new Promise((resolve, reject) => {
      Poll.find(con).exec((err, polls) => {
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
          var oj = _.merge(poll, _report);
          return resolve(oj);
        }
      });
    });
  }

  function _filter_key(polls, condition) {
    return new Promise((resolve, reject) => {
      if (polls.length === 0) {
        return resolve(polls);
      }
    });
  }





  // if (condition.key) {
  //   if (!condition.in || condition.in === 'polltitle') {
  //     and_arr.push({ title: { $regex: '.*' + condition.key + '.*' } });
  //   } else if (condition.in === 'pollcontent') {
  //     and_arr.push({ $or: [{ title: { $regex: '.*' + condition.key + '.*' } }, { body: { $regex: '.*' + condition.key + '.*' } }] })
  //   } else if (condition.in === 'pollcmt') {
  //     and_arr.push({ $or: [{ title: { $regex: '.*' + condition.key + '.*' } }, { body: { $regex: '.*' + condition.key + '.*' } }] })
  //   }
  // }
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
