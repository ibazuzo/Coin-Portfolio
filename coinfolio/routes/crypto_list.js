var express = require("express");
var router = express.Router();
var db = require("../models");
var helpers = require("../helpers/help_functions");

router.route('/')
    .get(helpers.getCryptoList)
    .post(helpers.newEntry);

router.route('/:cryptoId')
    .get(helpers.getEntry)
    .put(helpers.updateEntry)
    .delete(helpers.deleteEntry);

module.exports = router;