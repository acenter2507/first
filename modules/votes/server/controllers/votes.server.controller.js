'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Vote = mongoose.model('Vote'),
  Voteopt = mongoose.model('Voteopt'),
  Poll = mongoose.model('Poll'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Vote
 */
exports.create = function (req, res) {
  var vote = new Vote(req.body);
  if (req.user) {
    vote.user = req.user;
    vote.guest = false;
  } else {
    vote.ip = req.headers["X-Forwarded-For"] || req.headers["x-forwarded-for"] || req.client.remoteAddress;
    vote.guest = true;
  }
  const opts = req.body.opts;
  var promises = [];
  vote.save()
    // Resul of save vote
    .then(_vote => {
      vote = _vote;
      opts.forEach(opt => {
        var voteopt = new Voteopt({ opt: opt, vote: _vote._id });
        promises.push(voteopt.save());
      });
      return Promise.all(promises);
    }, handleError)
    // Resul of save Voteopt
    .then(() => {
      var pollId = vote.poll._id || vote.poll;
      return Poll.countUpVote(pollId);
    }, handleError)
    .then(() => {
      promises = [];
      res.jsonp(vote);
    }, handleError);

  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * Show the current Vote
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var vote = req.vote ? req.vote.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  vote.isCurrentUserOwner = req.user && vote.user && vote.user._id.toString() === req.user._id.toString();

  res.jsonp(vote);
};

/**
 * Update a Vote
 */
exports.update = function (req, res) {
  var vote = req.vote;

  vote = _.extend(vote, req.body);
  const opts = req.body.opts;
  var promises = [];

  vote.save()
    .then(_vote => {
      vote = _vote;
      return Voteopt.remove({ vote: vote._id });
    }, handleError)
    .then(() => {
      opts.forEach(opt => {
        var voteopt = new Voteopt({ opt: opt, vote: vote._id });
        promises.push(voteopt.save());
      });
      return Promise.all(promises);
    }, handleError)
    .then(_tags => {
      promises = [];
      res.jsonp(vote);
    }, handleError);

  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * Delete an Vote
 */
exports.delete = function (req, res) {
  var vote = req.vote;

  vote.remove()
    .then(() => {
      return Voteopt.remove({ vote: vote._id });
    }, handleError)
    .then(() => {
      res.jsonp(vote);
    }, handleError);

  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * List of Votes
 */
exports.list = function (req, res) {
  Vote.find().sort('-created').populate('poll').populate('user', 'displayName').exec(function (err, votes) {
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
 * Vote middleware
 */
exports.voteByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Vote is invalid'
    });
  }

  Vote.findById(id).populate('user', 'displayName').exec(function (err, vote) {
    if (err) {
      return next(err);
    } else if (!vote) {
      return res.status(404).send({
        message: 'No Vote with that identifier has been found'
      });
    }
    req.vote = vote;
    next();
  });
};
