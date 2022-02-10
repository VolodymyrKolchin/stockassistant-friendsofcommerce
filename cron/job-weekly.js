'use strict';
const CronJob = require('cron').CronJob;

module.exports = function weekly () {
    console.log('module.exports module.exports');
    const job = new CronJob('* * * * * *', function() {
        console.log('You will see this message every second: weekly');
    }, null, true, 'America/Los_Angeles');
    job.start();
}