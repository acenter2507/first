'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * View Schema
 */
var TicketSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  email: {
    type: 'String',
    default: '',
    required: 'Please fill Ticket email',
  },
  body: {
    type: 'String',
    default: '',
    required: 'Please fill Ticket body',
  },
  status: {
    type: Number,
    default: 1
  }
});

mongoose.model('Ticket', TicketSchema);