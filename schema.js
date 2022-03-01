const {Schema, model} = require('mongoose');

const userScheme = new Schema({
    email: {
        type: String,
        required: true
    },
    unsubscribe: {
        type: Boolean,
        required: true
    },
    cronTime: {
        type: String,
        required: true
    },
    timeZone: {
        type: String,
        required: true
    },
    accessToken: {
        type: String,
        required: true
    },
    storeHash: {
        type: String,
        required: true
    },
    clientID: {
        type: String,
        required: true
    },
    crontTimeType: {
        type: String
    }
})

module.exports = model('User', userScheme)
