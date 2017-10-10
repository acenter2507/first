'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema;

/**
 * Follow Schema
 */
var FollowSchema = new Schema({
  user: { type: Schema.ObjectId, ref: 'User' },
  poll: { type: Schema.ObjectId, ref: 'Poll' },
  created: { type: Date, default: Date.now }
});
FollowSchema.plugin(paginate);

mongoose.model('Follow', FollowSchema);
