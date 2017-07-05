'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  View = mongoose.model('View'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a View
 */
exports.create = function(req, res) {
  var view = new View(req.body);
  view.user = req.user;

  view.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(view);
    }
  });
};

/**
 * Show the current View
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var view = req.view ? req.view.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  view.isCurrentUserOwner = req.user && view.user && view.user._id.toString() === req.user._id.toString();

  res.jsonp(view);
};

/**
 * Update a View
 */
exports.update = function(req, res) {
  var view = req.view;

  view = _.extend(view, req.body);

  view.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(view);
    }
  });
};

/**
 * Delete an View
 */
exports.delete = function(req, res) {
  var view = req.view;

  view.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(view);
    }
  });
};

/**
 * List of Views
 */
exports.list = function(req, res) {
  View.find().sort('-created').populate('user', 'displayName').exec(function(err, views) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(views);
    }
  });
};

/**
 * View middleware
 */
exports.viewByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'View is invalid'
    });
  }

  View.findById(id).populate('user', 'displayName').exec(function (err, view) {
    if (err) {
      return next(err);
    } else if (!view) {
      return res.status(404).send({
        message: 'No View with that identifier has been found'
      });
    }
    req.view = view;
    next();
  });
};
