'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Pollreport = mongoose.model('Pollreport'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Pollreport
 */
exports.create = function(req, res) {
  var pollreport = new Pollreport(req.body);
  pollreport.user = req.user;

  pollreport.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(pollreport);
    }
  });
};

/**
 * Show the current Pollreport
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var pollreport = req.pollreport ? req.pollreport.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  pollreport.isCurrentUserOwner = req.user && pollreport.user && pollreport.user._id.toString() === req.user._id.toString();

  res.jsonp(pollreport);
};

/**
 * Update a Pollreport
 */
exports.update = function(req, res) {
  var pollreport = req.pollreport;

  pollreport = _.extend(pollreport, req.body);

  pollreport.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(pollreport);
    }
  });
};

/**
 * Delete an Pollreport
 */
exports.delete = function(req, res) {
  var pollreport = req.pollreport;

  pollreport.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(pollreport);
    }
  });
};

/**
 * List of Pollreports
 */
exports.list = function(req, res) {
  Pollreport.find().sort('-created').populate('user', 'displayName').exec(function(err, pollreports) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(pollreports);
    }
  });
};

/**
 * Pollreport middleware
 */
exports.pollreportByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Pollreport is invalid'
    });
  }

  Pollreport.findById(id).populate('user', 'displayName').exec(function (err, pollreport) {
    if (err) {
      return next(err);
    } else if (!pollreport) {
      return res.status(404).send({
        message: 'No Pollreport with that identifier has been found'
      });
    }
    req.pollreport = pollreport;
    next();
  });
};
