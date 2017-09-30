'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Vote Schema
 */
var VoteSchema = new Schema({
  poll: { type: Schema.ObjectId, ref: 'Poll' },
  ip: { type: String, default: '' },
  guest: { type: Boolean, default: true },
  user: { type: Schema.ObjectId, ref: 'User' },
  // List option đang vote
  opts: [{ type: Schema.ObjectId, ref: 'Opt' }],
  updateCnt: { type: Number, default: 0 },
  updated: { type: Date, default: Date.now },
  created: { type: Date, default: Date.now }
});

UserSchema.statics.removeOption = function (optId) {
  this.find({
    opts: { $elemMatch: { $contains: optId } }
  }).exec(function (err, votes) {
    votes.forEach(function (vote) {
      vote.opts.pull(optId);
    });
  });
};

mongoose.model('Vote', VoteSchema);
