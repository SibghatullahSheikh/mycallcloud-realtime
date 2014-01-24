var CallModel = require('../../models/call/CallModel');
var DATA_UPDATE_INTERVAL = 1000*5; //5 seconds

function CallsController (mysql) {
  var self = this;
  this.model = new CallModel(mysql);

  this.read = function(req, res) {
    res.json(self.model.getCalls());
  };

  this.updateModel = function() {
    self.model.update(function(err) {
      if (err) console.log('Call Update Error: ' + err);
    });
  };
 
  //intialize the model
  this.updateModel();

  //Update the model on specified interval
  setInterval(this.updateModel, DATA_UPDATE_INTERVAL);
};

module.exports = CallsController;
