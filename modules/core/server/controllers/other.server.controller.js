'use strict';

var mongoose = require('mongoose'),
  Ticket = mongoose.model('Ticket');


/**
 * Ticket
 */
exports.ticket = function (req, res) {
  var ticket = new Ticket(req.body);
  ticket.save((err, _ticket) => {
    if (err) return res.status(400).send({ message: 'LB_SUPPORT_ERROR' });
    return res.jsonp(_ticket);
  });
};
