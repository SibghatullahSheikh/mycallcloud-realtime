
function CallModel (mysql) {
  var self = this; 
  this.mysql = mysql;
  this.calls = {};

  this.update = function(callback) {
		var query = 'SELECT auto_call_id AS id, ' +
                'status, ' +
                'campaign_id AS campaign, ' +
                'phone_number AS phone, ' +
                'server_ip, ' +
                'TIMEDIFF(NOW(), call_time) AS on_hold_time, ' +
                'call_type AS call_type, ' +
                'queue_priority AS priority, ' +
                'agent_only, ' +
                'callerid ' + 
                'FROM vicidial_auto_calls where status IN ("LIVE", "CLOSER")';
    
    self.mysql.query(query, function(err, results) {
      if (err) callback(err);
      console.log('recieved call data');
      self.calls = results;
      callback(null);
    });
  };

  this.getCalls = function() {
    return self.calls;
  };

};

module.exports = CallModel;
