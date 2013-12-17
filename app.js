/**
 * Module dependencies.
 */
var
  express      = require('express'),
  http         = require('http'),
  path         = require('path'),
  Url          = require('url'),
  querystring  = require('querystring'),
  cookie       = require('express/node_modules/cookie'),
  connectUtils = require('express/node_modules/connect/lib/utils'),
  mysqlServer  = require('mysql'),
  request      = require('request'),
  socket       = require('socket.io'),
  realtime     = require('./realtime'),
  Agi          = require('./modules/Asterisk/Agi')
;



/**
 * App Vars
 */
var app         = express();
var server      = http.createServer(app);
var store       = new express.session.MemoryStore();
var io          = socket.listen(server);
var SITE_SECRET = 'your secret here';

var mysql  = mysqlServer.createConnection({
  host                 : '10.0.20.199',
  user                 : 'cron',
  password             : '1234',
  database             : 'asterisk',
  multipleStatements   : true
});
var agi = new Agi({
  host      : '10.0.20.199',
  port      : 5038,
  encoding  : 'ascii',
  username  : 'cron',
  password  : '1234'
});



/**
 * All Environment Settings
 */
app.configure(function(){
  app.set('port', process.env.PORT || 3002);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser(SITE_SECRET));
  app.use(express.session({
    key: 'express.sid',
    store: store
  }));
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));

  io.set('log level', 0);
});

/**
 * Development Evironment Only Settings
 */
app.configure('development', function(){
  app.use(express.errorHandler());
});



var
  RealtimeApp = require('./modules/AppModel')(mysql),
  App         = new RealtimeApp()
;



var basicAuth = express.basicAuth(function(user, pass, cb)
{
  var query = 'SELECT u.user, u.pass, u.phone_pass, u.phone_login, p.server_ip, p.conf_secret, a.server_ip AS agent_server_ip FROM vicidial_users u LEFT JOIN phones p ON u.phone_login = p.login LEFT JOIN vicidial_live_agents a ON a.user = u.user WHERE u.user=? AND u.pass=? AND u.user_level > 7 && u.active="Y"; SELECT external_server_ip FROM servers WHERE server_ip="10.0.20.199";';
  mysql.query(query, [user, pass], function(err, results)
  {
    if(err)
    {
      return cb(err, null);
    }

    var user = results[0][0] || false;
    user.external_server_ip = results[1][0].external_server_ip;
    console.log(user);
    cb(err, user);
  });
});

var auth = function(req, res, next)
{
  basicAuth(req, res, function(err)
  {
    if(!err)
    {
      req.session.user = req.user;
      next();
    }
  });
};






/**
 * Routes
 */
app.get('/', auth, function(req, res)
{
  res.render('index', {
    user: req.session.user,
    data: {
      users     : App.users.toJSON(),
      calls     : App.calls.toJSON(),
      campaigns : App.users.toJSON()
    }
  });
});

app.get('/spy', function(req, res)
{
  var
    callExt = req.body.callExt,
    spyExt  = req.body.spyExt
  ;

  agi.chanSpy(callExt, spyExt);

  return res.send('');
});





/**
 * Web Sockets
 */
io.set('authorization', function(data, accept)
{
  if(!data.headers.cookie) return accept('Session Cookie Required.', false);

  var
    cookies = cookie.parse(data.headers.cookie),
    parsed  = connectUtils.parseSignedCookies(cookies, SITE_SECRET)
  ;

  data.cookies = parsed;
  data.sessionID = parsed['express.sid'];

  store.get(data.sessionID, function(err, session)
  {
    console.log(err,session);
    if(err)
    {
      return accept('Error in session store.', false);
    }
    else if(!session)
    {
      return accept('Session Not Found.', false);
    }

    data.session = session;
    return accept(null, true);
  });
});

io.sockets.on('connection', function (socket)
{

  var
    hs      = socket.handshake,
    session = hs.session,
    user    = session.user
  ;
// console.log('SOCKET', user);
  socket.on('coach', function(data, cb)
  {
    agi.connect(function()
    {
      agi.coach(data.extension, user.phone_pass);
    });
  });

  socket.on('monitor', function(data, cb)
  {
    var
      url  = 'http://10.0.20.199/vicidial/non_agent_api.php',
      data = {
        'function'    : 'blind_monitor',
        'stage'       : 'MONITOR',
        'source'      : 'realtime',
        'user'        : user.user,
        'pass'        : user.pass,
        'phone_login' : user.phone_login,
        'server_ip'   : data.server_ip,
        'session_id'  : data.session_id
      }
      // data = {
      //   'function'    : 'blind_monitor',
      //   'stage'       : 'monitor',
      //   'source'      : 'realtime',
      //   'user'        : 'nseis', //user_name
      //   'pass'        : 'nseis', //user_pass
      //   'phone_login' : '777a', //user phone_login
      //   'session_id'  : data.sessionId,
      //   'server_ip'   : '192.168.100.53' //user server_ip
      // }
    ;

    request.post(url).form(data);
  });

  socket.on('barge', function(data, cb)
  {
    var
      url  = 'http://10.0.20.199/vicidial/non_agent_api.php',
      data = {
        'function'    : 'blind_monitor',
        'stage'       : 'BARGE',
        'source'      : 'realtime',
        'user'        : user.user,
        'pass'        : user.pass,
        'phone_login' : user.phone_login,
        'server_ip'   : data.server_ip,
        'session_id'  : data.session_id
      }
    ;

    request.post(url).form(data);
  });

  socket.on('client.ready', function(cb)
  {
    cb({
      stats     : App.toJSON(),
      users     : App.users.toJSON(),
      calls     : App.calls.toJSON()
    });
  });

  // App.on('change', function()
  // {
  //   socket.emit( 'stats.changed', App.toJSON() );
  // });

  // App.users.on('all', function(action, user)
  // {
  //   if(user.id==1945){ console.log('Noah', action); }
  //   socket.emit( 'users.' + action, user.toJSON() );
  // });

  // App.calls.on('all', function(action, call)
  // {
  //   socket.emit('calls.' + action, call.toJSON());
  // });

});



App.on('change', function()
{
  io.sockets.emit( 'stats.changed', App.toJSON() );
});

App.users.on('all', function(action, user)
{
  io.sockets.emit( 'users.' + action, user.toJSON() );
});

App.calls.on('all', function(action, call)
{
  io.sockets.emit('calls.' + action, call.toJSON());
});




/**
 * Start Server
 */
server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
