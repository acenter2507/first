'use strict';

var CronJob = require('cron').CronJob,
  rank_user = require('../jobs/rank-user');


var test_job = new CronJob({
  cronTime: '* * * * *',
  onTick: function() {
    rank_user.excute();
  },
  start: false,
  timeZone: 'Asia/Tokyo'
});
var rank_user_job = new CronJob({
  cronTime: '0 0 * * *', //every 24hours (every midnight)
  onTick: function() {
    rank_user.excute();
  },
  start: false,
  timeZone: 'Asia/Tokyo'
});
function start() {
  test_job.start();
}
exports.start = start;
