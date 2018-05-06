/*
  purpose: authorization controller files
  author: saurabh
  date : ***
*/
var fs = require('fs');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var gmail = google.gmail('v1');
var gmailAuthModel = require('../model/gmailAuthModel.js');
var jwt = require('jsonwebtoken');
var config = require('../config/storage.js');
// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/gmail-nodejs-quickstart.json
var SCOPES = ['https://mail.google.com/',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.settings.basic',
    'https://www.googleapis.com/auth/gmail.labels',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.insert'];

// Load client secrets from a local file.
exports.auth = function (req, res) {
    fs.readFile('../woohoo-api/config/client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }

        authorize(JSON.parse(content));
    });


    function authorize(credentials, callback) {
        var clientSecret = credentials.web.client_secret;
        var clientId = credentials.web.client_id;
        // var redirectUrl = credentials.web.redirect_uris[0];
        var auth = new googleAuth();
        var oauth2Client = new auth.OAuth2(clientId, clientSecret, 'https://app.mywoohoo.io/apiv2/gmail');
        gmailAuthModel.find({}, function (err, token) {
            if (err)
                return err;
            else {
                if (token.length == 0) {
                    getNewToken(oauth2Client, callback);
                }
                else {
                    res.status(200).json({ msg: 'already registerd with google' })
                }
            }
        })

    }

    function getNewToken(oauth2Client, callback) {
        var tokenObj = {
            email: req.userId
        };
        var token = jwt.sign(tokenObj, config.secret, {
        });
        var authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
            approval_prompt: 'force',
            state: token
        });

        res.redirect(authUrl)
    }
}

exports.storeToken = function (req, res) {
    fs.readFile('../woohoo-api/config/client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }

        var credentials = JSON.parse(content);
        var clientSecret = credentials.web.client_secret;
        var clientId = credentials.web.client_id;
        var auth = new googleAuth();
        oauth2Client.getToken(req.query.code, function (err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }

            oauth2Client.credentials = token;
            gmail.users.getProfile({
                auth: oauth2Client,
                userId: 'me'
            }, function (err, response) {
                if (err) {
                    console.log('The API returned an error: ' + err);
                    return;
                }
                var gmailProfile = new gmailAuthModel();
                gmailProfile.user_id = req.userId;
                gmailProfile.token = token;
                if (token.hasOwnProperty('refresh_token'))
                    gmailProfile.refresh_token = token.refresh_token;
                gmailProfile.connected_email = response.emailAddress;
                gmailProfile.save(function (err, Object) {
                    if (err) return err;
                    //res.status(200).json({ 'msg': 'success' })
                    res.redirect('/#/intelligent-flow');
                })

            });

        });

    });
}

exports.connected = function (req, res) {
return new Promise(function(resolve, reject){
    gmailAuthModel.findOne({ "user_id": req.userId }, function (err, exist) {
        if (err) reject(err);
        else {
            if (exist == null) {
               resolve({ connected: false })
            }
            else {
                resolve({ connected: true })
            }
        }
    })
})
}

/**
 *returning the oauth client to use in gmail services
 */
exports.getAuthClient = function (userId) {
    return new Promise(function (resolve, reject) {
        fs.readFile('../woohoo-api/config/client_secret.json', function processClientSecrets(err, content) {
            if (err) {
                console.log('Error loading client secret file: ' + err);
                return;
            }

            var credentials = JSON.parse(content);
            var clientSecret = credentials.web.client_secret;
            var clientId = credentials.web.client_id;
            //var redirectUrl = 'localhost:8082/gmail';
            var auth = new googleAuth();
           var oauth2Client = new auth.OAuth2(clientId, clientSecret, 'https://app.mywoohoo.io/apiv2/gmail');
            // var oauth2Client = new auth.OAuth2(clientId, clientSecret, 'http://localhost:9090/api/gmail');
            gmailAuthModel.findOne({ "user_id": userId }, function (err, token) {
                if (err) reject(err);
                else {
                    // console.log("in gmail controller",token);
                    oauth2Client.credentials = token.Token;
                    if (!token.hasOwnProperty('refresh_token'))
                        oauth2Client.credentials.token = token.refresh_token;
                    resolve(oauth2Client, token.connected_email);
                }
            })
        })
    });
}
