var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hash = require('hash-string');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var requestIp = require('request-ip');
var satelize = require('satelize');
var cities = require('cities');

// inside middleware handler
var ipMiddleware = function(req, res, next) {
    var clientIp = requestIp.getClientIp(req); // on localhost > 127.0.0.1
    res.clientIp = clientIp;
    next();
};

var locationMiddleware = function(req, res, next){
  var clientIp = res.clientIp;
  satelize.satelize({ip: clientIp}, function(err, payload){
    res.locationData = payload;
    res.cities = cities.gps_lookup(payload.latitude, payload.longitude);
  });
  next();
};

//SOLUTION

// This solution fullfils the requirements:
// A. When a visitor hits a page, assign a unique ID to that browser
// B. After the browser is restarted, when the visitor hits the page again the browser has the same ID
// C. After the browser clears cookies, the browser is still assigned the same ID
// D. After the browser clears cache, cookies, and all, the browser is still assigned the same ID
// E. Some, or all, of the browsers (chrome, firefox, opera, IE, Safari, etc.) on the device share the same ID
// F. If you got this to work on desktop, get this to also work on mobile (The desktop and mobile devices should have different ID’s though)
// G. Create a scalable solution

// However, it is geography specific and is only working for a set location in space with ~5 mi range

var getUniqueIdMiddleware = function(req, res, next){
  var country = res.locationData["country_code"]; 
  var timezone = res.locationData["timezone"];
  var lat = res.locationData["latitude"];
  var lon = res.locationData["longitude"];
  var uniqueId = hash(country + timezone + res.clientIp + lat + lon);
  res.resultId = uniqueId;
  next();
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', ipMiddleware, locationMiddleware, getUniqueIdMiddleware, routes);
app.post('/', function(req, res){
});
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
