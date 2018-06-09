var db = require("../models");

// #Retrive all entries
exports.getCryptoList = function(req, res){
    db.Crypto.find()
    .then(function(cryptos){
        res.json(cryptos);
    })
    .catch(function(err){
        res.send(err);
    });
};

// #Add an entry in the database
exports.newEntry = function(req, res){
    db.Crypto.create(req.body)
    .then(function(newCrypto){
        res.status(201).json(newCrypto);
    })
    .catch(function(err){
        res.send(err);
    });
};

// #Retrive an entry by ID
exports.getEntry = function(req, res){
    db.Crypto.findById(req.params.cryptoId)
    .then(function(foundCrypto){
        res.json(foundCrypto);
    })
    .catch(function(err){
        res.send(err);
    });
};

// #Update an entry
exports.updateEntry = function(req, res){
    
    // Search by id and update the entry with the data found in the body (req.body)
    // To return the updated entry set new:true
    db.Crypto.findOneAndUpdate({_id: req.params.cryptoId}, req.body, {new: true})
    .then(function(entry){
        res.json(entry);
    })
    // Return error if any
    .catch(function(err){
        res.send(err);
    });
};

// #Delete entry
exports.deleteEntry = function(req, res){
    db.Crypto.remove({_id: req.params.cryptoId})
    .then(function(){
        res.json({message: "Deleted"});
    })
    .catch(function(err){
        res.send(err);
    });
};