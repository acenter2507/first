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
  Polluser = mongoose.model('Polluser'),
  Like = mongoose.model('Like'),
  errorHandler = require(path.resolve(
    './modules/core/server/controllers/errors.server.controller'
  )),
  _ = require('lodash');

/**
 * Create a Poll
 */
exports.create = function(req, res) {
  var poll = new Poll(req.body);
  poll.user = req.user;

  var tags = req.body.tags;
  var opts = req.body.opts;
  var promises = [];
  poll
    .save()
    .then(_poll => {
      poll = _poll;
      tags.forEach(tag => {
        var polltag = new Polltag();
        polltag.tag = tag;
        polltag.poll = _poll;
        promises.push(polltag.save());
      });
      return Promise.all(promises);
    }, handleError)
    .then(() => {
      promises = [];
      opts.forEach(opt => {
        var _opt = new Opt(opt);
        _opt.user = req.user;
        _opt.poll = poll;
        promises.push(_opt.save());
      });
      return Promise.all(promises);
    }, handleError)
    .then(() => {
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
exports.read = function(req, res) {
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
exports.update = function(req, res) {
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
        var polltag = new Polltag();
        polltag.tag = tag;
        polltag.poll = poll;
        promises.push(polltag.save());
      });
      return Promise.all(promises);
    }, handleError)
    .then(() => {
      promises = [];
      opts.forEach(opt => {
        if (opt._id) {
          promises.push(() => {
            Opt.findById(opt._id).exec((err, _opt) => {
              _opt = _.extend(_opt, opt);
              return _opt.save();
            });
          });
        } else {
          var _opt = new Opt(opt);
          _opt.user = req.user;
          _opt.poll = poll;
          promises.push(_opt.save());
        }
      });
      return Promise.all(promises);
    }, handleError)
    .then(() => {
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
exports.delete = function(req, res) {
  var poll = req.poll;
  poll
    .remove()
    .then(() => {
      return Opt.remove({ poll: poll._id });
    }, handleError)
    .then(() => {
      return Vote.remove({ poll: poll._id });
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
exports.list = function(req, res) {
  Poll.find()
    .sort('-created')
    .populate('user', 'displayName profileImageURL')
    .exec(function(err, polls) {
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
exports.findPolls = function(req, res) {
  var offset = req.params.offset || 0;
  if (parseInt(offset) === 0) {
    Poll.find()
      .sort('-created')
      .populate('user', 'displayName profileImageURL')
      .limit(10)
      .exec(function(err, polls) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.jsonp(polls);
        }
      });
  } else {
    Poll.find()
      .sort('-created')
      .populate('user', 'displayName profileImageURL')
      .skip(parseInt(offset))
      .limit(10)
      .exec(function(err, polls) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.jsonp(polls);
        }
      });
  }
};

/**
 * List of Opts in poll
 */
exports.findOpts = function(req, res) {
  Poll.findOpts(req.poll._id)
    .populate('user', 'displayName')
    .exec(function(err, opts) {
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
exports.findCmts = function(req, res) {
  Poll.findCmts(req.poll._id)
    .populate('user', 'displayName profileImageURL')
    .exec(function(err, cmts) {
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
exports.findTags = function(req, res) {
  Poll.findTags(req.poll._id).populate('tag').exec(function(err, polltags) {
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
exports.findVotes = function(req, res) {
  Poll.findVotes(req.poll._id).exec(function(err, votes) {
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
exports.findOwnerVote = function(req, res) {
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
  Poll.findOwnerVote(condition).exec(function(err, vote) {
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
exports.findVoteopts = function(req, res) {
  var rs = {}, ids;
  Poll.findVotes(req.poll._id).exec(function(err, _votes) {
    if (err) {
      handleError(err);
    } else {
      rs.votes = _votes;
      rs.voteopts = [];
      ids = _.pluck(_votes, '_id');
      Voteopt.find({ vote: { $in: ids } }).exec(function(err, opts) {
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
exports.findPollLike = function(req, res) {
  var condition = { poll: req.poll._id, user: req.user._id };
  Like.findOne(condition).exec(function(err, like) {
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
exports.findPolluser = function(req, res) {
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
 * Poll middleware
 */
exports.pollByID = function(req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Poll is invalid'
    });
  }

  Poll.findById(id)
    .populate('user', 'displayName profileImageURL')
    .exec(function(err, poll) {
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
