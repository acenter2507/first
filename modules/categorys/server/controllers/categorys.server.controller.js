'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Category = mongoose.model('Category'),
  Poll = mongoose.model('Poll'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');
var pollController = require(path.resolve('./modules/polls/server/controllers/polls.server.controller'));

/**
 * Create a Category
 */
exports.create = function (req, res) {
  var category = new Category(req.body);
  category.user = req.user;

  category.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(category);
    }
  });
};

/**
 * Show the current Category
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var category = req.category ? req.category.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  category.isCurrentUserOwner = req.user && category.user && category.user._id.toString() === req.user._id.toString();
  count_polls_by_categoryId(category._id)
    .then(result => {
      category.count = result || 0;
      res.jsonp(category);
    })
    .catch(err => {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};

/**
 * Update a Category
 */
exports.update = function (req, res) {
  var category = req.category;

  category = _.extend(category, req.body);

  category.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(category);
    }
  });
};

/**
 * Delete an Category
 */
exports.delete = function (req, res) {
  var category = req.category;

  category.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(category);
    }
  });
};

/**
 * List of Categorys
 */
exports.list = function (req, res) {
  Category.find().sort('-created').exec()
    .then(categorys => {
      if (categorys.length === 0) return res.jsonp(categorys);
      var length = categorys.length;
      var counter = 0;
      categorys.forEach(function (instance, index, array) {
        array[index] = instance.toObject();
        count_polls_by_categoryId(array[index]._id)
          .then(result => {
            array[index].count = result || 0;
            if (++counter === length) {
              res.jsonp(categorys);
            }
          })
          .catch(err => {
            handleError(err);
          });
      });
    }, handleError);
  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * List of Categorys
 */
exports.count_polls = function (req, res) {
  Poll.find({ category: req.category._id }).count(function (err, count) {
    res.jsonp(count);
  });
};
/**
 * List of Categorys
 */
exports.polls = function (req, res) {
  var page = req.params.page || 0;
  var sort = req.params.sort || '-created';
  Poll.find({ category: req.category._id, isPublic: true })
    .sort(sort)
    .populate('user', 'displayName profileImageURL').skip(10 * page)
    .limit(10).exec()
    .then(polls => {
      if (polls.length === 0) return res.jsonp(polls);
      var length = polls.length;
      var counter = 0;
      polls.forEach(function (instance, index, array) {
        array[index] = instance.toObject();
        // Lấy thông tin count
        pollController.get_info_by_pollId(array[index]._id)
          .then(result => {
            array[index].report = result || {};
            return pollController.get_opts_by_pollId(array[index]._id);
          })
          // Lấy các options
          .then(result => {
            array[index].opts = _.filter(result, { status: 1 }) || [];
            return pollController.get_votes_by_pollId(array[index]._id);
          })
          // Lấy toàn bộ thông tin votes
          .then(result => {
            array[index].votes = result.votes || [];
            array[index].voteopts = result.voteopts || [];
            return pollController.get_follow_by_pollId(array[index]._id, userId);
          })
          // Lấy follow của user hiện hành
          .then(result => {
            array[index].follow = result || { poll: array[index]._id };
            return pollController.get_report_by_pollId(array[index]._id, userId);
          })
          // Lấy report của user hiện hành
          .then(result => {
            array[index].reported = (result) ? true : false;
            return pollController.get_bookmark_by_pollId(array[index]._id, userId);
          })
          // Lấy bookmark của user hiện hành
          .then(result => {
            array[index].bookmarked = (result) ? true : false;
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
 * Category middleware
 */
exports.categoryByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Category is invalid'
    });
  }

  Category.findById(id).populate('user', 'displayName').exec(function (err, category) {
    if (err) {
      return next(err);
    } else if (!category) {
      return res.status(404).send({
        message: 'No Category with that identifier has been found'
      });
    }
    req.category = category;
    next();
  });
};

/**
 * Đếm số poll trong category
 */
function count_polls_by_categoryId(categoryId) {
  return new Promise((resolve, reject) => {
    Poll.find({ category: categoryId }).count(function (err, count) {
      if (err) {
        return reject(err);
      } else {
        return resolve(count);
      }
    });
  });
}
