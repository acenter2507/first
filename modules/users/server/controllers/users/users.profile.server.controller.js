'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  fs = require('fs'),
  path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  multer = require('multer'),
  config = require(path.resolve('./config/config')),
  User = mongoose.model('User'),
  Poll = mongoose.model('Poll'),
  Opt = mongoose.model('Opt'),
  Cmt = mongoose.model('Cmt'),
  Vote = mongoose.model('Vote'),
  Voteopt = mongoose.model('Voteopt'),
  Polltag = mongoose.model('Polltag'),
  Polluser = mongoose.model('Polluser'),
  Report = mongoose.model('Report'),
  Bookmark = mongoose.model('Bookmark'),
  Category = mongoose.model('Category'),
  View = mongoose.model('View'),
  Like = mongoose.model('Like'),
  Userreport = mongoose.model('Userreport');

/**
 * Update user details
 */
exports.update = function (req, res) {
  // Init Variables
  var user = req.user;

  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;

  if (user) {
    // Merge existing user
    user = _.extend(user, req.body);
    user.updated = Date.now();
    user.displayName = user.firstName + ' ' + user.lastName;

    user.save(function (err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        req.login(user, function (err) {
          if (err) {
            res.status(400).send(err);
          } else {
            res.json(user);
          }
        });
      }
    });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};

/**
 * Update profile picture
 */
exports.changeProfilePicture = function (req, res) {
  var user = req.user;
  var message = null;
  var upload = multer(config.uploads.profileUpload).single('newProfilePicture');
  var profileUploadFileFilter = require(path.resolve('./config/lib/multer')).profileUploadFileFilter;

  // Filtering to upload only images
  upload.fileFilter = profileUploadFileFilter;

  if (user) {
    upload(req, res, function (uploadError) {
      if (uploadError) {
        return res.status(400).send({
          message: 'Error occurred while uploading profile picture'
        });
      } else {
        user.profileImageURL = config.uploads.profileUpload.dest + req.file.filename;

        user.save(function (saveError) {
          if (saveError) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(saveError)
            });
          } else {
            req.login(user, function (err) {
              if (err) {
                res.status(400).send(err);
              } else {
                res.json(user);
              }
            });
          }
        });
      }
    });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};

/**
 * Send User
 */
exports.me = function (req, res) {
  res.json(req.user || null);
};

/**
 * Send User Profile
 */
exports.profile = function (req, res) {
  res.json(req.profile || null);
};

exports.reportByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Report is invalid'
    });
  }

  Userreport.findById(id).exec(function (err, report) {
    if (err) {
      return next(err);
    } else if (!report) {
      return res.status(404).send({
        message: 'No Report with that identifier has been found'
      });
    }
    req.report = report;
    next();
  });
};

exports.read_report = function (req, res) {
  res.json(req.report || null);
};
exports.create_report = function (req, res) {
  var report = new Userreport(req.body);
  report.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(report);
    }
  });
};
exports.update_report = function (req, res) {
  var report = req.report;

  report = _.extend(report, req.body);
  report.save()
    .then(_report => {
      res.jsonp(_report);
    }, handleError);

  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};
exports.delete_report = function (req, res) {
  res.json(req.report || null);
};
/**
 * Get polls of user for activity
 */
exports.all_polls = function (req, res) {
  Poll.find({ user: req.profile._id })
    .sort('-created')
    .select('title created body isPublic')
    .exec(function (err, polls) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(polls);
      }
    });
};
/**
 * Get polls of user
 */
exports.polls = function (req, res) {
  var page = req.params.page || 0;
  Poll.find({ user: req.profile._id })
    .sort('-created')
    .populate('category', 'name icon')
    .skip(10 * page)
    .limit(10)
    .exec(function (err, polls) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(polls);
      }
    });
};

/**
 * Get cmts of user for activity
 */
