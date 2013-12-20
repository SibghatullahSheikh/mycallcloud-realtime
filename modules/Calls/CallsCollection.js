module.exports = function(mysql)
{
	var
		_         = require('underscore')._,
		Backbone  = require('backbone'),
		CallModel = require('./CallModel')(mysql)
	;

	return Backbone.Collection.extend({

		model: CallModel,

		initialize: function()
		{
			var self = this;

			this.getCalls(function()
			{
				setInterval(function()
				{
					self.getCalls();
				}, 1 * 1000);
			});
		},

		getCalls: function(cb)
		{
			var self = this;

			/**
			 * Get Live Calls
			 * SELECT *, channel AS id FROM live_sip_channels; 
			 */
			mysql.query("SELECT auto_call_id AS id, status, campaign_id AS 'campaign', phone_number AS 'phone', server_ip, call_time AS 'time', call_type AS 'call_type', queue_priority AS 'priority', agent_only, callerid FROM vicidial_auto_calls;", function(err, results)
			{
				if(err)
				{
					console.log('Get Calls SQL Error:', err);
					return;
				}

				/**
				 * Sync Collection
				 */
				var
					models = self.models,
					remove = [],
					add    = []
					now    = new Date()
				;

				//Add the time on hold
				for(var i=0;i<results.length;i++) {
					//calculate the time difference
					var hours = now.getHours() - results[i].time.getHours();
					var minutes = now.getMinutes() - results[i].time.getMinutes();
					var seconds = now.getSeconds() - results[i].time.getSeconds();

					var diff = new Date(0,0,0,hours,minutes,seconds);
				
					//add the on hold time to the results
					results[i].on_hold_time = diff.getHours() + ':' + diff.getMinutes() + ':' + diff.getSeconds();
				
					function format(time) {
						var num = time.toString();

						if (num.length === 1) {
							num = '0' + num;
						}

						return num;
					}
				}

				
				//filter to only use the selected campaigns
				//var campaigns = ['SIC', 'CCSV'] 
				//results = _.filter(results, function(call) { return campaigns.indexOf(call.campaign) > -1;});

				for(var i=0; i<models.length; i++) {

					if( result = _.findWhere(results, { id: models[i].id }) ) {
						add.push(result);
						//results = _.without(results, result);
					} else {
						remove.push(models[i]);
					}
				}

				for(var i=0; i<results.length; i++) {
					add.push(results[i]);
				}


				//self.add(add, { merge: true });
				

				self.add(results, {merge: true });
				self.remove(remove);

				if(cb && _.isFunction(cb)) cb(results);
			});
		},

		getRingingCalls: function()
		{
			return this.where({
				status: 'SENT'
			});
		},

		getActiveCalls: function()
		{
			return this.models;
		},

		getCallsWaiting: function(cb)
		{
			return this.where({
				status: 'XFER'
			});
		}

	});
};
