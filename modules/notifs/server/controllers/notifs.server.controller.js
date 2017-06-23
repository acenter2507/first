'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Notif = mongoose.model('Notif'),
  errorHandler = require(path.resolve(
    './modules/core/server/controllers/errors.server.controller'
  )),
  _ = require('lodash');

/**
 * Create a Notif
 */
exports.create = function(req, res) {
  var notif = new Notif(req.body);
  notif.user = req.user;

  notif.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(notif);
    }
  });
};

/**
 * Show the current Notif
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var notif = req.notif ? req.notif.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  notif.isCurrentUserOwner =
    req.user &&
    notif.user &&
    notif.user._id.toString() === req.user._id.toString();

  res.jsonp(notif);
};

/**
 * Update a Notif
 */
exports.update = function(req, res) {
  var notif = req.notif;

  notif = _.extend(notif, req.body);

  notif.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(notif);
    }
  });
};

/**
 * Delete an Notif
 */
exports.delete = function(req, res) {
  var notif = req.notif;

  notif.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(notif);
    }
  });
};

/**
 * List of Notifs
 */
exports.list = function(req, res) {
  Notif.find({ to: req.user._id })
    .sort('-created')
    .populate('poll', 'title')
    .populate('from', 'displayName profileImageURL')
    .populate('to', 'displayName profileImageURL')
    .exec(function(err, notifs) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(notifs);
      }
    });
};

/**
 * Count uncheck notifs
 */
exports.countUnchecks = function(req, res) {
  Notif.find({ to: req.user._id }).count(function(err, count) {
    res.jsonp(count);
  });
};

exports.findNotifs = function(req, res) {
  var limit = parseInt(req.params.limit);
  console.log('limit', limit);
  Notif.find({ to: req.user._id })
    .sort('-created')
    .limit(limit)
    .populate('poll', 'title')
    .populate('from', 'displayName profileImageURL')
    .populate('to', 'displayName profileImageURL')
    .exec(function(err, notifs) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(notifs);
      }
    });
};

/**
 * Notif middleware
 */
exports.notifByID = function(req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Notif is invalid'
    });
  }

  Notif.findById(id).populate('user', 'displayName').exec(function(err, notif) {
    if (err) {
      return next(err);
    } else if (!notif) {
      return res.status(404).send({
        message: 'No Notif with that identifier has been found'
      });
    }
    req.notif = notif;
    next();
  });
};
