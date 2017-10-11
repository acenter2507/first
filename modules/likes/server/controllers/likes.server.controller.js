'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Like = mongoose.model('Like'),
  Poll = mongoose.model('Poll'),
  User = mongoose.model('User'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('underscore');

/**
 * Create a Like
 */
exports.create = function (req, res) {
  var like = new Like(req.body);
  var cnt = (like.type === 1) ? 1 : -1;
  like.user = req.user._id;

  like.save()
    .then(_like => {
      like = _like;
      like.user = _like.user._id || _like.user;
      return User.countUpLike(like.user);
    }, handleError)
    .then(() => {
      var pollId = like.poll._id || like.poll;
      return Poll.countLike(pollId, cnt);
    }, handleError)
    .then(_poll => {
      res.jsonp({ like: like, likeCnt: _poll.likeCnt });
    }, handleError);

  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * Show the current Like
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var like = req.like ? req.like.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  like.isCurrentUserOwner = req.user && like.user && like.user._id.toString() === req.user._id.toString();

  res.jsonp(like);
};

/**
 * Update a Like
 */
exports.update = function (req, res) {
  var like = req.like;
  // Hoán đổi 2 đơn vị
  var cnt = (like.type === 1) ? -2 : 2;

  like = _.extend(like, req.body);

  like.save()
    .then(_like => {
      like = _like;
      like.user = _like.user._id || _like.user;
      var pollId = _like.poll._id || _like.poll;
      return Poll.countLike(pollId, cnt);
    }, handleError)
    .then(_poll => {
      res.jsonp({ like: like, likeCnt: _poll.likeCnt });
    }, handleError);

  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * Delete an Like
 */
exports.delete = function (req, res) {
  var like = req.like;
  var cnt = (like.type === 1) ? -1 : 1;

  like.remove()
    .then(() => {
      var userId = like.user._id || like.user;
      return User.countLike(userId);
    }, handleError)
    .then(() => {
      var pollId = like.poll._id || like.poll;
      return Poll.countLike(pollId, cnt);
    }, handleError)
    .then(_poll => {
      res.jsonp({ likeCnt: _poll.likeCnt });
    }, handleError);

  function handleError(err) {
    console.log(err);
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * List of Likes
 */
exports.list = function (req, res) {
  Like.find().sort('-created').populate('user', 'displayName slug').exec(function (err, likes) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(likes);
    }
  });
};

/**
 * Like middleware
 */
exports.likeByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Like is invalid'
    });
  }

  Like.findById(id).populate('user', 'displayName slug').exec(function (err, like) {
    if (err) {
      return next(err);
    } else if (!like) {
      return res.status(404).send({
        message: 'No Like with that identifier has been found'
      });
    }
    req.like = like;
    next();
  });
};
