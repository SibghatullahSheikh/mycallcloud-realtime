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
  realtime     = require('./modules/realtime'),
  Agi          = require('./modules/Asterisk/Agi'),
  _			   = require('underscore')
;



/**
 * App Vars
 */
var app         = express();
var server      = http.createServer(app);
var store       = new express.session.MemoryStore();
var io          = socket.listen(server);
var SITE_SECRET = 'saflkj3lkj3dlkj3d9j459612klfjas09djoi3j09jwf';

var mysql  = mysqlServer.createConnection({
  host                 : '66.241.101.90',
  user                 : 'cron',
  password             : '1234',
  database             : 'asteriskrcs',
  multipleStatements   : true,
  timezone			   : 'EST'
});
var agi = new Agi({
  host      : '10.0.20.199',
  port      : 5038,
  encoding  : 'ascii',
  username  : 'cron',
  password  : '1234'
});

var CampaignsController = require('./controllers/campaigns/CampaignsController');
var campaignsController = new CampaignsController(mysql);
var CallsController = require('./controllers/calls/CallsController');
var callsController = new CallsController(mysql);
var AgentsController = require('./controllers/agents/AgentsController');
var agentsController = new AgentsController(mysql);

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
    store: store,
    cookie: { maxAge:new Date(Date.now() + (1000*60*60*24)) }   //Persist session for one day  
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


var basicAuth = express.basicAuth(function(user, pass, cb)
{
  var query = 'SELECT u.user, u.pass, u.phone_pass, u.phone_login, p.server_ip, p.conf_secret, a.server_ip AS agent_server_ip FROM vicidial_users u LEFT JOIN phones p ON u.phone_login = p.login LEFT JOIN vicidial_live_agents a ON a.user = u.user WHERE u.user=? AND u.pass=? AND u.user_level > 7 && u.active="Y"; SELECT external_server_ip FROM servers WHERE server_ip="192.168.100.51";';
  
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

var auth = function(req, res, next) {
  basicAuth(req, res, function(err) {
    if(!err) {
      req.session.user = req.user;
	    next();
    } else {
      res.send('Authentication failed');
    }
  });
};

var permissions = function(req, res, next) {
  var group;
  var groups;
  var campaigns;

  if ('groups' in req.session && 'campaigns' in req.session) {
    console.log('Using previously set group and campaign permissions');
    next();
  } else {
    //start the chain
    getUserGroup();
  }

  function getUserGroup() {
    console.log('Getting User Group');
    var query = 'SELECT user_group ' +
          'FROM vicidial_users ' +
          'WHERE user="' + req.session.user.user + '";';
    
    mysql.query(query, function(err, results) {
      if (err) {
        console.error('MySQL Error: ' + err);
        req.session.campaigns = [];
        req.session.groups = [];
        next();
      } else {
        group = results[0].user_group || '';
        getAllowed();
      }
    });
  }

  function getAllowed() {
    console.log('requesting allowed campaigns and groups');
    query = 'SELECT allowed_campaigns, admin_viewable_groups ' +
        'FROM vicidial_user_groups ' +
        'WHERE user_group = "' + group + '";';
    
    mysql.query(query, function(err, results) {
      if (err) {
        console.error('MySQL Error: ' + err);
        req.session.campaigns = [];
        req.session.groups = [];
        next();
      } else if (results.length === 0) {
        //No data returned for this user group
        console.error('No group permissions found for group: ', group);
        req.session.campaigns = [];
        req.session.groups = [];
        next();
      } else {
        //Save the campaigns
        campaigns = results[0].allowed_campaigns.trim().split(' ') || [];
        
        //Remove the erroneous '-' campaign value
        campaigns = _.reject(campaigns, function(campaign){ return campaign == '-'; });
       
        //Save the groups
        groups = results[0].admin_viewable_groups.trim().split(' ') || [];

        //Check the groups, and then check the campaigns
        checkGroups();
      }
    });
  }
  
  function checkGroups() {
    if (groups.indexOf('---ALL---') > -1) {
      console.log('Getting unique user_groups');
      var query = 'SELECT DISTINCT user_group FROM vicidial_users;';
      mysql.query(query, function(err, results) {
        req.session.groups = _.without(_.pluck(results, 'user_group'), '---ALL---', 'ADMIN', 'zADMIN');
        checkCampaigns();
      });
    } else if (groups[0] === '' || groups.length === 0) {
      req.session.groups = [group];
      checkCampaigns();
    } else {
      req.session.groups = groups;
      checkCampaigns();
    }
  }
  
  function checkCampaigns() {
    if (campaigns.indexOf('-ALL-CAMPAIGNS-') > -1) {
      console.log('Getting distinct campaigns');
      var query = 'SELECT DISTINCT campaign_id ' +
                  'FROM vicidial_campaign_stats ' +
                  'WHERE calls_today > 10';
      
      mysql.query(query, function(err, results) {
        if (err) {
          console.error('MySQL Error: ' + err);
          req.session.campaigns = [];
          next();
        } else {
          req.session.campaigns = _.pluck(results, 'campaign_id'); 
          next();
        }
      });
    } else {
      req.session.campaigns = campaigns;
      next();
    }
  }
};


/**
 * Routes
 */
app.get('/', auth, permissions, function(req, res)
{
	res.render('index', {
		user: req.session.user,
		campaigns: req.session.campaigns, 
		groups: req.session.groups,
	  customURL: 'http://nativerank.com/account'
  });
});

app.get('/resources', auth, permissions, function(req, res) {
	res.render('resources', {
		user: req.session.user,
		campaigns: req.session.campaigns, 
		groups: req.session.groups,
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

app.get('/api/campaigns', campaignsController.read);
app.get('/api/calls', callsController.read);
app.get('/api/agents', agentsController.read);


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
});


/**
 * Start Server
 */
server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

process.on('SIGING', function() {
  //Make sure the MySQL connection is dead
  mysql.destroy();
  process.exit(0);
});

