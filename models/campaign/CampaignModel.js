
function CampaignModel (mysql) {
  var self = this; 
  this.mysql = mysql;
  this.campaigns = {};

  this.update = function(callback) {
    var query = 'SELECT campaign_id as id, ' +
                'calls_today, ' +
                'drops_today, ' +
                'answers_today, ' +
                'agent_calls_today, ' +
                'agent_wait_today, ' +
                'agent_custtalk_today, ' +
                'agent_pause_today, ' +
                'dialable_leads ' +
                'FROM vicidial_campaign_stats ' +
                'WHERE dialable_leads > 10';

    self.mysql.query(query, function(err, results) {
      if (err) callback(err);
      console.log('recieved campaign data');
      self.campaigns = results;

      query = 'SELECT campaign_id as id, ' +
              'SUM(dispo_sec) as dispo_today ' +
              'FROM vicidial_agent_log ' +
              'WHERE event_time > NOW() -interval 14 hour ' +
              'GROUP BY campaign_id;';

			mysql.query(query, function(err, results) {
        if (err) callback(err);
        
        //Loop through the campaigns and save the average wrap time
        for (var i=0;i<self.campaigns.length;i++) {
          for (var x=0;x<results.length;x++) {
            if (self.campaigns[i].id == results[x].id) {
              //campaign match found, so save the dispo_today for this campaign
              self.campaigns[i].dispo_today = results[x].dispo_today;
              break;
            }
          }
        }

        callback(null);
      });
    });
  };

  this.getCampaigns = function() {
    return self.campaigns;
  };
};

module.exports = CampaignModel;
