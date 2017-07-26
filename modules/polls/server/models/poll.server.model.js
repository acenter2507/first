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
  summary: {
    type: String,
    default: ''
  },
  category: {
    type: Schema.ObjectId,
    ref: 'Category'
  },
  allow_guest: {
    type: Boolean,
    default: false
  },
  allow_add: {
    type: Boolean,
    default: false
  },
  allow_multiple: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  share_code: {
    type: String,
    default: ''
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
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
    default: null
  }
});

PollSchema.pre('save', function(next) {
  this.summary = (this.body.length > 255) ? this.body.substring(0, 254) : this.body;
  this.updated = new Date();
  next();
});

PollSchema.statics.findOpts = function(id, callback) {
  return this.model('Opt').find({
    poll: id
  }, callback);
};

PollSchema.statics.findCmts = function(id, callback) {
  return this.model('Cmt').find({
    poll: id
  }, callback);
};

mongoose.model('Poll', PollSchema);
