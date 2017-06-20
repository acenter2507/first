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
  only_member: {
    type: Boolean,
    default: false
  },
  allow_add: {
    type: Boolean,
    default: false
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  viewCnt: {
    type: 'Number',
    default: 0
  },
  opts: [{ type: Schema.ObjectId, ref: 'Opt' }],
  voteCnt: {
    type: 'Number',
    default: 0
  },
  cmtCnt: {
    type: 'Number',
    default: 0
  },
  likeCnt: {
    type: 'Number',
    default: 0
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
    required: false
  }
});

PollSchema.pre('save', function(next) {
  this.summary = (this.body.length > 255) ? this.body.substring(0, 254) : this.body;
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

PollSchema.statics.findVotes = function(id, callback) {
  return this.model('Vote').find({
    poll: id
  }, callback);
};

PollSchema.statics.findTags = function(id, callback) {
  return this.model('Polltag').find({
    poll: id
  }, callback);
};

PollSchema.statics.findOwnerVote = function(condition, callback) {
  return this.model('Vote').findOne(condition, callback);
};

PollSchema.statics.countUpVote = function(id, callback) {
  return this.findById(id).exec(function(err, poll) {
    poll.voteCnt += 1;
    return poll.save();
  });
};
mongoose.model('Poll', PollSchema);
