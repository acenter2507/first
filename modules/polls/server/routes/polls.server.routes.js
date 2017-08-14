'use strict';

/**
 * Module dependencies
 */
var pollsPolicy = require('../policies/polls.server.policy'),
  polls = require('../controllers/polls.server.controller'),
  admin_polls = require('../controllers/admin-polls.server.controller');

module.exports = function(app) {
  // Polls Routes
  app.route('/api/polls').all(pollsPolicy.isAllowed)
    .get(polls.list)
    .post(polls.create);

  app.route('/api/polls/:pollId').all(pollsPolicy.isAllowed)
    .get(polls.read)
    .put(polls.update)
    .delete(polls.delete);

  // Lấy danh sách poll cho màn hình polls.list
  app.route('/api/findPolls/:page').get(polls.findPolls);
  // Lấy danh sách poll nổi bật cho màn hình polls.list
  app.route('/api/findPopulars/:page').get(polls.findPopulars);
  // Lấy thông tin của user hiện hành đối với poll cho màn hình polls.view
  app.route('/api/findOwners/:pollId').get(polls.findOwners);
  // Load comment cho màn hình poll.view theo page
  app.route('/api/findCmts/:pollId/:page').get(polls.findCmts);

  app.route('/api/countUpView/:pollId').get(polls.countUpView);

  app.route('/api/findVoteopts/:pollId').get(polls.findVoteopts);
  app.route('/api/removeBookmark/:pollId').get(polls.removeBookmark);
  app.route('/api/search').post(polls.search);

  // ADMIN
  app.route('/api/polls/admin/search').all(pollsPolicy.isAllowed)
    .post(admin_polls.search);
  app.route('/api/polls/admin/report').all(pollsPolicy.isAllowed)
    .post(admin_polls.report);


  // app.route('/api/findOwnerVote/:pollId').get(polls.findOwnerVote);
  // app.route('/api/findVotes/:pollId').get(polls.findVotes);
  // app.route('/api/findTags/:pollId').get(polls.findTags);
  // app.route('/api/findPollLike/:pollId').get(polls.findPollLike);
  // app.route('/api/findPolluser/:pollId').get(polls.findPolluser);
  // app.route('/api/findOpts/:pollId').get(polls.findOpts);
  // app.route('/api/findReport/:pollId').get(polls.findReport);
  // app.route('/api/findBookmark/:pollId').get(polls.findBookmark);
  // app.route('/api/findPollreport/:pollId').get(polls.findPollreport);
  // app.route('/api/findView/:pollId').get(polls.findView);

  // Finish by binding the Poll middleware
  app.param('pollId', polls.pollByID);
};
