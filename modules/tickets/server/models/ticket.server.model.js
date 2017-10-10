'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema;

/**
 * Ticket Schema
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
  },
  date: {
    type: Date
  },
  responseBody: {
    type: 'String',
    default: '',
    
  },
});
TicketSchema.plugin(paginate);
mongoose.model('Ticket', TicketSchema);
