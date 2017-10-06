'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema;

/**
 * Report Schema
 */
var ReportSchema = new Schema({
  poll: { type : Schema.ObjectId, ref : 'Poll' },
  victim: { type: Schema.ObjectId, ref: 'User' },
  reason: { type: String, default: '' },
  created: { type: Date, default: Date.now },
  user: { type: Schema.ObjectId, ref: 'User' }
});
ReportSchema.plugin(paginate);

mongoose.model('Report', ReportSchema);
