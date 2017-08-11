'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Cmt = mongoose.model('Cmt'),
  Poll = mongoose.model('Poll'),
  Cmtlike = mongoose.model('Cmtlike'),
  Polluser = mongoose.model('Polluser'),
  Userreport = mongoose.model('Userreport'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');
var pollController = require(path.resolve('./modules/polls/server/controllers/polls.server.controller'));


/**
 * Create a Cmt
 */
exports.create = function (req, res) {
  var cmt = new Cmt(req.body);
  cmt.user = req.user;

  // Lưu comment vào db
  cmt.save()
    .then(_cmt => {
      cmt = _cmt;
      // Tăng số comemnt trong reprort
      var pollId = cmt.poll._id || cmt.poll;
      return Poll.countUpCmt(pollId);
    }, handleError)
    .then(report => {
      return Userreport.countUpCmt(req.user._id);
    }, handleError)
    .then(report => {
      // Tạo record follow
      Polluser.findOne({ poll: cmt.poll, user: cmt.user }).exec((err, _polluser) => {
        if (!_polluser) {
          _polluser = new Polluser({ poll: cmt.poll, user: cmt.user });
          return _polluser.save();
        } else {
          _polluser.following = true;
          return _polluser.save();
        }
      });
    }, handleError)
    .then(() => {
      // Trả về comment
      res.jsonp(cmt);
    }, handleError);

  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * Show the current Cmt
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var cmt = req.cmt ? req.cmt.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  cmt.isCurrentUserOwner = req.user && cmt.user && cmt.user._id.toString() === req.user._id.toString();
  var userId = (req.user) ? req.user._id : undefined;

  pollController.get_like_by_cmtId_and_userId(cmt._id, userId)
    .then(result => {
      cmt.like = result || {};
      res.jsonp(cmt);
    })
    .catch(err => {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};

/**
 * Update a Cmt
 */
exports.update = function (req, res) {
  var cmt = req.cmt;

  cmt = _.extend(cmt, req.body);
  var userId = (req.user) ? req.user._id : undefined;
  cmt.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      cmt = cmt.toJSON();
      pollController.get_like_by_cmtId_and_userId(cmt._id, userId)
        .then(result => {
          cmt.like = result || {};
          res.jsonp(cmt);
        })
        .catch(err => {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        });
    }
  });
};

/**
 * Delete an Cmt
 */
exports.delete = function (req, res) {
  var cmt = req.cmt;
  const pollId = cmt.poll._id || cmt.poll;
  cmt.remove()
    .then(() => {
      return Poll.countDownCmt(pollId);
    }, handleError)
    .then(() => {
      return Cmtlike.remove({ cmt: cmt._id });
    }, handleError)
    .then(() => {
      return Userreport.countDownCmt(cmt.user);
    }, handleError)
    .then(() => {
      res.jsonp(cmt);
    }, handleError);

  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * List of Cmts
 */
exports.list = function (req, res) {
  var userId = (req.user) ? req.user._id : undefined;
  Cmt.find().sort('-created')
    .populate('user', 'displayName profileImageURL').exec()
    .then(cmts => {
      if (cmts.length === 0) return res.jsonp(cmts);
      var length = cmts.length;
      var counter = 0;
      cmts.forEach(function (instance, index, array) {
        array[index] = instance.toObject();
        pollController.get_like_by_cmtId_and_userId(array[index]._id, userId)
          .then(result => {
            array[index].like = result || {};
            if (++counter === length) {
              res.jsonp(cmts);
            }
          })
          .catch(handleError);
      });
    }, handleError);
  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * Cmt middleware
 */
exports.cmtByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Cmt is invalid'
    });
  }

  Cmt.findById(id).populate('poll').populate('user', 'displayName profileImageURL').exec(function (err, cmt) {
    if (err) {
      return next(err);
    } else if (!cmt) {
      return res.status(404).send({
        message: 'No Cmt with that identifier has been found'
      });
    }
    req.cmt = cmt;
    next();
  });
};