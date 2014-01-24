module.exports = function(mysql)
{
	var
		_                   = require('underscore')._,
		Backbone            = require('backbone'),
		CallsCollection     = require('./Calls/CallsCollection')(mysql),
		UsersCollection     = require('./Users/UsersCollection')(mysql),
		CampaignsCollection = require('./Campaigns/CampaignsCollection')(mysql)
	;

	var AppModel = Backbone.Model.extend({

		defaults: {
			dropped                    : 0,
			answered                   : 0,
			dropped_pct                : 0,
			dropped_delta              : 0,
			agent_avg_wait             : 0,
			average_talk_time          : 0,
			calls_today                : 0,
			average_wrap               : 0,
			average_pause              : 0,
			average_agents             : 0,
			dialable_leads             : 0,
			dial_method                : ''
		},

		initialize: function()
		{
			var self = this;
      this.calls = new CallsCollection();
      this.users = new UsersCollection();
			this.campaigns = new CampaignsCollection();

			this.prevDropped = 0;

			/**
			 * Update Stats on Change of Campaigns
			 */
			this.listenTo(this.campaigns, 'all', function()
			{
				self.getStats();	
			});
		},

		getStats: function()
		{
			var
				dropped         = this.campaigns.getDroppedCalls(),
				answers         = this.campaigns.getAnswersToday(),
				callsToday      = this.campaigns.getCallsToday(),
				agentCallsToday = this.campaigns.getAgentCallsToday()
			;

			this.set({
				dropped                   : dropped,
				answered                  : answers,
				dropped_pct               : ((100 * (dropped / answers)) || 0).toFixed(0),
				prev_dropped              : this.prevDropped,
				dropped_delta             : this.prevDropped > dropped
					? dropped - this.prevDropped
					: this.prevDropped - dropped,
				agent_avg_wait            : Math.round(( this.campaigns.getAgentWaitToday() / agentCallsToday ) || 0),
				average_talk_time         : Math.round(( this.campaigns.getAgentCustTalkToday() / agentCallsToday ) || 0),
				calls_today               : callsToday,
				average_wrap              : Math.round(this.campaigns.getAvgWrap()),
				average_pause             : Math.round((this.campaigns.getAgentPauseToday() / agentCallsToday ) || 0),
				// average_agents            : this.campaigns.getAgentsAverageOneMin(),
				dialable_leads            : this.campaigns.getDialableLeads(),
				dial_method               : this.campaigns.getDialMethod()
			});

			this.prevDropped = dropped;
		},
	});

	return AppModel;
};
