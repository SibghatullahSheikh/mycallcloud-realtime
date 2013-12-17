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
			agents_waiting             : 0,
			agents_logged_in           : 0,
			agents_in_calls            : 0,
			current_active_calls       : 0,
			agents_in_dead_calls       : 0,
			paused_agents              : 0,
			calls_ringing              : 0,
			calls_waiting_for_agents   : 0,
			agents_in_dispo            : 0,
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

			this.users     = new UsersCollection();
			this.calls     = new CallsCollection();
			this.campaigns = new CampaignsCollection();

			this.prevDropped = 0;

			/**
			 * Update Stats on Change of Users
			 */
			this.listenTo(this.users, 'all', function()
			{
				self.getStats();	
			});

			/**
			 * Update Stats on Change of Calls
			 */
			this.listenTo(this.calls, 'all', function()
			{
				self.getStats();	
			});

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
				agents_waiting            : this.users.getReadyUsers().length,
				agents_logged_in          : this.users.getLoggedInUsers(),
				agents_in_calls           : this.users.getUsersInCalls().length,
				paused_agents             : this.users.getPausedUsers().length,
				agents_in_dispo           : this.users.getUsersInDispo().length,
				current_active_calls      : this.calls.getActiveCalls().length,
				calls_ringing             : this.calls.getRingingCalls().length,
				calls_waiting_for_agents  : this.calls.getCallsWaiting().length,
				agents_in_dead_calls      : this.getAgentsInCalls().length,
				dropped                   : dropped,
				answered                  : answers,
				dropped_pct               : ((100 * (dropped / answers)) || 0).toFixed(0),
				prev_dropped              : this.prevDropped,
				dropped_delta             : this.prevDropped > dropped
					? dropped - this.prevDropped
					: this.prevDropped - dropped,
				agent_avg_wait            : (( this.campaigns.getAgentWaitToday() / agentCallsToday ) || 0).toFixed(2),
				average_talk_time         : (( this.campaigns.getAgentCustTalkToday() / agentCallsToday ) || 0).toFixed(2),
				calls_today               : callsToday,
				average_wrap              : this.campaigns.getAvgWrap(),
				average_pause             : ((this.campaigns.getAgentPauseToday() / agentCallsToday ) || 0).toFixed(2),
				// average_agents            : this.campaigns.getAgentsAverageOneMin(),
				dialable_leads            : this.campaigns.getDialableLeads(),
				dial_method               : this.campaigns.getDialMethod()
			});

			this.prevDropped = dropped;
		},

		getAgentsInCalls: function()
		{
			var
				users = this.users.models,
				l     = users.length,
				dead  = []
			;

			for(var i=0; i<l; i++)
			{
				var user = users[i];
				if(!user.get('callerid')) continue;

				var call = this.calls.findWhere({ callerid: user.callerid });

				if(!call) dead.push(user);
			}

			return dead;
		}

	});

	return AppModel;
};