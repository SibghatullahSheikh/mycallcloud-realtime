var CampaignModel = require('../../models/campaign/CampaignModel');
var DATA_UPDATE_INTERVAL = 1000*60*5; //5 minutes

function CampaignsController (mysql) {
  var self = this;
  this.model = new CampaignModel(mysql);

  this.read = function(req, res) {
    res.json(self.model.getCampaigns());
  };

  this.updateModel = function() {
    self.model.update(function(err) {
      if (err) console.log('Campaign Update Error: ' + err);
    });
  };
 
  //intialize the model
  this.updateModel();

  //Update the model on specified interval
  setInterval(this.updateModel,DATA_UPDATE_INTERVAL);
};

module.exports = CampaignsController;
