'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Poll Schema
 */
var PollSchema = new Schema({
  title: {
    type: String,
    default: '',
    required: 'Please fill Poll title',
    trim: true
  },
  body: {
    type: String,
    default: '',
    required: 'Please fill Poll body',
    trim: true
  },
  is_add_opt: {
    type: Boolean,
    default: false
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  viewCount: {
    type: 'Number',
    default: 0
  },
  options: [{ type: Schema.ObjectId, ref: 'Option' }],
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  },
  closed: {
    type: 'Date',
    required: false
  }
});

mongoose.model('Poll', PollSchema);