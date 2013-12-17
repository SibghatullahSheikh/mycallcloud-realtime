var events = require('events');

/**
 * Realtime Object
 */
var Realtime = function()
{
  this.attributes = {};

  this.emitter = new events.EventEmitter();
};

Realtime.fn = Realtime.prototype;

Realtime.fn.get = function(key)
{
  return this.attributes[key] || null;
};

Realtime.fn.set = function(key, val)
{
  if(this.attributes[key] !== val)
  {
    this.attributes[key] = val;
    this.change();
  }
};

Realtime.fn.setObj = function(obj)
{
  for(var key in obj)
  {
    if(obj.hasOwnProperty(key))
    {
      if(obj[key] != this.attributes[key])
      {
        this.attributes[key] = obj[key];
        this.change();
      }
    }
  }
}

Realtime.fn.changed = function(callback)
{
  var self = this;

  this.emitter.on('change', function()
  {
    callback(self.attributes);
  });
};

Realtime.fn.change = function()
{
  this.emitter.emit('change');
};




module.exports = Realtime;