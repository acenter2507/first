'use strict';

/**
 * Module dependencies
 */
var adminPolicy = require('../policies/admin-tickets.server.policy'),
  adminTickets = require('../controllers/admin-tickets.server.controller');

module.exports = function (app) {
  // Get list tickets admin
  app.route('/api/tickets')
    .get(adminPolicy.isAllowed, adminTickets.tickets_list);

  app.route('/api/tickets/:ticketId')
    .get(adminPolicy.isAllowed, adminTickets.read)
    .put(adminPolicy.isAllowed, adminTickets.update)
    .delete(adminPolicy.isAllowed, adminTickets.delete);

  app.route('/api/tickets/:ticketId/send')
    .post(adminPolicy.isAllowed, adminTickets.send);

  app.route('/api/tickets/search')
    .post(adminPolicy.isAllowed, adminTickets.getTickets);

  // Finish by binding the Ticket middleware
  app.param('ticketId', adminTickets.ticketByID);
};
