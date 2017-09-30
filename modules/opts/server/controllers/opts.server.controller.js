'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Opt = mongoose.model('Opt'),
  User = mongoose.model('User'),
  Vote = mongoose.model('Vote'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('underscore');

/**
 * Create a Opt
 */
exports.create = function (req, res) {
  var opt = new Opt(req.body);
  opt.user = req.user;

  opt.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      if (opt.status === 2) {
        let userId = opt.user._id || opt.user;
        User.countUpSuggest(userId);
      }
      res.jsonp(opt);
    }
  });
};

/**
 * Show the current Opt
 */
exports.read = function (req, res) {
  res.jsonp(req.opt);
};

/**
 * Update a Opt
 */
exports.update = function (req, res) {
  var opt = req.opt;

  opt = _.extend(opt, req.body);

  opt.save(function (err) {
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
exports.delete = function (req, res) {
  var opt = req.opt;

  opt.remove()
    .then(() => {
      Vote.removeOption(opt._id);
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
exports.list = function (req, res) {
  Opt.find().sort('-created').populate('user', 'displayName slug').exec(function (err, opts) {
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
exports.optByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Opt is invalid'
    });
  }

  Opt.findById(id).populate('user', 'displayName slug').exec(function (err, opt) {
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
