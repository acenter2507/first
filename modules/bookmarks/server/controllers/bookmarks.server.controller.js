'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Bookmark = mongoose.model('Bookmark'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Bookmark
 */
exports.create = function(req, res) {
  var bookmark = new Bookmark(req.body);
  bookmark.user = req.user;

  bookmark.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(bookmark);
    }
  });
};

/**
 * Show the current Bookmark
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var bookmark = req.bookmark ? req.bookmark.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  bookmark.isCurrentUserOwner = req.user && bookmark.user && bookmark.user._id.toString() === req.user._id.toString();

  res.jsonp(bookmark);
};

/**
 * Update a Bookmark
 */
exports.update = function(req, res) {
  var bookmark = req.bookmark;

  bookmark = _.extend(bookmark, req.body);

  bookmark.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(bookmark);
    }
  });
};

/**
 * Delete an Bookmark
 */
exports.delete = function(req, res) {
  var bookmark = req.bookmark;

  bookmark.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(bookmark);
    }
  });
};

/**
 * List of Bookmarks
 */
exports.list = function(req, res) {
  Bookmark.find().sort('-created').populate('user', 'displayName slug').exec(function(err, bookmarks) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(bookmarks);
    }
  });
};

/**
 * Bookmark middleware
 */
exports.bookmarkByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Bookmark is invalid'
    });
  }

  Bookmark.findById(id).populate('user', 'displayName slug').exec(function (err, bookmark) {
    if (err) {
      return next(err);
    } else if (!bookmark) {
      return res.status(404).send({
        message: 'No Bookmark with that identifier has been found'
      });
    }
    req.bookmark = bookmark;
    next();
  });
};
