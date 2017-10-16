'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema;

/**
 * Cmt Schema
 */
var CmtSchema = new Schema({
  body: { type: String, required: 'Please fill Comment body', trim: true },
  poll: { type: Schema.ObjectId, ref: 'Poll' },
  created: { type: Date, default: Date.now },
  user: { type: Schema.ObjectId, ref: 'User' },
  replies: [
    {
      
    }
  ],
  to: { type: Schema.ObjectId, ref: 'User' },
  toName: { type: String, default: '' },
  toSlug: { type: String, default: '' },
  updated: { type: Date, default: Date.now },
  isEdited: { type: Boolean, default: false },
  likeCnt: { type: Number, default: 0 }
});
CmtSchema.plugin(paginate);

CmtSchema.pre('save', function (next) {
  next();
});

CmtSchema.statics.countLike = function (id, cnt, callback) {
  return this.findOne({ _id: id }).exec(function (err, cmt) {
    if (cmt) {
      cmt.likeCnt += cnt;
      return cmt.save();
    } else {
      console.log('Error!: Not found cmt with ID: ' + id);
    }
  });
};

mongoose.model('Cmt', CmtSchema);
