'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Voteopt = mongoose.model('Voteopt'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Voteopt
 */
exports.create = function(req, res) {
  var voteopt = new Voteopt(req.body);
  voteopt.user = req.user;

  voteopt.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(voteopt);
    }
  });
};

/**
 * Show the current Voteopt
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var voteopt = req.voteopt ? req.voteopt.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  voteopt.isCurrentUserOwner = req.user && voteopt.user && voteopt.user._id.toString() === req.user._id.toString();

  res.jsonp(voteopt);
};

/**
 * Update a Voteopt
 */
exports.update = function(req, res) {
  var voteopt = req.voteopt;

  voteopt = _.extend(voteopt, req.body);

  voteopt.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(voteopt);
    }
  });
};

/**
 * Delete an Voteopt
 */
exports.delete = function(req, res) {
  var voteopt = req.voteopt;

  voteopt.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(voteopt);
    }
  });
};

/**
 * List of Voteopts
 */
exports.list = function(req, res) {
  Voteopt.find().sort('-created').populate('user', 'displayName').exec(function(err, voteopts) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(voteopts);
    }
  });
};

/**
 * Voteopt middleware
 */
exports.voteoptByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Voteopt is invalid'
    });
  }

  Voteopt.findById(id).populate('user', 'displayName').exec(function (err, voteopt) {
    if (err) {
      return next(err);
    } else if (!voteopt) {
      return res.status(404).send({
        message: 'No Voteopt with that identifier has been found'
      });
    }
    req.voteopt = voteopt;
    next();
  });
};
