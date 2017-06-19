'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Polltag Schema
 */
var PolltagSchema = new Schema({
  poll: {
    type : Schema.ObjectId,
    ref : 'Poll',
    required: 'Please fill Poll info'
  },
  tag: {
    type : Schema.ObjectId,
    ref : 'Tag',
    required: 'Please fill Tag info'
  }
});

mongoose.model('Polltag', PolltagSchema);
