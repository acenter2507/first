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

  res.jsonp(category);
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
            array[index].count = (result) || 0;
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
    .populate('user', 'displayName profileImageURL')
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
 * Function hỗ trợ
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