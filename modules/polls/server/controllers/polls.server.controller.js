'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Poll = mongoose.model('Poll'),
  Opt = mongoose.model('Opt'),
  Polltag = mongoose.model('Polltag'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Poll
 */
exports.create = function(req, res) {
  var poll = new Poll(req.body);
  poll.user = req.user;

  var tags = req.body.tags;
  var promises = [];
  poll.save()
    .then(_poll => {
      tags.forEach((tag) => {
        var polltag = new Polltag();
        polltag.tag = tag;
        polltag.poll = _poll;
        promises.push(polltag.save());
      });
      return Promise.all(promises);
    })
    .then(_tags => {
      promises = [];
      res.jsonp(poll);
    })
    .catch(err => {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};

/**
 * Show the current Poll
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var poll = req.poll ? req.poll.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  poll.isCurrentUserOwner = req.user && poll.user && poll.user._id.toString() === req.user._id.toString();
  poll.canEdit = req.user && req.user.roles && req.user.roles.length && req.user.roles.indexOf('admin') > -1;

  res.jsonp(poll);
};

/**
 * Update a Poll
 */
exports.update = function(req, res) {
  var poll = req.poll;

  poll = _.extend(poll, req.body);
  var tags = req.body.tags;
  var promises = [];
  poll.save()
    .then(_poll => {
      return Polltag.remove({ poll: _poll._id });
    })
    .then(() => {
      tags.forEach((tag) => {
        var polltag = new Polltag();
        polltag.tag = tag;
        polltag.poll = poll;
        promises.push(polltag.save());
      });
      return Promise.all(promises);
    })
    .then(_tags => {
      promises = [];
      res.jsonp(poll);
    })
    .catch(err => {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
  poll.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(poll);
    }
  });
};

/**
 * Delete an Poll
 */
exports.delete = function(req, res) {
  var poll = req.poll;

  poll.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(poll);
    }
  });
};

/**
 * List of Polls
 */
exports.list = function(req, res) {
  Poll.find().sort('-created').populate('user', 'displayName').exec(function(err, polls) {
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
exports.findOpts = function(req, res) {
  Poll.findOpts(req.poll._id).populate('user', 'displayName').exec(function(err, opts) {
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
 * List of Opts in poll
 */
exports.findCmts = function(req, res) {
  Poll.findCmts(req.poll._id).populate('user', 'displayName').exec(function(err, cmts) {
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
 * List of Opts in poll
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
 * Poll middleware
 */
exports.pollByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Poll is invalid'
    });
  }

  Poll.findById(id).populate('user', 'displayName').exec(function(err, poll) {
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
