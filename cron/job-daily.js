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
                response.forEach(async (el)=>{
                    const job = new CronJob(el.cronTime, async function() {
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
                                from: 'StockAssistant@friendsofcommerce.com',
                                to: el.email,
                                subject: "BigCommerce import products (daily)",
                                text: "You can download the file.csv attached below.",
                                html: "<strong>Daily distribution of the product catalog (inventory) in BigCommerce. You can download the file attached below </strong>",
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
            // .then((data)=>{
            //     data.map((element) => {
            //         new BigCommerce({
            //             clientId: element.clientID,
            //             accessToken: element.accessToken,
            //             storeHash: element.storeHash,
            //             responseType: 'json',
            //             apiVersion: 'v3' // Default is v2
            //         }).get('/catalog/products?include=variants')
            //             .then(async (data) => {
            //             })
            //     })
            // })
    // }, null, true, 'America/Los_Angeles');
    // job2.start();

    // const job = new CronJob('10 3 * * *', async function() {
    //     await User.find({daily: true})
    //         .then((response)=>{
    //             const data = [];
    //             response.forEach((el) => {
    //                 data.push({email: el.email, accessToken: el.accessToken, storeHash: el.storeHash, clientID: el.clientID});
    //             })
    //             return data
    //         })
    //         .then((data)=>{
    //             console.log('data', data);
    //             data.map((element) => {
    //                 // console.log('element', element);
    //                 new BigCommerce({
    //                     clientId: element.clientID,
    //                     accessToken: element.accessToken,
    //                     storeHash: element.storeHash,
    //                     responseType: 'json',
    //                     apiVersion: 'v3' // Default is v2
    //                 }).get('/catalog/products?include=variants')
    //                     .then(async (data) => {
    //                         const dataImportProduct = [];
    //                         data.data.forEach((el)=>{
    //                             dataImportProduct.push(...el.variants);
    //                         })
    //                         const writerExport = csvWriter({});
    //                         writerExport.pipe(fs.createWriteStream(`${element.email}BigCommerce-import-products.csv`));
    //                         dataImportProduct.map((el)=>{
    //                             writerExport.write(el);
    //                         })
    //                         writerExport.end();
    //                         logger.info(`Created file BigCommerce-import-products.csv`);
    //                         // send mail with defined transport object
    //                         const info = await transporter.sendMail({
    //                             from: 'StockAssistant@friendsofcommerce.com',
    //                             to: element.email,
    //                             subject: "BigCommerce import products (daily)",
    //                             text: "You can download the file.csv attached below.",
    //                             html: "<strong>Daily distribution of the product catalog (inventory) in BigCommerce. You can download the file attached below </strong>",
    //                             headers: { 'x-myheader': 'test header' },
    //                             attachments: [
    //                                 {
    //                                     path: `${element.email}BigCommerce-import-products.csv`
    //                                 }
    //                             ]
    //                         });
    //                         logger.info(`Send mail: ${info.response}`);
    //                     })
    //             })
    //         })
    //     logger.info(`Cron (job daily)`);
    // }, null, true, 'America/Los_Angeles');
    // job.start();
}