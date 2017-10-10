'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Ticket = mongoose.model('Ticket'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Ticket
 */
exports.create = function (req, res) {
  var ticket = new Ticket(req.body);
  ticket.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: 'LB_SUPPORT_ERROR'
      });
    } else {
      res.jsonp(ticket);
    }
  });
};

// /**
//  * Show the current Ticket
//  */
// exports.read = function (req, res) {
//   res.jsonp(req.ticket);
// };

// /**
//  * Update a Ticket
//  */
// exports.update = function (req, res) {
//   var ticket = req.ticket;

//   ticket = _.extend(ticket, req.body);

//   ticket.save(function (err) {
//     if (err) {
//       return res.status(400).send({
//         message: errorHandler.getErrorMessage(err)
//       });
//     } else {
//       res.jsonp(ticket);
//     }
//   });
// };

// /**
//  * Delete an Ticket
//  */
// exports.delete = function (req, res) {
//   var ticket = req.ticket;

//   ticket.remove(function (err) {
//     if (err) {
//       return res.status(400).send({
//         message: errorHandler.getErrorMessage(err)
//       });
//     } else {
//       res.jsonp(ticket);
//     }
//   });
// };

// /**
//  * List of Tickets
//  */
// exports.list = function (req, res) {
//   Ticket.find().sort('-created').exec(function (err, tickets) {
//     if (err) {
//       return res.status(400).send({
//         message: errorHandler.getErrorMessage(err)
//       });
//     } else {
//       res.jsonp(tickets);
//     }
//   });
// };

// /**
//  * Ticket middleware
//  */
// exports.ticketByID = function (req, res, next, id) {

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(400).send({
//       message: 'Ticket is invalid'
//     });
//   }

//   Ticket.findById(id).populate('user', 'displayName').exec(function (err, ticket) {
//     if (err) {
//       return next(err);
//     } else if (!ticket) {
//       return res.status(404).send({
//         message: 'No Ticket with that identifier has been found'
//       });
//     }
//     req.ticket = ticket;
//     next();
//   });
// };
