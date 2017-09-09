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
  mail = require(path.resolve('./config/lib/mail')),
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
  Userreport = mongoose.model('Userreport'),
  crypto = require('crypto'),
  validator = require('validator');

var pollController = require(path.resolve('./modules/polls/server/controllers/polls.server.controller'));
/**
 * Update user details
 */
exports.update = function (req, res) {
  // Init Variables
  var user = req.user;
  let isChangeEmail = user.email === req.body.email;
  if (isChangeEmail) {
    validEmail(req.body.email)
      .then(() => {
        return getToken();
      })
      .then(token => {
        user.activeAccountToken = token;
        user.status = 1;
        return saveUser(user);
      })
      .then(_user => {
        var url = config.http + '://' + req.headers.host + '/api/auth/verifyEmail/' + _user.activeAccountToken;
        var mailTemplate = 'change_email';
        var mailContent = {
          name: _user.displayName,
          appName: config.app.title,
          url: url
        };
        var mailOptions = {
          from: config.app.title + '<' + config.mailer.account.from + '>',
          to: _user.email,
          subject: 'Verify your email'
        };
        return mail.send(config.mailer.account.options, mailContent, mailOptions, mailTemplate);
      })
      .then(() => {
        return res.end();
      })
      .catch(handleError);
  } else {
    if (!user) return handleError(new Error('MS_CM_LOGIN_ERROR'));
    user = _.extend(user, req.body);
    user.updated = Date.now();
    saveUser(user).then(_user => {
      req.login(_user, function (err) {
        if (err) return res.status(400).send(err);
        _user.password = undefined;
        _user.salt = undefined;
        return res.json(_user);
      });
    }).catch(handleError);
  }
  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;

  if (user) {
    // Merge existing user
    user = _.extend(user, req.body);
    user.updated = Date.now();

    user.save(function (err) {
      if (err) {
        return res.status(400).send({
          message: 'LB_PROFILE_FAILED'
        });
      } else {
        if (isChangeEmail) {

        } else {
          req.login(user, function (err) {
            if (err) return res.status(400).send(err);
            return res.json(user);
          });
        }
      }
    });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }

  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

function validEmail(email) {
  return new Promise((resolve, reject) => {
    if (email.length === 0)
      return reject(new Error('LB_USER_EMAIL_REQUIRED'));
    if (!validator.isEmail(email))
      return reject(new Error('LB_USER_EMAIL_INVALID'));
    User.findOne({ email: email }, function (err, user) {
      if (err)
        return reject(new Error('MS_CM_LOAD_ERROR'));
      // Kiểm tra trạng thái user đã active
      if (user)
        return reject(new Error('LB_USERS_EMAIL_DUPLICATE'));
      return resolve();
    });
  });
}
function getToken() {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(20, function (err, buffer) {
      if (err) return reject(new Error('MS_CM_LOAD_ERROR'));
      var token = buffer.toString('hex');
      return resolve(token);
    });
  });
}
function saveUser(user) {
  return new Promise((resolve, reject) => {
    if (!user) return reject(new Error('MS_CM_LOAD_ERROR'));
    user.save(function (err, _user) {
      if (err) return reject(new Error('MS_CM_LOAD_ERROR'));
      return resolve(_user);
    });
  });
}
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

/**
 * Lấy các thông tin mà user đã tương tác cho màn hình Profile.info
 */
