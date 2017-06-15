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
  only_member: {
    type: Boolean,
    default: true
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

PollSchema.statics.findVotes = function(id, callback) {
  return this.model('Vote').find({
    poll: id
  }, callback);
};
mongoose.model('Poll', PollSchema);
