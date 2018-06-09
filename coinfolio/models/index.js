//Connection to Mongo database
var mongoose = require('mongoose');

mongoose.set('debug', true);
mongoose.connect('mongodb://localhost/crypto-api');

mongoose.Promise = Promise;

module.exports.Crypto = require("./crypto");