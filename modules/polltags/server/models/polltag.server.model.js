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
  name: {
    type: String,
    default: '',
    required: 'Please fill Polltag name',
    trim: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Polltag', PolltagSchema);
