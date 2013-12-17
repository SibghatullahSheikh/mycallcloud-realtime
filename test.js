var net = require('net');





var Agi = function(options)
{
	var options = this.options = options || {};
	this.CRLF = "\r\n";
}

Agi.fn = Agi.prototype;

Agi.fn.connect = function(cb)
{
	var self = this;
	this.socket = null;
	var socket = this.socket = net.createConnection(this.options.port, this.options.host);
	socket.setEncoding(this.options.encoding);
	socket.setKeepAlive(true, 500);

	socket
		.on('connect', function()
		{
			console.log('connected');
			self.send({
				Action: 'login',
				Username: self.options.username,
				Secret: self.options.password,
				Events: 'off'
			});
			console.log('logged in');
			cb();
		})
		.on('error', function(err)
		{
			console.log('Error:', err);
		})
};

Agi.fn.generateRandom = function()
{
	return Math.floor(Math.random()*100000000000000000);
};

Agi.fn.socketData = function(obj)
{
	var str = '';
	for(var key in obj)
	{
		str += (key + ': ' + obj[key] + this.CRLF);
	}
	return str + this.CRLF;
};

Agi.fn.send = function(obj, cb)
{
	//check state of connection here, if not up then bail out
	if(!obj.ActionID)
	{
		obj.ActionID = this.generateRandom();
	}

	//maybe i should be checking if this socket is writeable
	if(this.socket != null && this.socket.writable)
	{
		console.log(obj);
		this.socket.write(this.socketData(obj), this.options.encoding, cb);
	}
	else
	{
		console.log('cannot write to Asterisk Socket');
		this.emit('socket_unwritable');
	}
};

Agi.fn.call = function(num)
{
	var self = this;

	this.send({
		Action    : 'login',
		Username  : self.options.username,
		Secret    : self.options.password,
		Events    : 'off',
		Action    : 'originate',
		Channel   : 'SIP/777',
		Exten     : num,
		CallerID  : 420,
		Timeout   : 30000,
		Priority  : 1
	});
};

// Agi.fn.coach = function(num)
// {
// 	var self = this;
	
// 	this.send({
// 		Action    : 'login',
// 		Username  : self.options.username,
// 		Secret    : self.options.password,
// 		Events    : 'off',
// 		Action    : 'originate',
// 		Channel   : 'SIP/777',
// 		Exten     : num,
// 		Context   : 'vicidial-auto',
// 		CallerID  : 999,
// 		Timeout   : 30000,
// 		Priority  : 1
// 	});
// };

Agi.fn.chanSpy = function(num)
{
	var self = this;
	
	this.send({
		Action    : 'login',
		Username  : self.options.username,
		Secret    : self.options.password,
		Events    : 'off',
		Action    : 'originate',
		Channel   : 'SIP/777',
		Exten     : num,
		CallerID  : 999,
		Timeout   : 30000,
		Priority  : 1
	});
};



var agi = new Agi({
	host      : '192.168.100.39',
	port      : 5038,
	encoding  : 'ascii',
	username  : 'cron',
	password  : '1234'
});

agi.connect(function()
{
	agi.call(6109062215);
});
