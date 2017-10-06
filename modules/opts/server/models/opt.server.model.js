'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema;

/**
 * Opt Schema
 */
var OptSchema = new Schema({
  title: { type : String, required: 'Please fill Option title', trim : true },
  body: { type : String, default : '', trim : true },
  poll: { type : Schema.ObjectId, ref : 'Poll', required: 'Please fill Poll info', },
  user: { type: Schema.ObjectId, ref: 'User' },
  color: { type : String, default : '#267ed5' },
  status: { type : Number, default : 1 }, // 1: Approved, 2: Waiting, 3: Rejected 
  created: { type: Date, default: Date.now },
  // Thêm mới khi làm chức năng admin (2017/10/06)
  isSuggest: { type: Boolean, default: false }
});
OptSchema.plugin(paginate);
mongoose.model('Opt', OptSchema);
