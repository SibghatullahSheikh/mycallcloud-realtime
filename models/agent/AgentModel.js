function AgentModel (mysql) {
  var self = this; 
  this.mysql = mysql;
  this.agents = {};

  this.update = function(callback) {
		var query = 'SELECT vicidial_users.user_id AS "id", ' +
                'vicidial_users.user AS "linkid", ' +
                'vicidial_users.full_name AS "user", ' + 
                'vicidial_users.user_group AS "group", ' +
                'vicidial_live_agents.status AS "status", ' +
                'vicidial_live_agents.lead_id AS "lead_id", ' +
                'vicidial_live_agents.conf_exten AS "session_id", ' +
                'vicidial_live_agents.callerid, ' +
                'UNIX_TIMESTAMP(vicidial_live_agents.last_update_time) - UNIX_TIMESTAMP(vicidial_live_agents.last_call_time) AS "time", ' +
                'SUBSTRING_INDEX(vicidial_live_agents.extension, "/", -1) AS "extension", ' +
                'vicidial_live_agents.campaign_id AS "campaign", ' +
                'vicidial_live_agents.calls_today AS "calls", ' +
                'vicidial_live_agents.extension AS "station", ' + 
                '(case when realtime.contacts>0 then realtime.contacts else 0 end) contacts, ' + 
                '(case when realtime.successes>0 then realtime.successes else 0 end) successes, ' + 
                '(case when realtime.transfers>0 then realtime.transfers else 0 end) transfers, ' +
                'vicidial_campaigns.closer_campaigns AS "in-group", ' +
                'vicidial_live_agents.server_ip AS "server_ip" ' +
                'FROM vicidial_live_agents ' +
                'LEFT JOIN realtime ON vicidial_live_agents.user = realtime.userid ' +
                'LEFT JOIN vicidial_users ON vicidial_live_agents.user = vicidial_users.user ' +
                'LEFT JOIN vicidial_campaigns ON vicidial_live_agents.campaign_id = vicidial_campaigns.campaign_id ' +
                'GROUP BY id;';
	
    self.mysql.query(query, function(err, results) {
      if (err) callback(err);
      console.log('recieved agent data');
      self.agents = results;
      callback(null);
    });
  };

  this.getAgents = function() {
    return self.agents;
  };

};

module.exports = AgentModel;
