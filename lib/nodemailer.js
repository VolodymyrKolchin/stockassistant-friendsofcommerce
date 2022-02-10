'use strict';
const nodemailer = require("nodemailer");

module.exports = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT,
    secure: true,
    auth: {
        type: 'OAuth2',
        user: process.env.NODEMAILER_AUTH_USER,
        accessToken: process.env.NODEMAILER_AUTH_ACCESSTOKEN
    }
});