'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  multer = require('multer'),
  config = require(path.resolve('./config/config')),
  User = mongoose.model('User'),
  Report = mongoose.model('Report'),
  Userreport = mongoose.model('Userreport'),
  Notif = mongoose.model('Notif'),
  Bookmark = mongoose.model('Bookmark'),
  View = mongoose.model('View'),
  Poll = mongoose.model('Poll'),
  Vote = mongoose.model('Vote'),
  Voteopt = mongoose.model('Voteopt'),
  Cmt = mongoose.model('Cmt'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

_ = require('underscore');

/**
 * Show the current user
 */
exports.user = function (req, res) {
  res.json(req.model);
};

/**
 * Update a User
 */
exports.user_add = function (req, res) {
  var user = new User(req.body);
  user.provider = 'local';
  user.displayName = user.firstName + ' ' + user.lastName;
  user.save(function (err, user) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      // Remove sensitive data before login
      var report = new Userreport({ user: user._id });
      report.save();
      user.password = undefined;
      user.salt = undefined;
      res.json(user);
    }
  });
};

/**
 * Update a User
 */
// exports.users_profile_image = function (req, res) {
//   var user = req.model;
//   var message = null;
//   var upload = multer(config.uploads.profileUpload).single('profilePicture');
//   var profileUploadFileFilter = require(path.resolve('./config/lib/multer')).profileUploadFileFilter;

//   // Filtering to upload only images
//   upload.fileFilter = profileUploadFileFilter;

//   if (user) {
//     upload(req, res, function (uploadError) {
//       if (uploadError) {
//         return res.status(400).send({
//           message: 'Error occurred while uploading profile picture'
//         });
//       } else {
//         user.profileImageURL = config.uploads.profileUpload.dest + req.file.filename;

//         user.save(function (saveError) {
//           if (saveError) {
//             return res.status(400).send({
//               message: errorHandler.getErrorMessage(saveError)
//             });
//           } else {
//             res.end();
//           }
//         });
//       }
//     });
//   } else {
//     res.status(400).send({
//       message: 'User is not signed in'
//     });
//   }
// };

/**
 * Update a User
 */
exports.user_update = function (req, res) {
  var user = req.model;

  //For security purposes only merge these parameters
  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  user.displayName = user.firstName + ' ' + user.lastName;
  user.username = req.body.username;
  user.roles = req.body.roles;

  user.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(user);
  });
};

/**
 * Reset password
 */
exports.user_resetpass = function (req, res) {
  var user = req.model;
  var password = req.body.password;

  if (user && password) {
    user.password = password;
    user.save(function (err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.end();
      }
    });
  } else {
    res.status(400).send({
      message: 'Passwords do not match'
    });
  }
};

/**
 * Delete a user
 */
exports.user_delete = function (req, res) {
  var user = req.model;
  user.remove()
    .then(() => {
      Userreport.remove({ user: user._id });
    }, handleError)
    .then(() => {
      Notif.remove({ to: user._id });
    }, handleError)
    .then(() => {
      Bookmark.remove({ user: user._id });
    }, handleError)
    .then(() => {
      View.remove({ user: user._id });
    }, handleError)
    .then(() => {
      res.json(user);
    }, handleError);

  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * List of Users
 */
exports.users = function (req, res) {
  User.find({}, '-salt -password').sort('-created').exec(function (err, users) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(users);
  });
};

/**
 * User middleware
 */
exports.userByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'User is invalid'
    });
  }

  User.findById(id, '-salt -password').exec(function (err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      return next(new Error('Failed to load user ' + id));
    }

    req.model = user;
    next();
  });
};

/**
 * User Api
 * Lấy report của user
 */
exports.users_report = function (req, res) {
  Userreport.findOne({ user: req.model._id })
    .exec(function (err, user) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }

      res.json(user);
    });
};
/**
 * Lấy reported của user
 */
exports.users_reported = function (req, res) {
  Report.find({ victim: req.model._id })
    .count(function (err, count) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }

      res.json(count);
    });
};
/**
 * Lấy polls của user
 */
exports.users_polls = function (req, res) {
  Poll.find({ user: req.model._id })
    .sort('-created')
    .populate('category', 'name')
    .exec(function (err, polls) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(polls);
      }
    });
};
/**
 * Lấy votes của user
 */
exports.users_votes = function (req, res) {
  Vote.find({ user: req.model._id })
    .sort('-created')
    .populate('poll', 'title')
    .lean()
    .exec()
    .then((votes) => {
      console.log(votes);
      _.each(votes, function (vote) {
        Voteopt.find({ vote: vote._id })
          .populate('opt', 'title')
          .exec()
          .then(voteopts => {
            var opts = [];
            _.each(voteopts, function (voteopt) {
              opts.push(voteopt.opt);
            });
            vote.opts = opts;
          }, handleError);
      });
      res.json(votes);
    }, handleError);

  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};
/**
 * Lấy cmts của user
 */
exports.users_cmts = function (req, res) {
  Cmt.find({ user: req.model._id })
    .sort('-created')
    .populate('poll', 'title')
    .exec(function (err, cmts) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(cmts);
      }
    });
};