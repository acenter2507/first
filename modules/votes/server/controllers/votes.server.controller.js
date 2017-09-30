'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  logger = require(path.resolve('./config/lib/logger')).log4jLog,
  Vote = mongoose.model('Vote'),
  Poll = mongoose.model('Poll'),
  User = mongoose.model('User'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Vote
 */
exports.create = function (req, res) {
  var vote = new Vote(req.body);
  if (req.user) {
    vote.user = req.user._id;
    vote.guest = false;
  } else {
    vote.ip = getClientIp(req);
    vote.guest = true;
  }
  vote.save()
    .then(_vote => {
      let pollId = vote.poll._id || vote.poll;
      return Poll.countUpVote(pollId);
    }, handleError)
    .then(() => {
      let userId = vote.user._id || vote.user;
      return User.countUpVote(req.user._id);
    }, handleError)
    .then(() => {
      res.jsonp(vote);
    }, handleError);
  // let opts = req.body.opts;
  // var promises = [];
  // vote.save()
  //   .then(_vote => {
  //     vote = _vote;
  //     opts.forEach(opt => {
  //       var voteopt = new Voteopt({ opt: opt, vote: _vote._id });
  //       promises.push(voteopt.save());
  //     });
  //     return Promise.all(promises);
  //   }, handleError)
  //   // Resul of save Voteopt
  //   .then(() => {
  //     let pollId = vote.poll._id || vote.poll;
  //     return Poll.countUpVote(pollId);
  //   }, handleError)
  //   .then(() => {
  //     let userId = vote.user._id || vote.user;
  //     return User.countUpVote(req.user._id);
  //   }, handleError)
  //   .then(() => {
  //     promises = [];
  //     res.jsonp(vote);
  //   }, handleError);


  function handleError(err) {
    // Xuất bug ra file log
    logger.system.error('votes.server.controller.js - create', err);
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

  // Add a custom field to the Article, for determining if the current User is the 'owner'.
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

  vote.save()
    .then(_vote => {
      res.jsonp(_vote);
    }, handleError);

  function handleError(err) {
    // Xuất bug ra file log
    logger.system.error('votes.server.controller.js - update', err);
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
      let pollId = vote.poll._id || vote.poll;
      return Poll.countDownVote(pollId);
    }, handleError)
    .then(() => {
      let userId = vote.user._id || vote.user;
      return User.countDownVote(userId);
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
  Vote.find().sort('-created').populate('poll').populate('user', 'displayName slug').exec(function (err, votes) {
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

  Vote.findById(id).populate('user', 'displayName slug').exec(function (err, vote) {
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

function getClientIp(req) {
  var ipAddress;
  // Amazon EC2 / Heroku workaround to get real client IP
  var forwardedIpsStr = req.header('x-forwarded-for') || req.headers['X-Forwarded-For'] || req.headers['x-forwarded-for'] || req.client.remoteAddress;
  if (forwardedIpsStr) {
    // 'x-forwarded-for' header may return multiple IP addresses in
    // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
    // the first one
    var forwardedIps = forwardedIpsStr.split(',');
    ipAddress = forwardedIps[0];
  }
  if (!ipAddress) {
    // Ensure getting client IP address still works in
    // development environment
    ipAddress = req.connection.remoteAddress;
  }
  return ipAddress;
}