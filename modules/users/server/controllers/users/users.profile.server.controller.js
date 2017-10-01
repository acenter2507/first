'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  fs = require('fs'),
  path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  logger = require(path.resolve('./config/lib/logger')).log4jLog,
  mongoose = require('mongoose'),
  multer = require('multer'),
  config = require(path.resolve('./config/config')),
  mail = require(path.resolve('./config/lib/mail')),
  User = mongoose.model('User'),
  Poll = mongoose.model('Poll'),
  Opt = mongoose.model('Opt'),
  Cmt = mongoose.model('Cmt'),
  Vote = mongoose.model('Vote'),
  Polltag = mongoose.model('Polltag'),
  Follow = mongoose.model('Follow'),
  Report = mongoose.model('Report'),
  Bookmark = mongoose.model('Bookmark'),
  Category = mongoose.model('Category'),
  View = mongoose.model('View'),
  Like = mongoose.model('Like'),
  crypto = require('crypto'),
  validator = require('validator');

var pollController = require(path.resolve('./modules/polls/server/controllers/polls.server.controller'));
/**
 * Update user details
 */
exports.update = function (req, res) {
  // Init Variables
  var user = req.user;
  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;

  var isChangeEmail = user.email !== req.body.email;
  if (isChangeEmail) {
    validEmail(req.body.email)
      .then(() => {
        return getToken();
      })
      .then(token => {
        user = _.extend(user, req.body);
        user.activeAccountToken = token;
        user.status = 1;
        return saveUser(user);
      })
      .then(_user => {
        var url = config.http + '://' + req.headers.host + '/api/auth/verifyEmail/' + _user.activeAccountToken;
        var mailTemplate = 'verify_email_' + _user.language;
        var mailContent = {
          name: _user.displayName,
          appName: config.app.title,
          url: url
        };
        var subject = global.translate[_user.language].EMAIL_SJ_CHANGE_MAIL || global.translate[config.defaultLanguage].EMAIL_SJ_CHANGE_MAIL;
        var mailOptions = {
          from: config.app.title + '<' + config.mailer.account.from + '>',
          to: _user.email,
          subject: subject
        };
        return mail.send(config.mailer.account.options, mailContent, mailOptions, mailTemplate);
      })
      .then(() => {
        return res.json({ message: 'MS_USERS_SEND_SUCCESS', host: config.http + '://' + req.headers.host });
      })
      .catch(handleError);
  } else {
    if (!user) return handleError(new Error('MS_CM_LOGIN_ERROR'));
    user = _.extend(user, req.body);
    user.updated = Date.now();
    saveUser(user).then(_user => {
      _user.report = undefined;
      _user.password = undefined;
      _user.salt = undefined;
      req.login(_user, function (err) {
        if (err) return res.status(400).send(err);
        return res.json(_user);
      });
    }).catch(handleError);
  }

  function handleError(err) {
    // Xuất bug ra file log
    logger.system.error('users.profile.server.controller.js - update', err);
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
 * Verify
 */
exports.verifyEmail = function (req, res) {
  User.findOne({
    activeAccountToken: req.params.token
  }, function (err, user) {
    if (!user) {
      // Kiểm tra nếu user không tồn tại
      return res.redirect('/verification/error?err=1');
    } else {
      // Kiểm tra nếu user đã bị block
      if (user.status === 3)
        return res.redirect('/verification/error?err=2');
      // Kiểm tra nếu user là account social
      if (user.provider !== 'local')
        return res.redirect('/verification/error?err=3');
      user.status = 2;
      user.activeAccountToken = undefined;
      user.save(function (err, user) {
        user.report = undefined;
        user.password = undefined;
        user.salt = undefined;
        req.login(user, function (err) {
          if (err) {
            res.status(400).send(err);
          } else {
            return res.redirect('/');
          }
        });
      });
    }
  });
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
          message: 'MS_CM_LOAD_ERROR'
        });
      } else {
        user.profileImageURL = config.uploads.profileUpload.dest + req.file.filename;

        user.save(function (saveError) {
          if (saveError) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(saveError)
            });
          } else {
            user.report = undefined;
            user.password = undefined;
            user.salt = undefined;
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
      message: 'MS_CM_LOGIN_ERROR_SERVER'
    });
  }
};
/**
 * Update profile picture
 */
exports.changeLanguage = function (req, res) {
  var user = req.user;
  var language = config.mappingLanguages[req.body.language];
  if (!language) {
    return res.status(400).send({ message: 'MS_USERS_LANG_UNSUPPORT' });
  }
  user.language = language;
  user.save(function (err, _user) {
    if (err) res.status(400).send({ message: 'MS_CM_LOAD_ERROR' });
    _user.password = undefined;
    _user.salt = undefined;
    return res.end();
  });
};

