const {Schema, model} = require('mongoose');

const userScheme = new Schema({
    email: {
        type: String,
        required: true
    },
    daily: {
        type: Boolean,
        required: true
    },
    workingDay: {
        type: Boolean,
        required: true
    },
    weekly: {
        type: Boolean,
        required: true
    },
    monthly: {
        type: Boolean,
        required: true
    },
    unsubscribe: {
        type: Boolean,
        required: true
    },
    // accessToken: {
    //     type: String,
    //     required: true
    // },
    // storeHash: {
    //     type: String,
    //     required: true
    // },
    // clientID: {
    //     type: String,
    //     required: true
    // }
})

module.exports = model('User', userScheme)
