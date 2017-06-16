'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Polltag = mongoose.model('Polltag'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Polltag
 */
exports.create = function(req, res) {
  var polltag = new Polltag(req.body);
  polltag.user = req.user;

  polltag.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(polltag);
    }
  });
};

/**
 * Show the current Polltag
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var polltag = req.polltag ? req.polltag.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  polltag.canEdit = req.user && req.user.roles && req.user.roles.length && req.user.roles.indexOf('admin') > -1;

  res.jsonp(polltag);
};

/**
 * Update a Polltag
 */
exports.update = function(req, res) {
  var polltag = req.polltag;

  polltag = _.extend(polltag, req.body);

  polltag.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(polltag);
    }
  });
};

/**
 * Delete an Polltag
 */
exports.delete = function(req, res) {
  var polltag = req.polltag;

  polltag.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(polltag);
    }
  });
};

/**
 * List of Polltags
 */
exports.list = function(req, res) {
  Polltag.find().sort('-created').populate('user', 'displayName').exec(function(err, polltags) {
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
 * Polltag middleware
 */
exports.polltagByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Polltag is invalid'
    });
  }

  Polltag.findById(id).populate('poll').populate('tag').exec(function (err, polltag) {
    if (err) {
      return next(err);
    } else if (!polltag) {
      return res.status(404).send({
        message: 'No Polltag with that identifier has been found'
      });
    }
    req.polltag = polltag;
    next();
  });
};
