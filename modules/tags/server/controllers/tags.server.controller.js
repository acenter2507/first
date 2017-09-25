'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  config = require(path.resolve('./config/config')),
  Tag = mongoose.model('Tag'),
  Polltag = mongoose.model('Polltag'),
  Polltag = mongoose.model('Polltag'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');
var pollController = require(path.resolve('./modules/polls/server/controllers/polls.server.controller'));

/**
 * Create a Tag
 */
exports.create = function (req, res) {
  var tag = new Tag(req.body);
  tag.user = req.user;

  tag.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(tag);
    }
  });
};

/**
 * Show the current Tag
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var tag = req.tag ? req.tag.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  tag.isCurrentUserOwner = req.user && tag.user && tag.user._id.toString() === req.user._id.toString();
  res.jsonp(tag);
};

/**
 * Update a Tag
 */
exports.update = function (req, res) {
  var tag = req.tag;

  tag = _.extend(tag, req.body);

  tag.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(tag);
    }
  });
};

/**
 * Delete an Tag
 */
exports.delete = function (req, res) {
  var tag = req.tag;

  tag.remove()
    .then(() => {
      return Polltag.remove({ tag: tag._id });
    }, handleError)
    .then(() => {
      res.jsonp(tag);
    }, handleError);

  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * List of Tags
 */
exports.list = function (req, res) {
  Tag.find().exec()
    .then(tags => {
      if (tags.length === 0) return res.jsonp(tags);
      var length = tags.length;
      var counter = 0;
      tags.forEach(function (instance, index, array) {
        array[index] = instance.toObject();
        count_polls_by_tagId(array[index]._id)
          .then(result => {
            array[index].count = result || 0;
            if (++counter === length) {
              res.jsonp(tags);
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
 * Tag middleware
 */
exports.tagByID = function (req, res, next, id) {

  var query = { $or: [{ slug: id }] };
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    query.$or.push({ _id: id });
  }

  Tag.findOne(query).populate('user', 'displayName slug').exec(function (err, tag) {
    if (err) {
      return res.status(400).send({
        message: 'Tag is invalid'
      });
    } else if (!tag) {
      return res.status(404).send({
        message: 'No Tag with that identifier has been found'
      });
    }
    req.tag = tag;
    next();
  });
};

exports.popular = function (req, res) {
  Tag.find().exec()
    .then(tags => {
      if (tags.length === 0) return res.jsonp(tags);
      var length = tags.length;
      var counter = 0;
      tags.forEach(function (instance, index, array) {
        array[index] = instance.toObject();
        count_polls_by_tagId(array[index]._id)
          .then(result => {
            array[index].count = result || 0;
            if (++counter === length) {
              tags = _.sortByOrder(tags, ['count'], ['desc']);
              tags = tags.splice(0, 10);
              res.jsonp(tags);
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
 * List poll su dung tag
 */
exports.polls = function (req, res) {
  var userId = req.user ? req.user._id : undefined;
  var page = req.params.page || 0;
  var language = req.params.language || config.mappingLanguages[req.locale];
  var sort = req.params.page || '-created';
  get_polls_by_tagId(req.tag._id, page, language)
    .then(polls => {
      if (polls.length === 0) return res.jsonp(polls);
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
    })
    .catch(handleError);

  function handleError(err) {
    console.log(err);
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};
/**
 * Đếm số poll trong tag
 */
function get_polls_by_tagId(tagId, page, language) {
  return new Promise((resolve, reject) => {
    Polltag.find({ tag: tagId })
      .populate({
        path: 'poll',
        model: 'Poll',
        match: { language: language },
        populate: [
          { path: 'user', select: 'displayName profileImageURL slug', model: 'User' },
          { path: 'category', select: 'name icon slug', model: 'Category' }
        ]
      })
      .skip(10 * page).limit(10)
      .exec((err, polltags) => {
        if (err) {
          return reject(err);
        } else {
          console.log(polltags);
          var polls = _.pluck(polltags, 'poll');
          return resolve(polls);
        }
      });
  });
}

/**
 * Đếm số poll trong tag
 */
function count_polls_by_tagId(tagId) {
  return new Promise((resolve, reject) => {
    Polltag.find({ tag: tagId })
      .count(function (err, count) {
        if (err) {
          return reject(err);
        } else {
          return resolve(count);
        }
      });
  });
}
