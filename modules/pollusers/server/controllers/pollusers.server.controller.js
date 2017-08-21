'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Polluser = mongoose.model('Polluser'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Polluser
 */
exports.create = function(req, res) {
  var polluser = new Polluser(req.body);
  polluser.user = req.user;

  polluser.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(polluser);
    }
  });
};

/**
 * Show the current Polluser
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var polluser = req.polluser ? req.polluser.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  polluser.isCurrentUserOwner = req.user && polluser.user && polluser.user._id.toString() === req.user._id.toString();

  res.jsonp(polluser);
};

/**
 * Update a Polluser
 */
exports.update = function(req, res) {
  var polluser = req.polluser;

  polluser = _.extend(polluser, req.body);

  polluser.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(polluser);
    }
  });
};

/**
 * Delete an Polluser
 */
exports.delete = function(req, res) {
  var polluser = req.polluser;

  polluser.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(polluser);
    }
  });
};

/**
 * List of Pollusers
 */
exports.list = function(req, res) {
  Polluser.find().sort('-created').populate('user', 'displayName slug').exec(function(err, pollusers) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(pollusers);
    }
  });
};

/**
 * Polluser middleware
 */
exports.polluserByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Polluser is invalid'
    });
  }

  Polluser.findById(id).populate('user', 'displayName slug').exec(function (err, polluser) {
    if (err) {
      return next(err);
    } else if (!polluser) {
      return res.status(404).send({
        message: 'No Polluser with that identifier has been found'
      });
    }
    req.polluser = polluser;
    next();
  });
};