exports.all_cmts = function (req, res) {
  Cmt.find({ user: req.profile._id })
    .sort('-created')
    .select('created body')
    .populate('poll', 'title isPublic')
    .exec(function (err, cmts) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(cmts);
      }
    });
};
/**
 * Get cmts of user
 */
exports.cmts = function (req, res) {
  var page = req.params.page || 0;
  Cmt.find({ user: req.profile._id })
    .sort('-created')
    .populate('poll', 'title isPublic')
    .skip(10 * page)
    .limit(10)
    .exec(function (err, cmts) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(cmts);
      }
    });
};

/**
 * Get cmts of user for activity
 */
exports.all_votes = function (req, res) {
  Vote.find({ user: req.profile._id })
    .sort('-created')
    .select('created')
    .populate('poll', 'title isPublic')
    .exec(function (err, votes) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(votes);
      }
    });
};
/**
 * Get likes of user
 */
exports.votes = function (req, res) {
  var page = req.params.page || 0;
  Vote.find({ user: req.profile._id })
    .sort('-created')
    .populate('poll', 'title isPublic')
    .skip(10 * page)
    .limit(10)
    .exec(function (err, votes) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(votes);
      }
    });
};

exports.follows = function (req, res) {
  var page = req.params.page || 0;
  Polluser.find({ user: req.profile._id, following: true })
    .sort('-created')
    .populate({
      path: 'poll',
      model: 'Poll',
      populate: [
        { path: 'user', select: 'displayName profileImageURL', model: 'User' },
        { path: 'category', select: 'name icon', model: 'Category' }
      ]
    })
    .skip(10 * page)
    .exec(function (err, follows) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(follows);
      }
    });

};

exports.bookmarks = function (req, res) {
  var page = req.params.page || 0;
  Bookmark.find({ user: req.profile._id })
    .sort('-created')
    .populate({
      path: 'poll',
      model: 'Poll',
      populate: [
        { path: 'user', select: 'displayName profileImageURL', model: 'User' },
        { path: 'category', select: 'name icon', model: 'Category' }
      ]
    })
    .skip(10 * page)
    .exec(function (err, bookmarks) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(bookmarks);
      }
    });
};

exports.views = function (req, res) {
  var page = req.params.page || 0;
  View.find({ user: req.profile._id })
    .sort('-created')
    .populate({
      path: 'poll',
      model: 'Poll',
      populate: [
        { path: 'user', select: 'displayName profileImageURL', model: 'User' },
        { path: 'category', select: 'name icon', model: 'Category' }
      ]
    })
    .skip(10 * page)
    .exec(function (err, views) {
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
 * Get likes of user
 */
exports.likes = function (req, res) {
  var page = req.params.page || 0;
  Like.find({ user: req.profile._id, type: 1 })
    .sort('-created')
    .populate({
      path: 'poll',
      model: 'Poll',
      populate: [
        { path: 'user', select: 'displayName profileImageURL', model: 'User' },
        { path: 'category', select: 'name icon', model: 'Category' }
      ]
    })
    .skip(10 * page)
    .exec(function (err, likes) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(likes);
      }
    });
};

exports.dislikes = function (req, res) {
  var page = req.params.page || 0;
  Like.find({ user: req.profile._id, type: 2 })
    .sort('-created')
    .populate({
      path: 'poll',
      model: 'Poll',
      populate: [
        { path: 'user', select: 'displayName profileImageURL', model: 'User' },
        { path: 'category', select: 'name icon', model: 'Category' }
      ]
    })
    .skip(10 * page)
    .exec(function (err, dislikes) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(dislikes);
      }
    });
};

exports.report = function (req, res) {
  Userreport.findOne({ user: req.profile._id })
    .exec(function (err, report) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(report);
      }
    });
};

exports.search_user_by_name = function (req, res) {
  const name = req.query.s;
  console.log(name);
  if (!name || name === '') {
    return res.jsonp();
  }
  User.find()
    .exec(function (err, users) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(users);
      }
    });
};