exports.activitys = function (req, res) {
  var result = {};
  Poll.find({ user: req.profile._id }).sort('-created')
    .select('title created body isPublic slug').exec()
    .then(polls => {
      result.polls = polls;
      return Cmt.find({ user: req.profile._id }).sort('-created')
        .populate('poll', 'title isPublic slug').exec();

    }, handleError)
    .then(cmts => {
      result.cmts = cmts;
      return Vote.find({ user: req.profile._id }).sort('-created')
        .populate('poll', 'title isPublic slug').exec();
    }, handleError)
    .then(votes => {
      if (votes.length === 0) {
        result.votes = votes;
        return res.jsonp(result);
      } else {
        var length = votes.length;
        var counter = 0;
        votes.forEach(function (instance, index, array) {
          array[index] = instance.toObject();
          pollController.get_opts_by_voteId(array[index]._id)
            .then(opts => {
              array[index].opts = opts;
              if (++counter === length) {
                result.votes = votes;
                res.jsonp(result);
              }

            })
            .catch(handleError);
        });

      }
    }, handleError);





  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * Lấy các poll mà user đã create cho màn hình Profile.polls
 */
exports.polls = function (req, res) {
  var page = req.params.page || 0;
  var userId = req.user ? req.user._id : undefined;
  Poll.find({ user: req.profile._id })
    .sort('-created')
    .populate('user', 'displayName profileImageURL slug')
    .populate('category', 'name icon slug')
    .skip(10 * page)
    .limit(10).exec()
    .then(polls => {
      if (polls.length === 0) return res.jsonp([]);
      var length = polls.length;
      var counter = 0;
      polls.forEach(function (instance, index, array) {
        array[index] = instance.toObject();
        pollController.get_full_by_pollId(array[index]._id, userId)
          .then(result => {
            array[index].opts = result.opts;
            array[index].votes = result.votes;
            array[index].voteopts = result.voteopts;
            array[index].follow = result.follow;
            array[index].reported = result.reported;
            array[index].bookmarked = result.bookmarked;
            if (++counter === length) {
              res.jsonp(polls);
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
 * Lấy các cmts mà user đã create cho màn hình Profile.cmts
 */
exports.cmts = function (req, res) {
  var page = req.params.page || 0;
  Cmt.find({ user: req.profile._id })
    .sort('-created')
    .populate('poll', 'title isPublic slug')
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
 * Get likes of user
 */
exports.votes = function (req, res) {
  var page = req.params.page || 0;
  Vote.find({ user: req.profile._id })
    .sort('-created')
    .populate('poll', 'title isPublic slug')
    .skip(10 * page)
    .limit(10)
    .then(votes => {
      if (votes.length === 0) return res.jsonp([]);
      var length = votes.length;
      var counter = 0;
      votes.forEach(function (instance, index, array) {
        array[index] = instance.toObject();
        pollController.get_opts_by_voteId(array[index]._id)
          .then(result => {
            array[index].opts = result;
            if (++counter === length) {
              res.jsonp(votes);
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
 * Lấy các poll user đã follow tại màn hình profile.bookmark
 */
exports.follows = function (req, res) {
  var page = req.params.page || 0;
  var userId = req.user ? req.user._id : undefined;
  var polls = [];

  Polluser.find({ user: req.profile._id })
    .sort('-created')
    .populate({
      path: 'poll',
      model: 'Poll',
      populate: [
        { path: 'user', select: 'displayName profileImageURL slug', model: 'User' },
        { path: 'category', select: 'name icon slug', model: 'Category' }
      ]
    })
    .skip(10 * page).exec()
    .then(follows => {
      if (follows.length === 0) return res.jsonp([]);
      polls = _.pluck(follows, 'poll');
      var length = polls.length;
      var counter = 0;
      polls.forEach(function (instance, index, array) {
        array[index] = instance.toObject();
        pollController.get_full_by_pollId(array[index]._id, userId)
          .then(result => {
            array[index].opts = result.opts;
            array[index].votes = result.votes;
            array[index].voteopts = result.voteopts;
            array[index].follow = result.follow;
            array[index].reported = result.reported;
            array[index].bookmarked = result.bookmarked;
            if (++counter === length) {
              res.jsonp(polls);
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
 * Lấy các poll user đã bookmark tại màn hình profile.bookmark
 */
exports.bookmarks = function (req, res) {
  var page = req.params.page || 0;
  var userId = req.user ? req.user._id : undefined;
  var polls = [];

  Bookmark.find({ user: req.profile._id })
    .sort('-created')
    .populate({
      path: 'poll',
      model: 'Poll',
      populate: [
        { path: 'user', select: 'displayName profileImageURL slug', model: 'User' },
        { path: 'category', select: 'name icon slug', model: 'Category' }
      ]
    })
    .skip(10 * page).exec()
    .then(bms => {
      if (bms.length === 0) return res.jsonp([]);
      polls = _.pluck(bms, 'poll');
      var length = polls.length;
      var counter = 0;
      polls.forEach(function (instance, index, array) {
        array[index] = instance.toObject();
        pollController.get_full_by_pollId(array[index]._id, userId)
          .then(result => {
            array[index].opts = result.opts;
            array[index].votes = result.votes;
            array[index].voteopts = result.voteopts;
            array[index].follow = result.follow;
            array[index].reported = result.reported;
            array[index].bookmarked = result.bookmarked;
            if (++counter === length) {
              res.jsonp(polls);
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
 * Xoa toan bo bookmark
 */
exports.clear_bookmark = function (req, res) {
  Bookmark.remove({ user: req.profile._id }).exec();
  res.end();
};

/**
 * Xoa toan bo view
 */
exports.clear_view = function (req, res) {
  View.remove({ user: req.profile._id }).exec();
  res.end();
};

/**
 * Xoa toan bo view
 */
exports.clear_follow = function (req, res) {
  Polluser.remove({ user: req.profile._id }).exec();
  res.end();
};

/**
 * Lấy các poll user đã view
 */
exports.views = function (req, res) {
  var page = req.params.page || 0;
  var userId = req.user ? req.user._id : undefined;
  var polls = [];

  View.find({ user: req.profile._id })
    .sort('-created')
    .populate({
      path: 'poll',
      model: 'Poll',
      populate: [
        { path: 'user', select: 'displayName profileImageURL slug', model: 'User' },
        { path: 'category', select: 'name icon slug', model: 'Category' }
      ]
    })
    .skip(10 * page).exec()
    .then(views => {
      if (views.length === 0) return res.jsonp([]);
      polls = _.pluck(views, 'poll');
      var length = polls.length;
      var counter = 0;
      polls.forEach(function (instance, index, array) {
        array[index] = instance.toObject();
        pollController.get_full_by_pollId(array[index]._id, userId)
          .then(result => {
            array[index].opts = result.opts;
            array[index].votes = result.votes;
            array[index].voteopts = result.voteopts;
            array[index].follow = result.follow;
            array[index].reported = result.reported;
            array[index].bookmarked = result.bookmarked;
            if (++counter === length) {
              res.jsonp(polls);
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
 * Lấy các poll user đã like
 */
exports.likes = function (req, res) {
  var page = req.params.page || 0;
  var userId = req.user ? req.user._id : undefined;
  var polls = [];

  Like.find({ user: req.profile._id, type: 1 })
    .sort('-created')
    .populate({
      path: 'poll',
      model: 'Poll',
      populate: [
        { path: 'user', select: 'displayName profileImageURL slug', model: 'User' },
        { path: 'category', select: 'name icon slug', model: 'Category' }
      ]
    })
    .skip(10 * page).exec()
    .then(likes => {
      if (likes.length === 0) return res.jsonp([]);
      polls = _.pluck(likes, 'poll');
      var length = polls.length;
      var counter = 0;
      polls.forEach(function (instance, index, array) {
        array[index] = instance.toObject();
        pollController.get_full_by_pollId(array[index]._id, userId)
          .then(result => {
            array[index].opts = result.opts;
            array[index].votes = result.votes;
            array[index].voteopts = result.voteopts;
            array[index].follow = result.follow;
            array[index].reported = result.reported;
            array[index].bookmarked = result.bookmarked;
            if (++counter === length) {
              res.jsonp(polls);
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
 * Lấy các poll user đã dislike
 */
exports.dislikes = function (req, res) {
  var page = req.params.page || 0;
  var userId = req.user ? req.user._id : undefined;
  var polls = [];

  Like.find({ user: req.profile._id, type: 2 })
    .sort('-created')
    .populate({
      path: 'poll',
      model: 'Poll',
      populate: [
        { path: 'user', select: 'displayName profileImageURL slug', model: 'User' },
        { path: 'category', select: 'name icon slug', model: 'Category' }
      ]
    })
    .skip(10 * page).exec()
    .then(dislikes => {
      if (dislikes.length === 0) return res.jsonp([]);
      polls = _.pluck(dislikes, 'poll');
      var length = polls.length;
      var counter = 0;
      polls.forEach(function (instance, index, array) {
        array[index] = instance.toObject();
        pollController.get_full_by_pollId(array[index]._id, userId)
          .then(result => {
            array[index].opts = result.opts;
            array[index].votes = result.votes;
            array[index].voteopts = result.voteopts;
            array[index].follow = result.follow;
            array[index].reported = result.reported;
            array[index].bookmarked = result.bookmarked;
            if (++counter === length) {
              res.jsonp(polls);
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
  if (!name || name === '') {
    return res.jsonp();
  }
  User.find({ displayName: { $regex: '.*' + name + '.*' } })
    .select('displayName profileImageURL username slug')
    .exec(function (err, users) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        // res.jsonp(users);
        res.send(JSON.stringify({ users: users }));
      }
    });
};

/**
 * User middleware
 */
exports.profileById = function (req, res, next, id) {

  var query = { $or: [{ slug: id }] };
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    query.$or.push({ _id: id });
  }
  User.findOne(query)
    .exec(function (err, user) {
      if (err) {
        return res.status(400).send({
          message: 'Profile is invalid'
        });
      } else if (!user) {
        return next(new Error('Failed to load User ' + id));
      }

      req.profile = user;
      next();
    });
};

/**
 * USER REPORT
 */
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

