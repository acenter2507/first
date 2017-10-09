'use strict';

/**
 * Module dependencies
 */
var pollsPolicy = require('../policies/polls.server.policy'),
  polls = require('../controllers/polls.server.controller'),
  admin_polls = require('../controllers/admin-polls.server.controller');

module.exports = function(app) {
  // Upload image
  app.route('/api/polls/images').all(pollsPolicy.isAllowed).post(polls.images_upload);
  // Polls Routes
  app.route('/api/polls').all(pollsPolicy.isAllowed)
    .get(polls.list)
    .post(polls.create);

  app.route('/api/polls/:pollId').all(pollsPolicy.isAllowed)
    .get(polls.read)
    .put(polls.update)
    .delete(polls.delete);

  // Lấy danh sách poll cho màn hình polls.list
  app.route('/api/loadPolls/:page/:language').get(polls.loadPolls);
  // Lấy danh sách poll nổi bật cho màn hình polls.list
  app.route('/api/findPopulars/:page/:language').get(polls.findPopulars);
  // Lấy thông tin của user hiện hành đối với poll cho màn hình polls.view
  app.route('/api/findOwners/:pollId').get(polls.findOwners);
  // Load comment cho màn hình poll.view theo page
  app.route('/api/loadComments/:pollId/:page/:sort').get(polls.loadComments);
  // Tăng biến đếm lượt view của poll
  app.route('/api/countUpView/:pollId').get(polls.countUpView);
  // Load thông tin vote của 1 poll
  app.route('/api/findVotes/:pollId').get(polls.findVotes);
  // Lấy danh sách đã vote cho 1 option
  app.route('/api/findVotesByOption/:optId').get(polls.findVotesByOption);
  // Xóa 1 poll ra khỏi list bookmark
  app.route('/api/removeBookmark/:pollId').get(polls.removeBookmark);
  // Chức năng search
  app.route('/api/search').post(polls.search);

  // ADMIN
  app.route('/api/polls/admin/search').all(pollsPolicy.isAllowed)
    .post(admin_polls.search);
  app.route('/api/polls/admin/report').all(pollsPolicy.isAllowed)
    .post(admin_polls.report);

  // Finish by binding the Poll middleware
  app.param('pollId', polls.pollByID);
};
