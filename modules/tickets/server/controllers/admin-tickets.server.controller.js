'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Ticket = mongoose.model('Ticket'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash'),
  _moment = require('moment'),
  config = require(path.resolve('./config/config')),
  mail = require(path.resolve('./config/lib/mail'));


/**
 * Show the current Ticket
 * 
 */
exports.read = function (req, res) {
  res.jsonp(req.ticket);
};

exports.getTickets = function (req, res) {
  console.log('get tickets');
  var page = req.body.page || 1;
  var condition = req.body.condition || {};
  var sort = condition.sort || '-created';
  var and_arr = [];
  var query = {};
  if (condition.search && condition.search !== '') {
    and_arr.push({ email: { $regex: '.*' + condition.search + '.*' } });
  }

  if (condition.status) {
    and_arr.push({ status: condition.status });
  }

  if (condition.created) {
    var today = new _moment(condition.created).utc().startOf('day');
    var tomorrow = new _moment(today).add(1, 'days');
    console.log(today);
    and_arr.push({
      date: {
        $gte: today.toDate(),
        $lt: tomorrow.toDate()
      }
    });
  }

  if (and_arr.length > 0) {
    query = { $and: and_arr };
  }

  Ticket.paginate(query, {
    sort: sort,
    page: page,
    limit: 10
  }).then(function (users) {
    console.log(users);
    res.jsonp(users);
  });
};

exports.send = function (req, res) {
  var responseBody = req.body.responseBody;
  var ticket = req.ticket;
  ticket.responseBody = responseBody;
  console.log(ticket);
  if (responseBody !== '') {
    ticket.save(function (err) {
      if (err) return handleError(err);

      var mailTemplate = 'ticket';
      var mailContent = {
        name: ticket.email,
        reponseBody: ticket.responseBody,
        appName: config.app.title,
        //url: url
      };

      var subject = 'Support';
      var mailOptions = {
        from: config.app.title + '<' + config.mailer.account.from + '>',
        to: ticket.email,
        subject: subject
      };
     
      mail.send(config.mailer.account.options, mailContent, mailOptions, mailTemplate)
        .then(() => {
          ticket.status = 0;
          ticket.save(function (err) {
            if (err) return handleError(err);
            return res.jsonp(ticket); //format codeok
          });

        })
        .catch(handleError);
    });
  }

  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * Update a Ticket
 * day la function o server dc roi do, chinh code lai roi chay thu
 */
exports.update = function (req, res) {

};

/**
 * Delete an Ticket
 */
exports.delete = function (req, res) {
  var ticket = req.ticket;

  ticket.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(ticket);
    }
  });
};

/**
 * List of Tickets
 */
exports.tickets_list = function (req, res) {
  Ticket.find().sort('-created').exec(function (err, tickets) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(tickets);
    }
  });
};

/**
 * Ticket middleware
 */
exports.ticketByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Ticket is invalid'
    });
  }

  Ticket.findById(id).populate('user', 'displayName').exec(function (err, ticket) {
    if (err) {
      return next(err);
    } else if (!ticket) {
      return res.status(404).send({
        message: 'No Ticket with that identifier has been found'
      });
    }
    req.ticket = ticket;
    next();
  });
};
