module.exports = function(mysql)
{
	var
		_             = require('underscore')._,
		Backbone      = require('backbone'),
		CampaignModel = require('./CampaignModel')(mysql)
	;

	return Backbone.Collection.extend({

		model: CampaignModel,

		initialize: function()
		{
			var self = this;

			this.getStats(function()
			{
				setInterval(function()
				{
					self.getStats();
				}, 5 * 60 * 1000);
			});
		},

		getStats: function(cb)
		{
			var self = this;
      var query = 'SELECT *, campaign_id as id ' +
                  'FROM vicidial_campaign_stats ' +
                  'WHERE calls_today > 10';

			mysql.query(query, function(err, results)
			{
				if(err)
				{
					console.log('Get Campaign Stats SQL Error:', err);
					return;
				}
				for(var i=0; i<results.length; i++)
				{
					self.add(results[i], { merge: true });
				}

				self.getAvgWrapCB();
				self.getDialMethodCB();

				if(cb && _.isFunction(cb)) cb(results);
			});
		},

		getDroppedCalls: function()
		{
			var
				sum = 0,
				cs  = this.filter(function(call)
				{
					return call.get('calls_today') > 10;
				})
			;

			for(var i=0; i<cs.length; i++)
			{
				sum += cs[i].get('drops_today');
			}

			return sum;
		},

		getAnswersToday: function()
		{
			var
				sum = 0,
				cs  = this.filter(function(call)
				{
					return call.get('calls_today') > 10;
				})
			;

			for(var i=0; i<cs.length; i++)
			{
				sum += cs[i].get('answers_today');
			}

			return sum;
		},

		getAgentCallsToday: function()
		{
			var
				sum = 0,
				cs  = this.filter(function(call)
				{
					return call.get('calls_today') > 10;
				})
			;

			for(var i=0; i<cs.length; i++)
			{
				sum += cs[i].get('agent_calls_today');
			}

			return sum;
		},

		getAgentWaitToday: function()
		{
			var
				sum = 0,
				cs  = this.filter(function(call)
				{
					return call.get('calls_today') > 10;
				})
			;

			for(var i=0; i<cs.length; i++)
			{
				sum += cs[i].get('agent_wait_today');
			}

			return sum;
		},

		getAgentCustTalkToday: function()
		{
			var
				sum = 0,
				cs  = this.filter(function(call)
				{
					return call.get('calls_today') > 10;
				})
			;

			for(var i=0; i<cs.length; i++)
			{
				sum += cs[i].get('agent_custtalk_today');
			}

			return sum;
		},

		getCallsToday: function()
		{
			var
				sum = 0,
				cs  = this.filter(function(call)
				{
					return call.get('calls_today') > 10;
				})
			;

			for(var i=0; i<cs.length; i++)
			{
				sum += cs[i].get('calls_today');
			}

			return sum;
		},

		getAgentPauseToday: function()
		{
			var
				sum = 0,
				cs  = this.filter(function(call)
				{
					return call.get('calls_today') > 10;
				})
			;

			for(var i=0; i<cs.length; i++)
			{
				sum += cs[i].get('agent_pause_today');
			}

			return sum;
		},

		// getAgentsAverageOneMin: function()
		// {
		// 	var
		// 		sum = 0,
		// 		cs  = this.filter(function(campaign)
		// 		{
		// 			return campaign.get('agents_average_onemin') > 0;
		// 		}),
		// 		l   = cs.length
		// 	;

		// 	for(var i=0; i<l; i++)
		// 	{
		// 		console.log(cs[i].get('agents_average_onemin'));
		// 		sum += cs[i].get('agents_average_onemin');
		// 	}
		// 	console.log(sum, l);
		// 	return (sum / l) || 0;
		// },

		getDialableLeads: function()
		{
			var
				sum = 0,
				cs  = this.models
			;

			for(var i=0; i<cs.length; i++)
			{
				sum += cs[i].get('dialable_leads');
			}

			return sum;
		},

		getAvgWrapCB: function(cb)
		{
			var self = this;

			mysql.query(
				"SELECT ROUND((SUM(dispo_sec)/( ? )),2) AS 'avg_wrap' FROM vicidial_agent_log WHERE event_time > NOW() -interval 14 hour;",
				[self.getAgentCallsToday()],
				function(err, results)
				{
					if(err)
					{
						console.log('Get Average Wrap SQL Error: ', err);
						return;
					}

					self.avgWrapTime = results[0].avg_wrap;
				}
			);
		},

		getAvgWrap: function()
		{
			return this.avgWrapTime;
		},

		getDialMethodCB: function()
		{
			var self = this;

			mysql.query("select min(dial_method) as 'dial_method' from vicidial_campaigns where active='Y';", function(err, results)
			{
				if(err)
				{
					console.log('Get Dial Method SQL Error: ', err);
					return;
				}
				
				self.dialMethod = results[0].dial_method;
			});
		},

		getDialMethod: function()
		{
			return this.dialMethod;
		}

	});
};
