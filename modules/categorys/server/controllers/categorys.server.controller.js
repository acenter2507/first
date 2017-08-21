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
 * Create a Category (Chỉ admin)
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
 * Show the current Category (Chỉ admin)
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var category = req.category ? req.category.toJSON() : {};
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
 * Update a Category (Chỉ admin)
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
 * Delete an Category (Chỉ admin)
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
 * List of Categorys (Dùng chung cho cả admin và public)
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
 * List of Categorys (Dùng chung cho cả admin và public)
 */
exports.count_polls = function (req, res) {
  Poll.find({ category: req.category._id }).count(function (err, count) {
    res.jsonp(count);
  });
};
/**
 * List of Categorys (Dùng chung cho cả admin và public)
 */
exports.polls = function (req, res) {
  var page = req.params.page || 0;
  var sort = req.params.sort || '-created';
  var userId = req.user ? req.user._id : undefined;
  Poll.find({ category: req.category._id, isPublic: true })
    .sort(sort)
    .populate('user', 'displayName profileImageURL slug').skip(10 * page)
    .limit(10).exec()
    .then(polls => {
      if (polls.length === 0) return res.jsonp(polls);
      var length = polls.length;
      var counter = 0;
      polls.forEach(function (instance, index, array) {
        array[index] = instance.toObject();
        // Lấy thông tin count
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
 * Category middleware (Dùng chung cho cả admin và public)
 */
exports.categoryByID = function (req, res, next, id) {

  var query = { $or: [{ slug: id }] };
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    query.$or.push({ _id: id });
  }

  Category.findOne(query).populate('user', 'displayName slug').exec(function (err, category) {
    if (err) {
      return res.status(400).send({
        message: 'Category is invalid'
      });
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
