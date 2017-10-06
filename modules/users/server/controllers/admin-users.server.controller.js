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
  Follow = mongoose.model('Follow'),
  Userlogin = mongoose.model('Userlogin'),
  Poll = mongoose.model('Poll'),
  Like = mongoose.model('Like'),
  View = mongoose.model('View'),

  Notif = mongoose.model('Notif'),
  Bookmark = mongoose.model('Bookmark'),
  Vote = mongoose.model('Vote'),
  Cmt = mongoose.model('Cmt'),
  Cmtlike = mongoose.model('Cmtlike'),
  Opt = mongoose.model('Opt'),
  _moment = require('moment'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

var _ = require('underscore');

/**
 * Show the current user
 */
exports.user = function (req, res) {
  // res.jsonp(req.model);
  var user = req.model.toObject();
  countUserLogins(user._id)
    .then(count => {
      user.loginCnt = count;
      return res.jsonp(user);
    }).catch(err => {
      return handleError(res, err);
    });
};

/**
 * Update a User
 */
exports.user_add = function (req, res) {
  var user = new User(req.body);
  user.provider = 'local';
  user.save(function (err, user) {
    if (err)
      return handleError(res, err);
    user.password = undefined;
    user.salt = undefined;
    res.jsonp(user);
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
  user = _.extend(user, req.body);

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
exports.resetPassword = function (req, res) {
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
      Follow.remove({ user: user._id });
    }, handleErrorLocal)
    .then(() => {
      Notif.remove({ to: user._id });
    }, handleErrorLocal)
    .then(() => {
      Bookmark.remove({ user: user._id });
    }, handleErrorLocal)
    .then(() => {
      View.remove({ user: user._id });
    }, handleErrorLocal)
    .then(() => {
      res.jsonp(user);
    }, handleErrorLocal);

  function handleErrorLocal(err) {
    return handleError(res, err);
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
exports.loadAdminUsers = function (req, res) {
  var page = req.body.page || 1;
  var condition = req.body.condition || {};
  var sort = condition.sort || '-created';
  var and_arr = [];
  var query = {};
  if (condition.search && condition.search !== '') {
    and_arr.push({ displayName: { $regex: '.*' + condition.search + '.*' } });
  }
  if (condition.status) {
    and_arr.push({ status: condition.status });
  }
  if (condition.status) {
    and_arr.push({ status: condition.status });
  }
  if (condition.roles) {
    if (condition.roles === 'admin') {
      and_arr.push({ roles: condition.roles });
    } else {
      and_arr.push({ roles: { $ne: condition.roles } });
    }
  }
  if (condition.created) {
    let end = new _moment(condition.created).utc().startOf('day');
    and_arr.push({ created: { $lt: end } });
  }
  if (condition.language) {
    and_arr.push({ language: condition.language });
  }
  if (and_arr.length > 0) {
    query = { $and: and_arr };
  }

  User.paginate(query, {
    sort: sort,
    page: page,
    limit: 10
  }).then(function (users) {
    res.jsonp(users);
  });
};

/**
 * Lấy all users
 */
exports.generateUsers = function (req, res) {
  var number = req.params.number || 1;
  var pass = req.params.pass || '12345678';
  var promise = [];
  for (var i = 1; i <= number; i++) {
    var user = new User();
    var now = new Date().getTime();
    user.displayName = 'Generate User ' + now + i;
    user.email = now + i + '@localhost.com';
    user.password = pass;
    user.provider = 'local';
    user.roles = ['user'];
    user.status = 2;
    promise.push(user.save());
  }
  Promise.all(promise).then(users => {
    res.jsonp(users);
  }).catch(err => {
    res.status(400).send(err);
  });
};

/**
 * Lấy polls của user
 */
exports.loadAdminUserPolls = function (req, res) {
  var page = req.body.page || 1;
  var condition = req.body.condition || {};
  var sort = '-created';
  var query = {};
  var and_arr = [];
  and_arr.push({ user: req.model._id });
  if (condition.search && condition.search !== '') {
    and_arr.push({
      $or: [
        { title: { $regex: '.*' + condition.search + '.*' } },
        { body: { $regex: '.*' + condition.search + '.*' } }
      ]
    });
  }
  if (condition.created) {
    let start = new _moment(condition.created).utc().startOf('day').format();
    let end = new _moment(condition.created).utc().add(1, 'days').startOf('day').format();
    and_arr.push({ created: { $gt: start, $lt: end } });
  }
  query = { $and: and_arr };
  Poll.paginate(query, {
    sort: sort,
    populate: [{ path: 'category', select: 'name' }],
    page: page,
    limit: 10
  }).then(function (polls) {
    res.jsonp(polls);
  }, err => {
    return handleError(res, err);
  });
};
/**
 * Lấy cmts của user
 */
exports.loadAdminUserComments = function (req, res) {
  var page = req.body.page || 1;
  var condition = req.body.condition || {};
  var sort = '-created';
  var query = {};
  var and_arr = [];
  and_arr.push({ user: req.model._id });
  if (condition.search && condition.search !== '') {
    and_arr.push({ body: { $regex: '.*' + condition.search + '.*' } });
  }
  if (condition.created) {
    let start = new _moment(condition.created).utc().startOf('day').format();
    let end = new _moment(condition.created).utc().add(1, 'days').startOf('day').format();
    and_arr.push({ created: { $gt: start, $lt: end } });
  }
  query = { $and: and_arr };
  Cmt.paginate(query, {
    sort: sort,
    populate: [{ path: 'poll', select: 'title' }],
    page: page,
    limit: 10
  }).then(function (cmts) {
    res.jsonp(cmts);
  }, err => {
    return handleError(res, err);
  });
};
/**
 * Lấy votes của user
 */
exports.loadAdminUserVotes = function (req, res) {
  var page = req.body.page || 1;
  var condition = req.body.condition || {};
  var sort = '-created';
  var query = {};
  var and_arr = [];
  and_arr.push({ user: req.model._id });
  if (condition.created) {
    let start = new _moment(condition.created).utc().startOf('day').format();
    let end = new _moment(condition.created).utc().add(1, 'days').startOf('day').format();
    and_arr.push({ created: { $gt: start, $lt: end } });
  }
  query = { $and: and_arr };
  Vote.paginate(query, {
    sort: sort,
    populate: [
      { path: 'poll', select: 'title' },
      { path: 'opts', select: 'title' }
    ],
    page: page,
    limit: 10
  }).then(function (votes) {
    res.jsonp(votes);
  }, err => {
    return handleError(res, err);
  });
};
/**
 * Lấy votes của user
 */
exports.loadAdminUserLikes = function (req, res) {
  var page = req.body.page || 1;
  var condition = req.body.condition || {};
  var sort = '-created';
  var query = {};
  var and_arr = [];
  and_arr.push({ user: req.model._id });
  if (condition.created) {
    let start = new _moment(condition.created).utc().startOf('day').format();
    let end = new _moment(condition.created).utc().add(1, 'days').startOf('day').format();
    and_arr.push({ created: { $gt: start, $lt: end } });
  }
  if (condition.type) {
    and_arr.push({ type: condition.type });
  }
  query = { $and: and_arr };
  Like.paginate(query, {
    sort: sort,
    populate: [{ path: 'poll', select: 'title' }],
    page: page,
    limit: 10
  }).then(function (likes) {
    res.jsonp(likes);
  }, err => {
    return handleError(res, err);
  });
};
/**
 * Lấy votes của user
 */
exports.loadAdminUserVieweds = function (req, res) {
  var page = req.body.page || 1;
  var condition = req.body.condition || {};
  var sort = '-created';
  var query = {};
  var and_arr = [];
  and_arr.push({ user: req.model._id });
  if (condition.created) {
    let start = new _moment(condition.created).utc().startOf('day').format();
    let end = new _moment(condition.created).utc().add(1, 'days').startOf('day').format();
    and_arr.push({ created: { $gt: start, $lt: end } });
  }
  query = { $and: and_arr };
  View.paginate(query, {
    sort: sort,
    populate: [{ path: 'poll', select: 'title' }],
    page: page,
    limit: 10
  }).then(function (views) {
    res.jsonp(views);
  }, err => {
    return handleError(res, err);
  });
};
/**
 * Lấy suggests của user
 */
exports.loadAdminUserSuggests = function (req, res) {
  var page = req.body.page || 1;
  var condition = req.body.condition || {};
  var sort = '-created';
  var query = {};
  var and_arr = [];
  and_arr.push({ user: req.model._id });
  and_arr.push({ isSuggest: true });
  if (condition.created) {
    let start = new _moment(condition.created).utc().startOf('day').format();
    let end = new _moment(condition.created).utc().add(1, 'days').startOf('day').format();
    and_arr.push({ created: { $gt: start, $lt: end } });
  }
  if (condition.status) {
    and_arr.push({ status: condition.status });
  }
  query = { $and: and_arr };

  Opt.paginate(query, {
    sort: sort,
    populate: [{ path: 'poll', select: 'title' }],
    page: page,
    limit: 10
  }).then(function (opts) {
    res.jsonp(opts);
  }, err => {
    return handleError(res, err);
  });
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
    }, err => {
      return handleError(res, err);
    });
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
    }, err => {
      return handleError(res, err);
    });
};
/**
 * Lấy history login của user
 */
