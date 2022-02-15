'use strict';
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const csvWriter = require('csv-write-stream');
require('dotenv').config();
const mongoose = require('mongoose');
const fetch = require('node-fetch');
const User = require('./schema');
const transporter = require('./lib/nodemailer');
const logger = require('./configs/logger');
const jobDaily = require('./cron/job-daily');
const workingDay = require('./cron/job-workingDay');
const weekly = require('./cron/job-weekly');
const monthly = require('./cron/job-monthly');
const BigCommerce = require('node-bigcommerce');
const {CronJob} = require("cron");

const connectToMongo = async() => {
    await mongoose.connect(process.env.URL, { useUnifiedTopology: true, useNewUrlParser: true}, function(err){
        if(err) {
            logger.info(`Error(Connect mongodb): ${err}`);
        }
    });
    logger.info(`Mongoose connect`);
    return mongoose;
};
connectToMongo();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({limit: '50mb'}));

app.get('/', (req, res) => {
    res.status(200).send("Express heroku app");
});

app.post( "/send", cors(), async ( req, res ) => {
    const data = req.body.dataSCV;
    const writerExport = csvWriter({});
    writerExport.pipe(fs.createWriteStream('file.csv'));
    data.map((el)=>{
        writerExport.write(el);
    })
    writerExport.end();
    logger.info(`Created file BigCommerce-import-products.csv`);

    // send mail with defined transport object
   const info = await transporter.sendMail({
       from: 'StockAssistant@friendsofcommerce.com',
       to: req.body.formEmail.email,
       subject: "BigCommerce import products",
       text: "You can download the file.csv attached below.",
       html: "<strong>You can download the file.csv attached below.</strong>",
       headers: { 'x-myheader': 'test header' },
       attachments: [
           {
               path: './file.csv'
           }
       ]
   });
   logger.info(`Send mail: ${info.response}`);
   res.status(201).send("File created and uploaded successfully ");
});

app.post('/subscribe', cors(),async (req, res) => {

await User.find({email: req.body.form.email})
    .then((data)=>{
        if(data.length === 0) {
            User.create({
                email: req.body.form.email,
                cronTime: req.body.cronTime,
                timeZone: req.body.timeZone,
                accessToken: req.body.accessToken,
                storeHash: req.body.storeHash,
                clientID: req.body.clientID,
                unsubscribe: req.body.form.unsubscribe,
            },
            function(err, doc){
                if(err) {
                    res.status(400).send("Error created user");
                    return logger.info(`Error(Created user): ${err}`);
                }
                const job = new CronJob(req.body.cronTime, async function() {
                    console.log('CronJob!!!: req.body', req.body.form.email);
                    new BigCommerce({
                        clientId: req.body.clientID,
                        accessToken: req.body.accessToken,
                        storeHash: req.body.storeHash,
                        responseType: 'json',
                        apiVersion: 'v3' // Default is v2
                    }).get('/catalog/products?include=variants')
                        .then(async (data) => {
                            const dataImportProduct = [];
                            data.data.forEach((el)=>{
                                dataImportProduct.push(...el.variants);
                            })
                            const writerExport = csvWriter({});
                            writerExport.pipe(fs.createWriteStream(`${req.body.form.email}BigCommerce-import-products.csv`));
                            dataImportProduct.map((el)=>{
                                writerExport.write(el);
                            })
                            writerExport.end();
                            logger.info(`Created file BigCommerce-import-products.csv`);
                            // send mail with defined transport object
                            const info = await transporter.sendMail({
                                from: 'Stock Assistant Inventory Report <StockAssistant@friendsofcommerce.com>',
                                to: req.body.form.email,
                                subject: "Stock Assistant - BigCommerce Inventory Report",
                                text: "You can download the file.csv attached below.",
                                html: "<strong>As requested, find attached here is your Inventory Report! </strong>",
                                headers: { 'x-myheader': 'test header' },
                                attachments: [
                                    {
                                        path: `${req.body.form.email}BigCommerce-import-products.csv`
                                    }
                                ]
                            });
                            logger.info(`Send mail: ${info.response}`);
                        })
                }, null, true, req.body.timeZone);
                job.start();
                logger.info(`Created user: ${doc.email}`);
                res.status(201).send("User created");
            });
        } else {
            if(req.body.form.unsubscribe === true) {
                User.deleteMany({ email: req.body.form.email })
                    .then((res) => {
                        logger.info(`Delete user: ${req.body.form.email}`);
                        res.status(200).send("User deleted");
                    })
                    .catch((err) => {
                        logger.info(`Error(Delete user): ${err}`);
                        res.status(400).send("Error delete user");
                    })
            } else {
                console.log('updateOne: req.body.form.email', req.body.form.email)
                User.updateOne({ email: req.body.form.email }, { $set: req.body } )
                    .then((res) => {
                        logger.info(`Update user: ${req.body.form.email}`);
                        res.status(204).send("User updated");
                    })
                    .catch((err) => {
                        logger.info(`Error(update users): ${err}`);
                        res.status(400).send("Error update user");
                    })
            }
        }
    })
});

// start the Express server
app.listen(process.env.PORT || 8080, () => {
    console.log('Server started at');
    logger.info('Server started at');
    jobDaily();
});