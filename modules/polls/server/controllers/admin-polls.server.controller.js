'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Poll = mongoose.model('Poll'),
  Polluser = mongoose.model('Polluser'),
  Report = mongoose.model('Report'),
  Bookmark = mongoose.model('Bookmark'),
  Like = mongoose.model('Like'),
  errorHandler = require(path.resolve(
    './modules/core/server/controllers/errors.server.controller'
  )),
  _ = require('lodash'),
  __ = require('underscore'),
  _moment = require('moment');
var pollController = require(path.resolve('./modules/core/server/controllers/polls.server.controller'));

/**
 * Search Polls
 */
exports.search = function (req, res) {
  const condition = req.body.condition;
  var search = condition_analysis(condition);
  var sort = condition.sort || '-created';
  Poll.find(search)
    .populate('category', 'name')
    .populate('user', 'displayName profileImageURL')
    .sort(sort).exec()
    .then(polls => {
      if (polls.length === 0) return res.jsonp(polls);
      var length = polls.length;
      var counter = 0;
      polls.forEach(function (instance, index, array) {
        array[index] = instance.toObject();
        count_followed(array[index]._id)
          .then(result => {
            array[index].followed = result || 0;
            return count_bookmarked(array[index]._id);
          })
          .then(result => {
            array[index].bookmarked = result || 0;
            return count_reported(array[index]._id);
          })
          .then(result => {
            array[index].reported = result || 0;
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
 * Search Polls
 */
exports.report = function (req, res) {
  var pollId = req.body.pollId;
  var rs = {};
  count_followed(pollId)
    .then(result => {
      rs.followed = result || 0;
      return count_bookmarked(pollId);
    })
    .then(result => {
      rs.bookmarked = result || 0;
      return count_reported(pollId);
    })
    .then(result => {
      rs.reported = result || 0;
      return pollController.get_cmts_by_pollId(pollId);
    })
    .then(result => {
      rs.cmts = result || [];
      res.jsonp(rs);
    })
    .catch(handleError);

  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};
// Phan tich dieu kien search
function condition_analysis(condition) {
  var search = {};
  var and_arr = [];
  // Search by user
  if (condition.by) {
    and_arr.push({ user: condition.by });
  }
  if (condition.ctgr) {
    and_arr.push({ category: condition.ctgr });
  }
  if (condition.isPublic) {
    let isPublic = condition.isPublic === 'true';
    and_arr.push({ isPublic: isPublic });
  }
  if (condition.created_start) {
    let start = new _moment(condition.created_start).utc();
    and_arr.push({ created: { $gte: start } });
  }
  if (condition.created_end) {
    let end = new _moment(condition.created_end).utc();
    and_arr.push({ created: { $lt: end } });
  }
  if (condition.allow_multiple) {
    let allow_multiple = condition.allow_multiple === 'true';
    and_arr.push({ allow_multiple: allow_multiple });
  }
  if (condition.allow_add) {
    let allow_add = condition.allow_add === 'true';
    and_arr.push({ allow_add: allow_add });
  }
  if (condition.allow_guest) {
    let allow_guest = condition.allow_guest === 'true';
    and_arr.push({ allow_add: allow_guest });
  }
  if (condition.cmts && parseInt(condition.cmts)) {
    let cmtCnt = parseInt(condition.cmts);
    if (condition.cmts_pref === 'least') {
      and_arr.push({ cmtCnt: { $lt: cmtCnt } });
    } else {
      and_arr.push({ cmtCnt: { $gte: cmtCnt } });
    }
  }
  if (condition.votes && parseInt(condition.votes)) {
    let voteCnt = parseInt(condition.votes);
    if (condition.votes_pref === 'least') {
      and_arr.push({ voteCnt: { $lt: voteCnt } });
    } else {
      and_arr.push({ voteCnt: { $gte: voteCnt } });
    }
  }
  if (condition.likes && parseInt(condition.likes)) {
    let likeCnt = parseInt(condition.likes);
    if (condition.likes_pref === 'least') {
      and_arr.push({ likeCnt: { $lt: likeCnt } });
    } else {
      and_arr.push({ likeCnt: { $gte: likeCnt } });
    }
  }
  if (condition.views && parseInt(condition.views)) {
    let viewCnt = parseInt(condition.views);
    if (condition.views_pref === 'least') {
      and_arr.push({ viewCnt: { $lt: viewCnt } });
    } else {
      and_arr.push({ viewCnt: { $gte: viewCnt } });
    }
  }
  // Search by key in title
  if (condition.search && condition.search !== '') {
    and_arr.push({ $or: [{ title: { $regex: '.*' + condition.search + '.*' } }, { body: { $regex: '.*' + condition.search + '.*' } }] });
  }
  if (condition.status) {
    if (condition.status === 'infinity') {
      and_arr.push({ close: null });
    }
    if (condition.status === 'limit') {
      let now = new _moment().utc().fomart();
      and_arr.push({ $and: [{ close: { $ne: null } }, { close: { $gte: now } }] });
    }
    if (condition.status === 'closed') {
      let now = new _moment().utc().fomart();
      and_arr.push({ $and: [{ close: { $ne: null } }, { close: { $lt: now } }] });
    }
  }
  if (and_arr.length > 0) {
    search = { $and: and_arr };
  }
  return search;
}

function count_followed(pollId) {
  return new Promise((resolve, reject) => {
    Polluser.find({ poll: pollId }).count((err, cnt) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(cnt);
      }
    });
  });
}
function count_bookmarked(pollId) {
  return new Promise((resolve, reject) => {
    Bookmark.find({ poll: pollId }).count((err, cnt) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(cnt);
      }
    });
  });
}
function count_reported(pollId) {
  return new Promise((resolve, reject) => {
    Report.find({ poll: pollId }).count((err, cnt) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(cnt);
      }
    });
  });
}