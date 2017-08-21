'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Opt = mongoose.model('Opt'),
  Voteopt = mongoose.model('Voteopt'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Opt
 */
exports.create = function(req, res) {
  var opt = new Opt(req.body);
  opt.user = req.user;

  opt.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(opt);
    }
  });
};

/**
 * Show the current Opt
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var opt = req.opt ? req.opt.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  opt.isCurrentUserOwner = req.user && opt.user && opt.user._id.toString() === req.user._id.toString();

  res.jsonp(opt);
};

/**
 * Update a Opt
 */
exports.update = function(req, res) {
  var opt = req.opt;

  opt = _.extend(opt, req.body);

  opt.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(opt);
    }
  });
};

/**
 * Delete an Opt
 */
exports.delete = function(req, res) {
  var opt = req.opt;

  opt.remove()
    .then(() => {
      return Voteopt.remove({ opt: opt._id });
    }, handleError)
    .then(() => {
      res.jsonp(opt);
    }, handleError);

  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * List of Opts
 */
exports.list = function(req, res) {
  Opt.find().sort('-created').populate('user', 'displayName slug').exec(function(err, opts) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(opts);
    }
  });
};

/**
 * Opt middleware
 */
exports.optByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Opt is invalid'
    });
  }

  Opt.findById(id).populate('user', 'displayName slug').exec(function(err, opt) {
    if (err) {
      return next(err);
    } else if (!opt) {
      return res.status(404).send({
        message: 'No Opt with that identifier has been found'
      });
    }
    req.opt = opt;
    next();
  });
};