// -----------------------------------------------------------------------
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
      result.votes = votes;
      return res.jsonp(result);
    }, handleError);
  function handleError(err) {
    // Xuất bug ra file log
    logger.system.error('users.profile.server.controller.js - activitys', err);
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * Tăng giá trị view profile của user
 */
exports.countUpBeView = function (req, res) {
  User.countUpBeView(req.profile._id);
  res.end();
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
    .populate('category', 'name color icon slug')
    .skip(10 * page)
    .limit(10).exec()
    .then(polls => {
      if (polls.length === 0) return res.jsonp([]);
      var length = polls.length;
      var counter = 0;
      polls.forEach(function (instance, index, array) {
        if (!instance) return;
        array[index] = instance.toObject();
        pollController.get_last_cmt_by_pollId(array[index]._id)
          .then(result => {
            array[index].lastCmt = result || {};
            return pollController.get_full_by_pollId(array[index]._id, userId);
          })
          .then(result => {
            array[index].opts = result.opts;
            array[index].votes = result.votes;
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
    // Xuất bug ra file log
    logger.system.error('users.profile.server.controller.js - polls', err);
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
      res.jsonp(votes);
    }, handleError);
  function handleError(err) {
    // Xuất bug ra file log
    logger.system.error('users.profile.server.controller.js - votes', err);
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

  Follow.find({ user: req.profile._id })
    .sort('-created')
    .populate({
      path: 'poll',
      model: 'Poll',
      populate: [
        { path: 'user', select: 'displayName profileImageURL slug', model: 'User' },
        { path: 'category', select: 'name color icon slug', model: 'Category' }
      ]
    })
    .skip(10 * page).exec()
    .then(follows => {
      if (follows.length === 0) return res.jsonp([]);
      polls = _.pluck(follows, 'poll');
      var length = polls.length;
      var counter = 0;
      polls.forEach(function (instance, index, array) {
        if (!instance) return;
        array[index] = instance.toObject();
        pollController.get_full_by_pollId(array[index]._id, userId)
          .then(result => {
            array[index].opts = result.opts;
            array[index].votes = result.votes;
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
    // Xuất bug ra file log
    logger.system.error('users.profile.server.controller.js - follows', err);
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
        { path: 'category', select: 'name color icon slug', model: 'Category' }
      ]
    })
    .skip(10 * page).exec()
    .then(bms => {
      if (bms.length === 0) return res.jsonp([]);
      polls = _.pluck(bms, 'poll');
      var length = polls.length;
      var counter = 0;
      polls.forEach(function (instance, index, array) {
        if (!instance) return;
        array[index] = instance.toObject();
        pollController.get_full_by_pollId(array[index]._id, userId)
          .then(result => {
            array[index].opts = result.opts;
            array[index].votes = result.votes;
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
    // Xuất bug ra file log
    logger.system.error('users.profile.server.controller.js - bookmarks', err);
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
  var user = req.profile;
  user.report.viewCnt = 0;
  user.save();
  View.remove({ user: user._id }).exec();

  res.end();
};

/**
 * Xoa toan bo view
 */
exports.clear_follow = function (req, res) {
  Follow.remove({ user: req.profile._id }).exec();
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
        { path: 'category', select: 'name color icon slug', model: 'Category' }
      ]
    })
    .skip(10 * page).exec()
    .then(views => {
      if (views.length === 0) return res.jsonp([]);
      polls = _.pluck(views, 'poll');
      var length = polls.length;
      var counter = 0;
      polls.forEach(function (instance, index, array) {
        if (!instance) return;
        array[index] = instance.toObject();
        pollController.get_full_by_pollId(array[index]._id, userId)
          .then(result => {
            array[index].opts = result.opts;
            array[index].votes = result.votes;
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
    // Xuất bug ra file log
    logger.system.error('users.profile.server.controller.js - views', err);
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
        { path: 'category', select: 'name color icon slug', model: 'Category' }
      ]
    })
    .skip(10 * page).exec()
    .then(likes => {
      if (likes.length === 0) return res.jsonp([]);
      polls = _.pluck(likes, 'poll');
      var length = polls.length;
      var counter = 0;
      polls.forEach(function (instance, index, array) {
        if (!instance) return;
        array[index] = instance.toObject();
        pollController.get_full_by_pollId(array[index]._id, userId)
          .then(result => {
            array[index].opts = result.opts;
            array[index].votes = result.votes;
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
    // Xuất bug ra file log
    logger.system.error('users.profile.server.controller.js - likes', err);
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
        { path: 'category', select: 'name color icon slug', model: 'Category' }
      ]
    })
    .skip(10 * page).exec()
    .then(dislikes => {
      if (dislikes.length === 0) return res.jsonp([]);
      polls = _.pluck(dislikes, 'poll');
      var length = polls.length;
      var counter = 0;
      polls.forEach(function (instance, index, array) {
        if (!instance) return;
        array[index] = instance.toObject();
        pollController.get_full_by_pollId(array[index]._id, userId)
          .then(result => {
            array[index].opts = result.opts;
            array[index].votes = result.votes;
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
    // Xuất bug ra file log
    logger.system.error('users.profile.server.controller.js - dislikes', err);
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

exports.search_user_by_name = function (req, res) {
  const name = req.query.s;
  if (!name || name === '') {
    return res.jsonp();
  }
  User.find({ displayName: { $regex: '.*' + name + '.*' } })
    .select('displayName profileImageURL email slug')
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

exports.loadTopUsers = function (req, res) {
  var limit = req.params.limit || 0;
  User.find().sort('-rank')
    .select('displayName profileImageURL slug created')
    .limit(limit * 1)
    .exec(function (err, users) {
      if (err) {
        return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
      } else {
        res.jsonp(users);
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
          message: 'MS_CM_DATA_NOT_FOUND'
        });
      } else if (!user) {
        return next(new Error('MS_CM_DATA_NOT_FOUND'));
      }

      req.profile = user;
      next();
    });
};
