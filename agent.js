/**
 * Agent Model
 */
module.exports = function(mysql)
{
	var Agent = function(attrs)
	{
		for(var key in attrs)
		{
			this[key] = attrs[key];
		}

		this.dead                     = false;
		this.paused                   = false;
		this.dispo                    = false;
		this.calls_ringing            = false;
		this.calls_waiting_for_agents = false;

		this.getWaiting();
		this.getInCall();
		this.getDispo();
		this.getCallTime();
	}

	Agent.fn = Agent.prototype;

	Agent.fn.getWaiting = function()
	{
		this.waiting = this.status.match('READY|CLOSER');
	}

	Agent.fn.getInCall = function()
	{
		this.in_call = this.status.match('INCALL|QUEUE|3-WAY|PARK');
	}

	Agent.fn.getDispo = function()
	{
		if(this.status.match('READY|PAUSED') && this.lead_id > 0)
		{
			this.time   = this.change;
			this.status = 'DISPO';
			this.dispo  = true;
		}

		this.getPaused();
		this.getPark();
	}

	Agent.fn.getPaused = function()
	{
		if(this.status.match('PAUSED'))
		{
			this.paused = true;
		}
	}

	Agent.fn.getPark = function()
	{
		if(this.status.match('INCALL'))
		{
			var self = this;
			mysql.query('SELECT COUNT(*) FROM parked_channels WHERE channel_group = ?', [self.callerid], function(err, results)
			{
				if(results.length)
				{
					self.status = 'PARK';
				}
			});
		}
		else
		{
			this.getDead();
		}

		this.getRinging();
	}

	Agent.fn.getDead = function()
	{
		var self = this;

		mysql.query('SELECT callerid,lead_id,phone_number FROM vicidial_auto_calls', function(err, results)
		{
			var contains_caller_id;

			for(var i=0; i<results.length; i++)
			{
				var newCallerId = results[i].callerid;
				if(newCallerId === self.callerid)
				{
					contains_caller_id = true;
				}
			}

			if(!contains_caller_id && self.comments.match('EMAIL'))
			{
				self.status = dead;
				self.dead = true;
			}
		});
	}

	Agent.fn.getRinging = function()
	{
		if(this.status.match('LIVE|IVR|CLOSER'))
		{
			this.calls_ringing = true;
		}

		this.getCallsWaitingForAgents();
	}

	Agent.fn.getCallsWaitingForAgents = function()
	{
		if(this.status.match('LIVE'))
		{
			this.calls_waiting_for_agents = true;
		}
	}

	Agent.fn.getCallTime = function()
	{
		var startTime = new Date().getTime() / 1000;
		var mostRecent = this.getCallMostRecent(this.lead_id);

		if(this.status.match('INCALL|QUEUE|PARK|3-WAY'))
		{
			this.call_time_S = startTime - this.change;
		}
		else if(this.status.match('3-WAY'))
		{
			this.call_time_S = startTime - mostRecent;
		}
		else
		{
			this.call_time_S = startTime - this.time;
		}
	}

	Agent.fn.getCallMostRecent = function(lead_id)
	{
		if(lead_id != 0)
		{
			mysql.query("SELECT UNIX_TIMESTAMP(last_call_time) from vicidial_live_agents where lead_id=? and status='INCALL' order by UNIX_TIMESTAMP(last_call_time) desc", [lead_id], function(err, results)
      		{
      			if(results.length > 1)
      			{
      				return results[0];
      			}
      		});
		}
	}


	return Agent;
}