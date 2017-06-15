'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

let getTags = tags => tags.join(',');
let setTags = tags => tags.split(',');

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
  tags: { 
    type: [],
    get: getTags,
    set: setTags
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
  opts: [{ type: Schema.ObjectId, ref: 'Opt' }],
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  },
  close: {
    type: 'Date',
    required: false
  }
});

mongoose.model('Poll', PollSchema);