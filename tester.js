var events = require('events');
var eventEmitter = new events.EventEmitter();


var Dog = function()
{
	this.emitter = new eventEmitter();
};

Dog.prototype.emit = function(event)
{
	this.emitter.emit(event);
};

Dog.prototype.on = function(event, cb)
{
	this.emitter.on(event, cb);
};

Dog.prototype.bark = function()
{
	this.emit('bark');
};




var dog = new Dog();

dog.on('bark', function()
{
	console.log('woof');
});


