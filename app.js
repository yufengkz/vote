var express = require('express');
var path = require('path');
var favicon = require('serve-favicon'); //收藏夹图标
var logger = require('morgan');  //记录请求日志
var cookieParser = require('cookie-parser');  //解析cookie  req.cookies
var bodyParser = require('body-parser');   //解析请求体  req.body

//规定什么样的文件用什么样的函数
var routes = require('./routes/route_app');

var app = express();
var ejs = require('ejs');

//是指模版存放路径
app.set('views', path.join(__dirname, 'views'));
//设置模板引擎
app.engine('.html', ejs.__express);
app.set('view engine', 'html');// app.set('view engine', 'ejs');


// 酷护短访问/favicon路径的时候，会返回public目录下的favicon.ico文件
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));  //日志
app.use(bodyParser.json());  //处理请求提格式为json的请求提
app.use(bodyParser.urlencoded({ extended: false }));//处理请求提格式为urlencoding的请求提  form表单
app.use(cookieParser()); //处理cookie
app.use(express.static(path.join(__dirname, 'public')));  //静态文件根目录


//获得get请求，第一个参数是匹配内容，第二个参数是匹配成功后执行的回调函数
app.get('/vote/index', routes.index);  
app.get(/\/vote\/detail/, routes.detail);  
app.get('/vote/register', routes.register);  
app.get('/vote/search', routes.search); 
app.get('/vote/rule', routes.rule);

app.get('/vote/index/data', routes.index_data);
app.get(/\/vote\/index\/poll/, routes.index_poll);
app.get(/\/vote\/index\/search/, routes.index_search);
app.get(/\/vote\/all\/detail\/data/, routes.detail_data);

app.post(/\/vote\/register\/data/, routes.register_data);
app.post('/vote/index/info', routes.index_info);


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