exports.loadAdminUserLogins = function (req, res) {
  var page = req.body.page || 1;
  var condition = req.body.condition || {};
  var sort = '-created';
  var query = {};
  var and_arr = [];
  and_arr.push({ user: req.model._id });
  if (condition.search && condition.search !== '') {
    and_arr.push({ agent: { $regex: '.*' + condition.search + '.*' } });
  }
  if (condition.created) {
    let start = new _moment(condition.created).utc().startOf('day').format();
    let end = new _moment(condition.created).utc().add(1, 'days').startOf('day').format();
    and_arr.push({ created: { $gt: start, $lt: end } });
  }
  query = { $and: and_arr };
  Userlogin.paginate(query, {
    sort: sort,
    page: page,
    limit: 10
  }).then(function (logins) {
    res.jsonp(logins);
  }, err => {
    return handleError(res, err);
  });
};

/**
 * LOCAL FUNCTION
 */
function handleError(res, err) {
  return res.status(400).send({
    message: errorHandler.getErrorMessage(err)
  });
}
// Đếm số lần login của user
function countUserLogins(userId) {
  return new Promise((resolve, reject) => {
    if (!userId) return resolve(0);
    Userlogin.find({ user: userId })
      .count(function (err, count) {
        if (err) return reject(err);
        return resolve(count);
      });
  });
}