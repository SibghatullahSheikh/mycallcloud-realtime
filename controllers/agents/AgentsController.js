var AgentModel = require('../../models/agent/AgentModel');
var DATA_UPDATE_INTERVAL = 1000*5; //5 seconds

function AgentsController (mysql) {
  var self = this;
  this.model = new AgentModel(mysql);

  this.read = function(req, res) {
    res.json(self.model.getAgents());
  };

  this.updateModel = function() {
    self.model.update(function(err) {
      if (err) console.log('Agent Update Error: ' + err);
    });
  };
 
  //intialize the model
  this.updateModel();

  //Update the model on specified interval
  setInterval(this.updateModel, DATA_UPDATE_INTERVAL);
};

module.exports = AgentsController;
