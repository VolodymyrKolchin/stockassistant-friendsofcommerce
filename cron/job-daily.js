'use strict';
const CronJob = require('cron').CronJob;
const moment = require("moment");
const logger = require('../configs/logger');
const BigCommerce = require('node-bigcommerce');
const csvWriter = require("csv-write-stream");
const fs = require("fs");
const User = require("../schema");
const transporter = require("../lib/nodemailer");

module.exports = function jobDaily () {

console.log('User');
User.find()
    .then((response)=>{
        response.map((el)=>{
            const job = new CronJob(el.cronTime.toString(), async function() {
                console.log('CronJob: email', el.email);
                new BigCommerce({
                    clientId: el.clientID,
                    accessToken: el.accessToken,
                    storeHash: el.storeHash,
                    responseType: 'json',
                    apiVersion: 'v3' // Default is v2
                }).get('/catalog/products?include=variants')
                .then(async (data) => {
                    const dataImportProduct = [];
                    data.data.forEach((el)=>{
                        dataImportProduct.push(...el.variants);
                    })
                    const writerExport = csvWriter({});
                    writerExport.pipe(fs.createWriteStream(`${el.email}BigCommerce-import-products.csv`));
                    dataImportProduct.map((el)=>{
                        writerExport.write(el);
                    })
                    writerExport.end();
                    logger.info(`Created file BigCommerce-import-products.csv`);
                    // send mail with defined transport object
                    const info = await transporter.sendMail({
                        from: 'Stock Assistant Inventory Report <StockAssistant@friendsofcommerce.com>',
                        to: el.email,
                        subject: "Stock Assistant - BigCommerce Inventory Report",
                        text: "You can download the file.csv attached below.",
                        html: `<h3>Hello Friend</h3>
                               <p>As requested, find attached your Inventory Report.</p>
                               <p> </p>
                               <p>Stock Assistant by Friends of Commerce</p>
                               <a href='https://friendsofcommerce.com/'>Home</a>
                               <a href='https://www.linkedin.com/company/friendsofcommerce'>Linkedin</a>
                               <a href='https://twitter.com/CommerceFriends'>Twitter</a>
                               <a href="mailto:info@friendsofcommerce.com">Email Us</a>
                               <p><img src="https://stock-assistant-friendsofcomme.herokuapp.com/logo-FOC.jpeg"></p>`,
                        headers: { 'x-myheader': 'test header' },
                        attachments: [
                            {
                                path: `${el.email}BigCommerce-import-products.csv`
                            }
                        ]
                    });
                    logger.info(`Send mail: ${info.response}`);
                })
            }, null, true, el.timeZone);
            job.start();
        })
        return response;
    })
}