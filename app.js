var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose')
var expressSession = require('express-session')
var moment = require('moment')
var _ = require('lodash')

var index = require('./routes/index');
var users = require('./routes/users');
var admin = require('./routes/admin');
var movieDetail = require('./routes/movieDetail');
var category = require('./routes/category');
var search = require('./routes/search');

var app = express();

// view engine setup
var handlebars = require('express-handlebars').create({
	defaultLayout: 'main',
	helpers:{
		section: function(name, options){             
			if(!this._sections) this._sections = {};             
			this._sections[name] = options.fn(this);            
			return null;         
		},
    moment: function(name){
      return moment(name).format('MM/DD/YYYY')
    },
    list: function(length, current, link){
      var ret = ''
      for(var i =1; i<=length; ++i){
        var a = '<a href="' + link + i +'">' + i + '</a>'
        if(current == i)
          ret = ret + '<li class="active">' + a + '</li>' 
        else
          ret = ret + '<li>' + a + '</li>' 
      }

      return ret
    }
  }
})

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');
app.engine('handlebars', handlebars.engine)

//连接mongodb
var dbl = 'mongodb://localhost/webmovie'
mongoose.connect(dbl)
mongoose.Promise = require('bluebird')

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

var MongoSessionStore = require('session-mongoose')(require('connect'));
var sessionStore = new MongoSessionStore({ url: dbl });
app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: 'webmovie',
    store: sessionStore
}))
app.use(express.static(path.join(__dirname, 'public')));

//会话的预处理
app.use(function(req, res, next){
  res.locals.user = req.session.user
  next()
})

//路由
app.use('/', index, search);
app.use('/users', users);
app.use('/movie', movieDetail);
app.use('/admin', admin);
app.use('/category', category)

//
app.get('/signin', function(req, res, next){
  res.render('signin')
})
//
app.get('/unauthorized', function(req, res, next){
  res.render('unauthorized')
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
