var mongoose = require("mongoose");

var cryptoSchema = new mongoose.Schema({
    coin: {
        name: {
            type: String,
            required: 'Required'
        },
        quantity: {
            type: Number,
            required: 'Required'
        },
        bought_date: {
            type: Date,
            default: Date.now
        },
        bought_price: {
            type: Number
        },
        wallet_address: {
            type: String
        }
    }
})

// Create database schema
var Crypto = mongoose.model('Crypto', cryptoSchema);

// Export database schema
module.exports = Crypto;