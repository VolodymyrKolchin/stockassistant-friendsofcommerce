'use strict';
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(process.env.NODEMAILER_CLIENTID, process.env.NODEMAILER_CLIENTSECRET);
oauth2Client.setCredentials({
    refresh_token: process.env.NODEMAILER_REFRESHTOKEN
});
const accessToken = oauth2Client.getAccessToken();

module.exports = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: process.env.NODEMAILER_AUTH_USER,
        clientId: process.env.NODEMAILER_CLIENTID,
        clientSecret: process.env.NODEMAILER_CLIENTSECRET,
        refreshToken: process.env.NODEMAILER_REFRESHTOKEN,
        accessToken: accessToken
    },
    tls: {
        rejectUnauthorized: false
    }
});