var express = require('express'),
    app = express(),
    bodyParser = require("body-parser");
    
// Use process.env.PORT if it exists or 3000 if not    
var port = process.env.PORT || 3000;
    
var cryptoRoutes = require('./routes/crypto_list');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));

// Default page
app.get('/', function(req, res) {
    res.sendFile("index.html");
});

// When /api/crypto_list is called cryptoRoutes will be used
app.use('/api/crypto_list', cryptoRoutes);
    
app.listen(port, function() {
    console.log("APP IS RUNNING ON PORT " + port);
})