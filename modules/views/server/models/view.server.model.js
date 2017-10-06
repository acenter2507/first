'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema;

/**
 * View Schema
 */
var ViewSchema = new Schema({
  poll: { type: Schema.ObjectId, ref: 'Poll' },
  created: { type: Date, default: Date.now },
  user: { type: Schema.ObjectId, ref: 'User' }
});
ViewSchema.plugin(paginate);

mongoose.model('View', ViewSchema);
