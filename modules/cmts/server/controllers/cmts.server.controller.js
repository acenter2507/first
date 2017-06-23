'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Cmt = mongoose.model('Cmt'),
  Poll = mongoose.model('Poll'),
  Cmtlike = mongoose.model('Cmtlike'),
  Polluser = mongoose.model('Polluser'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Cmt
 */
exports.create = function(req, res) {
  var cmt = new Cmt(req.body);
  cmt.user = req.user;

  cmt.save()
    .then(_cmt => {
      cmt = _cmt;
      return Poll.countUpCmt(_cmt.poll);
    }, handleError)
    .then(() => {
      Polluser.findOne({poll: cmt.poll, user: cmt.user}).exec((err, _polluser) => {
        if (!_polluser) {
          _polluser = new Polluser({poll: cmt.poll, user: cmt.user});
          return _polluser.save();
        }
      })
    }, handleError)
    .then(() => {
      res.jsonp(cmt);
    }, handleError);

  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * Show the current Cmt
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var cmt = req.cmt ? req.cmt.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  cmt.isCurrentUserOwner = req.user && cmt.user && cmt.user._id.toString() === req.user._id.toString();

  res.jsonp(cmt);
};

/**
 * Update a Cmt
 */
exports.update = function(req, res) {
  var cmt = req.cmt;

  cmt = _.extend(cmt, req.body);

  cmt.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(cmt);
    }
  });
};

/**
 * Delete an Cmt
 */
exports.delete = function(req, res) {
  var cmt = req.cmt;
  const pollId = cmt.poll._id;
  cmt.remove()
    .then(() => {
      return Poll.countDownCmt(pollId);
    }, handleError)
    .then(() => {
      res.jsonp(cmt);
    }, handleError);

  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * List of Cmts
 */
exports.list = function(req, res) {
  Cmt.find().sort('-created').populate('user', 'displayName profileImageURL').exec(function(err, cmts) {
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
 * Cmt middleware
 */
exports.cmtByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Cmt is invalid'
    });
  }

  Cmt.findById(id).populate('poll').populate('user', 'displayName profileImageURL').exec(function(err, cmt) {
    if (err) {
      return next(err);
    } else if (!cmt) {
      return res.status(404).send({
        message: 'No Cmt with that identifier has been found'
      });
    }
    req.cmt = cmt;
    next();
  });
};

/**
 * List of Cmts
 */
exports.findLike = function(req, res) {
  var condition = { cmt: req.cmt._id, user: req.user._id };
  Cmtlike.findOne(condition).exec(function(err, cmtlike) {
    if (err) {
      handleError(err);
    } else {
      res.jsonp(cmtlike);
    }
  });

  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};
