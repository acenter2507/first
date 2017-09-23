'use strict';

/**
 * Module dependencies
 */
var tickets = require('../controllers/tickets.server.controller');

module.exports = function (app) {
  // Tickets Routes
  app.route('/api/tickets')
    .get(tickets.list)
    .post(tickets.create);

  app.route('/api/tickets/:ticketId')
    .get(tickets.read)
    .put(tickets.update)
    .delete(tickets.delete);

  // Finish by binding the Ticket middleware
  app.param('ticketId', tickets.ticketByID);
};
