'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Poll = mongoose.model('Poll'),
  Opt = mongoose.model('Opt'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Poll
 */
exports.create = function(req, res) {
  var poll = new Poll(req.body);
  poll.user = req.user;

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
 * Show the current Poll
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var poll = req.poll ? req.poll.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  poll.isCurrentUserOwner = req.user && poll.user && poll.user._id.toString() === req.user._id.toString();

  res.jsonp(poll);
};

/**
 * Update a Poll
 */
exports.update = function(req, res) {
  var poll = req.poll;

  poll = _.extend(poll, req.body);

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
 * List of Polls
 */
exports.opts = function(req, res) {
  console.log("1");
  Opt.find().where('poll').gt(req.pollId).sort('-created').populate('user', 'displayName').exec(function(err, opts) {
    if (err) {
      console.log("2");
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      console.log("3");
      res.jsonp(opts);
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
