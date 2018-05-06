var storage = {};
storage.secret= 'xxx';
var mongoose = require('mongoose');
var url = 'mongodb://localhost:27017/xx;
mongoose.connect(url);

var MongoClient = require('mongodb').MongoClient;

storage.getMongooseDB = function() {
    return mongoose;
}

storage.getDB = function() {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, function(err, connection) {
            if (!err) {
                resolve(connection);
            } else {
                reject(err);
            }
        });
    });
}

storage.spotifyCredentials = {
    clientId: '42b38cx1b6710',
    clientSecret: '48e5x01',
    redirectUri: 'xx'
};

module.exports = storage;
