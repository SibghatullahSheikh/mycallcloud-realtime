module.exports = function(mysql, options)
{
	var
		_        = require('underscore')._,
		Backbone = require('backbone'),
		UserModel = require('./UserModel')(mysql)
	;

	return Backbone.Collection.extend({

		/**
		 * Model to use in Collection
		 */
		model: UserModel,

		/**
		 * Initialization
		 */
		initialize: function()
		{
			var self = this;

			self.getUsers(function()
			{
				setInterval(
					function()
					{
						self.getUsers();
					},
					1 * 1000
				);
			});
		},

		/**
		 * Get Users from the database
		 * add to Collection
		 */
		getUsers: function(cb)
		{
			var self = this;

			var fields = [
				"vicidial_users.user_id AS id",
				"vicidial_users.user AS 'linkid'",
				"vicidial_users.full_name AS 'user'",
				"vicidial_users.user_group AS 'group'",
				"vicidial_live_agents.status AS 'status'",
				"vicidial_live_agents.lead_id AS 'lead_id'",
				"vicidial_live_agents.conf_exten AS 'session_id'",
				"vicidial_live_agents.callerid",
				"UNIX_TIMESTAMP(vicidial_live_agents.last_update_time) - UNIX_TIMESTAMP(vicidial_live_agents.last_call_time) AS 'time'",
				"SUBSTRING_INDEX(vicidial_live_agents.extension, '/', -1) AS 'extension'",
				"vicidial_live_agents.campaign_id AS 'campaign'",
				"vicidial_live_agents.calls_today AS 'calls'",
				"vicidial_live_agents.extension AS 'station'",
				"(case when realtime.contacts>0 then realtime.contacts else 0 end) 'contacts'",
				"(case when realtime.successes>0 then realtime.successes else 0 end) 'successes'",
				"(case when realtime.transfers>0 then realtime.transfers else 0 end) 'transfers'",
				"vicidial_campaigns.closer_campaigns AS 'in-group'",
				"vicidial_live_agents.server_ip AS 'server_ip'"
			];
			
			var query = '';
			query += "SELECT " + fields.join(',');
			query += " FROM vicidial_live_agents";
			query += " LEFT JOIN realtime ON vicidial_live_agents.user = realtime.userid";
			query += " LEFT JOIN vicidial_users ON vicidial_live_agents.user = vicidial_users.user";
			query += " LEFT JOIN vicidial_campaigns ON vicidial_live_agents.campaign_id = vicidial_campaigns.campaign_id";
			
			mysql.query(query, function(err, results)
			{
				if(err)
				{
					console.log('Get Users SQL Error: ', err);
					return;
				}


				var models = self.models;
				var	remove = [];
				var	add = [];
				

				for(var i=0; i<models.length; i++)
				{
					var
						model  = models[i]
					;

					if( result = _.findWhere(results, { id: model.id }) )
					{
						add.push(result);
						results = _.without(results, result);
					}
					else
					{
						remove.push(model);
					}
				}

				for(var i=0; i<results.length; i++)
				{
					add.push(results[i]);
				}

				self.add(add, { merge: true });
				self.remove(remove);

				if(cb && _.isFunction(cb))
				{
					cb(results);
				}
			});
		},

		/**
		 * Get Logged In Users
		 */
		getLoggedInUsers: function()
		{
			return this.models.length;
		},

		/**
		 * Get Users In Calls
		 */
		getUsersInCalls: function()
		{
			return this.where({
				status: 'INCALL'
			});
		},

		/**
		 * Get Users In Dispo
		 */
		getUsersInDispo: function()
		{
			return this.filter(function(user)
			{
				return ( (user.get('status') === 'READY' || user.get('status') === 'PAUSED') &&  user.get('lead_id') > 0);
			});
		},

		/**
		 * Get Paused Users
		 */
		getPausedUsers: function()
		{
			return this.where({
				status: 'PAUSED'
			});
		},

		/**
		 * Get Ready Users
		 */
		getReadyUsers: function()
		{
			return this.where({
				status: 'READY'
			});
		},

		/**
		 * Get Queued Users
		 */
		getQueuedUsers: function()
		{
			return this.where({
				status: 'QUEUE'
			});
		}

	});
};
