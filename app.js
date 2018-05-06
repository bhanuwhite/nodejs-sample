var express = require('express');
var path = require('path');
var cors = require('cors');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var validator = require('express-validator');


// database connection starting
var config = require('./config/storage.js');
// database connection end

var app = express();
app.use(validator());
app.use(cors());


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public/uploads')));


//routes w/t token
var routesWithoutToken = require('./routes/routesWithoutToken.js');
app.use("/api", routesWithoutToken);
//end


// app middleware that will happen on every request to check JWT
app.use(function (req, res, next) {
    var token = req.header('Authorization') || req.query.state;
    if (token) {
        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) {
                return res.status(401).json({success: false, message: 'Failed to authenticate token.'});
            } else {
                req.userId = decoded.userId;
                next();
            }
        });
    } else {
        return res.status(401).send({
            success: false,
            message: 'No token provided.'
        });
    }
});
//end

//routes for user Info
var routes = require('./routes/routes.js');
app.use("/api", routes);
//end


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
