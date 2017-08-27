'use strict';

var CronJob = require('cron').CronJob;

var test_job = new CronJob({
  cronTime: '00 1 * * * *',
  onTick: function() {
    console.log('Job running');
  },
  start: false,
  timeZone: 'Asia/Tokyo'
});
// var rank_user_job = new CronJob({
//   cronTime: '00 30 11 * * 0',
//   onTick: function() {
//     /*
//      * Runs every Sunday at 11:30:00 AM
//      */

//   },
//   start: false,
//   timeZone: 'America/Los_Angeles'
// });
function start() {
  test_job.start();
}
exports.start = start;