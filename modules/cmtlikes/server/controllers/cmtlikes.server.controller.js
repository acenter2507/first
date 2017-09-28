'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Cmtlike = mongoose.model('Cmtlike'),
  Cmt = mongoose.model('Cmt'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Cmtlike
 */
exports.create = function (req, res) {
  var cmtlike = new Cmtlike(req.body);
  cmtlike.user = req.user;
  var cnt = (cmtlike.type === 1) ? 1 : -1;
  cmtlike.save()
    .then(_cmtlike => {
      cmtlike = _cmtlike;
      // Bỏ phần thông tin user thừa
      cmtlike.user = _cmtlike.user._id || _cmtlike.user;
      var cmtId = cmtlike.cmt._id || cmtlike.cmt;
      return Cmt.countLike(cmtId, cnt);
    }, handleError)
    .then(cmt => {
      res.jsonp({ like: cmtlike, likeCnt: cmt.likeCnt });
    }, handleError);

  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * Show the current Cmtlike
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var cmtlike = req.cmtlike ? req.cmtlike.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  cmtlike.isCurrentUserOwner = req.user && cmtlike.user && cmtlike.user._id.toString() === req.user._id.toString();

  res.jsonp(cmtlike);
};

/**
 * Update a Cmtlike
 */
exports.update = function (req, res) {
  var cmtlike = req.cmtlike;
  // Hoán đổi 2 đơn vị
  var cnt = (cmtlike.type === 1) ? -2 : 2;

  cmtlike = _.extend(cmtlike, req.body);
  cmtlike.save()
    .then(_cmtlike => {
      cmtlike = _cmtlike;
      // Bỏ phần thông tin user thừa
      cmtlike.user = _cmtlike.user._id || _cmtlike.user;
      var cmtId = cmtlike.cmt._id || cmtlike.cmt;
      return Cmt.countLike(cmtId, cnt);
    }, handleError)
    .then(cmt => {
      res.jsonp({ like: cmtlike, likeCnt: cmt.likeCnt });
    }, handleError);

  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * Delete an Cmtlike
 */
exports.delete = function (req, res) {

  var cmtlike = req.cmtlike;
  var cnt = (cmtlike.type === 1) ? -1 : 1;
  cmtlike.remove()
    .then(() => {
      var cmtId = cmtlike.cmt._id || cmtlike.cmt;
      return Cmt.countLike(cmtId, cnt);
    }, handleError)
    .then(cmt => {
      res.jsonp({ likeCnt: cmt.likeCnt });
    }, handleError);
  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * List of Cmtlikes
 */
exports.list = function (req, res) {
  Cmtlike.find().sort('-created').populate('user', 'displayName slug').exec(function (err, cmtlikes) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(cmtlikes);
    }
  });
};

/**
 * Cmtlike middleware
 */
exports.cmtlikeByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Cmtlike is invalid'
    });
  }

  Cmtlike.findById(id).populate('user', 'displayName slug').exec(function (err, cmtlike) {
    if (err) {
      return next(err);
    } else if (!cmtlike) {
      return res.status(404).send({
        message: 'No Cmtlike with that identifier has been found'
      });
    }
    req.cmtlike = cmtlike;
    next();
  });
};
