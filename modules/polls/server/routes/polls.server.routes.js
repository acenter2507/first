'use strict';

/**
 * Module dependencies
 */
var pollsPolicy = require('../policies/polls.server.policy'),
  polls = require('../controllers/polls.server.controller');

module.exports = function(app) {
  // Polls Routes
  app.route('/api/polls').all(pollsPolicy.isAllowed)
    .get(polls.list)
    .post(polls.create);

  app.route('/api/polls/:pollId').all(pollsPolicy.isAllowed)
    .get(polls.read)
    .put(polls.update)
    .delete(polls.delete);

  app.route('/api/findOpts/:pollId').get(polls.findOpts);
  app.route('/api/findCmts/:pollId').get(polls.findCmts);
  app.route('/api/findTags/:pollId').get(polls.findTags);
  app.route('/api/findVotes/:pollId').get(polls.findVotes);
  app.route('/api/findOwnerVote/:pollId').get(polls.findOwnerVote);
  app.route('/api/findVoteopts/:pollId').get(polls.findVoteopts);
  app.route('/api/findPollLike/:pollId').get(polls.findPollLike);

  // Finish by binding the Poll middleware
  app.param('pollId', polls.pollByID);
};
