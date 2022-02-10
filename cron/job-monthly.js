'use strict';
const CronJob = require('cron').CronJob;

module.exports = function monthly () {
    console.log('module.exports module.exports');
    const job = new CronJob('* * * * * *', function() {
        console.log('You will see this message every second: monthly');
    }, null, true, 'America/Los_Angeles');
    job.start();
}