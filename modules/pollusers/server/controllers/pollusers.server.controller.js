'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Follow = mongoose.model('Follow'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('underscore');

/**
 * Create a follow
 */
exports.create = function(req, res) {
  var follow = new Follow(req.body);
  follow.user = req.user;

  follow.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(follow);
    }
  });
};

/**
 * Show the current Follow
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var follow = req.follow ? req.follow.toJSON() : {};
  follow.isCurrentUserOwner = req.user && follow.user && follow.user._id.toString() === req.user._id.toString();
  res.jsonp(follow);
};

/**
 * Update a follow
 */
exports.update = function(req, res) {
  var follow = req.follow;

  follow = _.extend(follow, req.body);

  follow.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(follow);
    }
  });
};

/**
 * Delete an follow
 */
exports.delete = function(req, res) {
  var follow = req.follow;

  follow.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(follow);
    }
  });
};

/**
 * List of follows
 */
exports.list = function(req, res) {
  Follow.find().sort('-created').populate('user', 'displayName slug').exec(function(err, follows) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(follows);
    }
  });
};

/**
 * Follow middleware
 */
exports.followByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Follow is invalid'
    });
  }

  Follow.findById(id).populate('user', 'displayName slug').exec(function (err, follow) {
    if (err) {
      return next(err);
    } else if (!follow) {
      return res.status(404).send({
        message: 'No Follow with that identifier has been found'
      });
    }
    req.follow = follow;
    next();
  });
};
