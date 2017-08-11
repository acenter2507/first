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
  Cmtlike = mongoose.model('Cmtlike'),
  Opt = mongoose.model('Opt'),
  Userlogin = mongoose.model('Userlogin'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

var _ = require('underscore');

/**
 * Show the current user
 */
exports.user = function (req, res) {
  // res.jsonp(req.model);
  var user = req.model.toObject();
  users_report(user).then(_user => {
    res.jsonp(_user);
  }).catch(err => {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
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
      res.jsonp(user);
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

    res.jsonp(user);
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
      res.jsonp(user);
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

    res.jsonp(users);
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
 * Lấy all users
 */
exports.users_list = function (req, res) {
  User.find({}, '-salt -password')
    .sort('-created').exec()
    .then((users) => {
      if (users.length === 0) return res.jsonp(users);
      var length = users.length;
      var counter = 0;
      users.forEach(function (instance, index, array) {
        array[index] = instance.toObject();
        users_be_report(array[index])
          .then(_res => {
            return users_report(array[index]);
          })
          .then(_res => {
            if (++counter === length) {
              res.jsonp(users);
            }
          })
          .catch(err => {
            return handleError(err);
          });
      });
    }, handleError);

  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

// Đếm số lần bị report
function users_be_report(user) {
  return new Promise((resolve, reject) => {
    Report.find({ victim: user._id })
      .count(function (err, count) {
        if (err) {
          return reject(err);
        }
        user.bereportCnt = count;
        return resolve(user);
      });
  });
}
// Thông tin report của user
function users_report(user) {
  return new Promise((resolve, reject) => {
    Userreport.findOne({ user: user._id })
      .exec(function (err, report) {
        if (err) {
          return reject(err);
        }
        user.report = report;
        return resolve(user);
      });
  });
}
/**
 * User Api
 * Lấy report của user
 */
// exports.users_report = function (req, res) {
//   Userreport.findOne({ user: req.model._id })
//     .exec(function (err, user) {
//       if (err) {
//         return res.status(400).send({
//           message: errorHandler.getErrorMessage(err)
//         });
//       }

//       res.jsonp(user);
//     });
// };
/**
 * Lấy reported của user
 */
// exports.users_reported = function (req, res) {
//   Report.find({ victim: req.model._id })
//     .count(function (err, count) {
//       if (err) {
//         return res.status(400).send({
//           message: errorHandler.getErrorMessage(err)
//         });
//       }

//       res.jsonp(count);
//     });
// };
/**
 * Lấy polls của user
 */
exports.users_polls = function (req, res) {
  Poll.find({ user: req.model._id })
    .sort('-created')
    .populate('category', 'name')
    .exec()
    .then((polls) => {
      res.jsonp(polls);
    }, handleError);

  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};
/**
 * Lấy votes của user
 */
exports.users_votes = function (req, res) {
  Vote.find({ user: req.model._id })
    .sort('-created')
    .populate('poll', 'title')
    .exec()
    .then((votes) => {
      if (votes.length === 0) return res.jsonp(votes);
      var length = votes.length;
      var counter = 0;
      votes.forEach(function (instance, index, array) {
        array[index] = instance.toObject();
        Voteopt.find({ vote: array[index]._id })
          .populate('opt', 'title')
          .exec()
          .then(voteopts => {
            var opts = [];
            voteopts.forEach(function (voteopt) {
              opts.push(voteopt.opt.title);
            });
            array[index].opts = opts;
            if (++counter === length) {
              res.jsonp(votes);
            }
          }, handleError);
      });
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
    .exec()
    .then((cmts) => {
      res.jsonp(cmts);
    }, handleError);
  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};
/**
 * Lấy report của user
 */
exports.users_reports = function (req, res) {
  Report.find({ user: req.model._id })
    .sort('-created')
    .populate('poll', 'title')
    .exec()
    .then((reports) => {
      res.jsonp(reports);
    }, handleError);
  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};
/**
 * Lấy be report của user
 */
exports.users_bereports = function (req, res) {
  Report.find({ victim: req.model._id })
    .sort('-created')
    .populate('poll', 'title')
    .exec()
    .then((reports) => {
      res.jsonp(reports);
    }, handleError);
  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};
/**
 * Lấy suggests của user
 */
exports.users_suggests = function (req, res) {
  Poll.find({ user: req.model._id })
    .exec()
    .then(polls => {
      var ids = _.pluck(polls, '_id');
      return Opt.find({ user: req.model._id, poll: { $nin: ids } })
        .sort('-created')
        .populate('poll', 'title')
        .exec();
    }, handleError)
    .then((opts) => {
      res.jsonp(opts);
    }, handleError);
  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};
/**
 * Lấy history login của user
 */
exports.users_logins = function (req, res) {
  Userlogin.find({ user: req.model._id })
    .exec()
    .then(logins => {
      res.jsonp(logins);
    }, handleError);
  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};