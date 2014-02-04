(function($, bb, io)
{
	var socket = io.connect();
	
	//doc ready
	$(function()
	{
		var ContainerView = bb.View.extend({
			
			el:$('.column'),

			initialize: function() {
				this.$el.sortable({ 
					connectWith: '.column',
          update: function( event, ui ) {
            localStorage.setItem('order', _.pluck($('.column').children(),'id').join(','));
          }
				});
    
    		this.$el.disableSelection();
			 
        //Initialize the order of the widgets
        var order = localStorage.getItem('order');

        if (order) {
          order = order.split(',')

          _.each(order, function(id) {
            $('#' + id).appendTo('.column');
          });
        }
      
      }			
		});

		var CurrentStatusWidgetView = bb.View.extend({
			el: $('#current-status-widget'),

			events: {
				'click .toggle': 'toggle'
			},

			initialize: function() {
				this.shown = localStorage.getItem('showCurrentStatus') || true;
        
        //localStorage saves everything as strings, so convert to bool
        if (this.shown == "false") {
          this.shown = false;
        }

        this.update();
			},

			toggle: function(ev) {
			  this.shown = !this.shown;
        localStorage.setItem('showCurrentStatus', this.shown);
        this.update();
      },

      update: function() {
				if (this.shown) {	
					this.$el.find('.portlet-content').css('display', 'block');
					this.$el.find('.toggle').text('Hide Current Status');
				} else {
					this.$el.find('.portlet-content').css('display', 'none');
					this.$el.find('.toggle').text('Show Current Status');
				}
      },
		});

		var ActiveResourcesWidgetView = bb.View.extend({
			el: $('#active-resources-widget'),

			events: {
				'click .toggle': 'toggle',
			  'click .notifications' : 'notifications'
      },

			initialize: function() {
				this.shown = localStorage.getItem('showActiveResources') || true;
        this.enableNotifications = localStorage.getItem('enableNotifications') || true;

        //localStorage saves everything as strings, so convert to bool
        if (this.shown == 'false') {
          this.shown = false;
        }
        
        if (this.enableNotifications == 'false') {
          this.enableNotifications = false;
        }

        this.update();
			},

			toggle: function(ev) {
			  this.shown = !this.shown;
        localStorage.setItem('showActiveResources', this.shown);
        this.update();
      },
			
      notifications: function() {
        this.enableNotifications = !this.enableNotifications;
        console.log('Notifications', this.enableNotifications);
        localStorage.setItem('enableNotifications', this.enableNotifications);
        this.update();
      },

      update: function() {
				if (this.shown) {	
					this.$el.find('.portlet-content').css('display', 'block');
					this.$el.find('.toggle').text('Hide Active Resources');
					this.$el.resizable({ handles:'s' });
				} else {
					this.$el.find('.portlet-content').css('display', 'none');
					this.$el.find('.toggle').text('Show Active Resources');
					this.$el.css('height','auto');
				
          //This throws an error if it tries to destroy before it's created, just ignore
          try {
            this.$el.resizable('destroy');
          }
          catch(err) {}
				}

        if (this.enableNotifications) {
          this.$el.find('.notifications').text('Disable Notifications');
          this.$el.find('#resourcesTable').removeClass('table-striped');
        } else {
          this.$el.find('.notifications').text('Enable Notifications');
          this.$el.find('#resourcesTable').addClass('table-striped');
          this.$el.find('tr').removeClass();
        }
      }
		});

		var CallsWaitingWidgetView = bb.View.extend({
			el: $('#calls-waiting-widget'),

			events: {
				'click .toggle': 'toggle'
			},

			initialize: function() {
				this.shown = localStorage.getItem('showCallsWaiting') || true;
        
        //localStorage saves everything as strings, so convert to bool
        if (this.shown == "false") {
          this.shown = false;
        }

        this.update();
			},

			toggle: function(ev) {
			  this.shown = !this.shown;
        localStorage.setItem('showCallsWaiting', this.shown);
        this.update()
      },

      update: function() {
				if (this.shown) {	
					this.$el.find('.portlet-content').css('display', 'block');
					this.$el.find('.toggle').text('Hide Calls Waiting');
					this.$el.resizable({ handles:'s' });
				} else {
					this.$el.find('.portlet-content').css('display', 'none');
					this.$el.find('.toggle').text('Show Calls Waiting');
					this.$el.css('height','auto');
					
          //Causes error if attempt to destroy before creating, just ignore
          try {
            this.$el.resizable('destroy');
				  } catch (err) {}
        }

      }
		});

		var CustomWidgetView = bb.View.extend({
			el: $('#custom-widget'),

			events: {
				'click .toggle': 'toggle'
			},

			initialize: function() {
        var self = this;

				this.shown = localStorage.getItem('showCustom') || true;
        
        //localStorage saves everything as strings, so convert to bool
        if (this.shown == "false") {
          this.shown = false;
        }
        this.$el.resize(function() {
          console.log('widget resized!', self.$el.height());
          self.$el.find('iframe').attr('height', self.$el.height() - 140);
        });

        this.update();
			},

			toggle: function(ev) {
			  this.shown = !this.shown;
        localStorage.setItem('showCustom', this.shown);
        this.update()
      },

      update: function() {
				if (this.shown) {	
					this.$el.find('.portlet-content').css('display', 'block');
					this.$el.find('.toggle').text('Hide Custom Widget');
					this.$el.resizable({ handles:'s' });
				} else {
					this.$el.find('.portlet-content').css('display', 'none');
					this.$el.find('.toggle').text('Show Custom Widget');
					this.$el.css('height','auto');
					
          //Causes error if attempt to destroy before creating, just ignore
          try {
            this.$el.resizable('destroy');
				  } catch (err) {}
        }

      }
		});


		var CampaignStatsWidgetView = bb.View.extend({
			el: $('#campaign-stats-widget'),

			events: {
				'click .toggle': 'toggle'
			},

			initialize: function() {
				this.shown = localStorage.getItem('showSummaryStats') || true;
        
        //localStorage saves everything as strings, so convert to bool
        if (this.shown == "false") {
          this.shown = false;
        }

        this.update();
			},

			toggle: function(ev) {
			  this.shown = !this.shown;
        localStorage.setItem('showSummaryStats', this.shown);
        this.update();
      },

      update: function() {
				if (this.shown) {	
					this.$el.find('.portlet-content').css('display', 'block');
					this.$el.find('.toggle').text('Hide Summary Stats');
				} else {
					this.$el.find('.portlet-content').css('display', 'none');
					this.$el.find('.toggle').text('Show Summary Stats');
				}
      }
		});
    
    function Filters() {};

    Filters.getCampaigns = function() {
      var campaigns = localStorage.getItem('campaigns');

      if (campaigns) {
        return campaigns.split(',');
      } else {
        return [];
      }
    };

    Filters.inCampaign = function(campaign) {
      var campaigns = _.map(Filters.getCampaigns(), function(temp) { return temp.toUpperCase(); });

      if (campaigns.indexOf(campaign.toUpperCase()) > -1) {
        return true;
      } else {
        return false;
      }
    };

    Filters.getGroups = function() {
      var groups = localStorage.getItem('groups');

      if (groups) {
        return groups.split(',');
      } else {
        return [];
      }
    };

    Filters.inGroup = function(group) {
      var groups = _.map(Filters.getGroups(), function(temp) { return temp.toUpperCase(); });

      if (groups.indexOf(group.toUpperCase()) > -1) {
        return true;
      } else {
        return false;
      }
    };
  


		var UserOptions = bb.View.extend({
			
			el: $('#user-options'),
			
			initialize: function() {
				//Setup the campaigns options
				var campaigns = localStorage.getItem('campaigns');

				if (campaigns) {
					$('#options-campaigns').removeAttr('disabled');					
					$('#options-campaigns').val(campaigns.split(','));
					$('#show-all-campaigns').prop('checked', false);
				} else {
					$('#options-campaigns').attr('disabled','disabled');
					$('#options-campaigns option').prop('selected', true);
					$('#show-all-campaigns').prop('checked',true);

					//init the campaign options
					this.updateCampaignOptions();
				}

				//Setup the user groups options
				var groups = localStorage.getItem('groups');

				if (groups) {
					$('#options-groups').removeAttr('disabled');					
					$('#options-groups').val(groups.split(','));
					$('#show-all-groups').prop('checked', false);
				} else {
					$('#options-groups').attr('disabled','disabled');
					$('#options-groups option').prop('selected', true);
					$('#show-all-groups').prop('checked',true);

					//init the group options
					this.updateGroupOptions();
				}

        //Setup display options
        var display = localStorage.getItem('display');

        if (display) {
          $('#options-display').val(display);  
        }

        //init the display options
        this.updateDisplayOptions();
			},

			events: {
				'click #options-campaigns' : 'updateCampaignOptions',
				'click #options-groups' : 'updateGroupOptions',
				'click #show-all-campaigns' : 'showAllCampaigns',
				'click #show-all-groups' : 'showAllUserGroups',
			  'change #options-display' : 'updateDisplayOptions'
      },
      
      updateDisplayOptions: function(ev) {
        var display = $('#options-display').val();
        
        if (display) {
          localStorage.setItem('display', display);
          $('body').removeClass().addClass(display);
        } else {
          //Set default value for display
          localStorage.setItem('display', 'Normal');
        }
      },

			updateCampaignOptions: function(ev) {
				var campaigns = $('#options-campaigns').val();

				if (campaigns) {
					localStorage.setItem('campaigns', campaigns.join(','));
				} else {
					//Null means show all campaigns
					localStorage.setItem('campaigns','');
				}
			}, 

			updateGroupOptions: function(ev) {
				var groups = $('#options-groups').val();
				
				if (groups) {
					localStorage.setItem('groups', groups.join(','));
				} else {
					//Null means show all groups
					localStorage.setItem('groups', '');
				}
			},

			showAllCampaigns: function(ev) {
				if($('#show-all-campaigns').prop('checked')) {
					$('#options-campaigns').attr('disabled', 'disabled');
					$('#options-campaigns option').prop('selected', true);
				} else {
					$('#options-campaigns').removeAttr('disabled');
				}

				//reload the campaign options
				this.updateCampaignOptions(ev);
			},

			showAllUserGroups: function(ev) {
				if($('#show-all-groups').prop('checked')) {
					$('#options-groups').attr('disabled', 'disabled');
					$('#options-groups option').prop('selected', true);	
				} else {
					$('#options-groups').removeAttr('disabled');
				}

				//reload the group options
				this.updateGroupOptions(ev);
			}
		});
		
		
		
		/**
		 * Calls Waiting
		 */
		var CallModel = bb.Model.extend();
		
    var CallsCollection = bb.Collection.extend({
      model: CallModel,

      url: '/api/calls'
    });
		
    
    var CallView = bb.View.extend({
      template: _.template($('#call-template').html()),
			
			initialize: function(model) {
        this.model = model;
				this.listenTo(this.model, 'change', this.change);
				this.listenTo(this.model, 'remove', this.remove);
			
        this.updateTable = _.debounce(function() {
					$('#callsTable').trigger('update');
				}, 1000);

				this.sortTable = _.debounce(function() {
					$('#callsTable').find('thead th:eq(2)').trigger('sorton',[2,1]);
				}, 2000);
			  
        this.render();
      },

			render: function() {
				if(this.model.get('status') !== 'XFER') {
					return;
				}
				
        //Don't render if filtered
        if (!Filters.inCampaign(this.model.get('campaign'))) {
          return;
        }
        
        this.setElement('<tr>' + this.template(this.model.toJSON()) + '</tr>');
        $('#callsTable').find('tbody').append(this.$el);
				
				//Update the table and sort on the time on hold column
				this.updateTable();
				this.sortTable();
			},

			change: function(model) {
        this.$el.html(this.template(this.model.toJSON()));
				this.updateTable();
				this.sortTable();
      },
			
			remove: function(model) {
        this.$el.remove();
				this.updateTable();
				this.sortTable();
      }
		});
    
    /**
    * Current Status
    */
    var CurrentStatusView = bb.View.extend({
      el: $('#current-status-widget'),

      initialize: function(agentsCollection, callsCollection) {
        this.agents = agentsCollection;
        this.calls = callsCollection;
        this.listenTo(this.agents, 'change reset add remove', this.render);
        this.listenTo(this.calls, 'change reset add remove', this.render);
        this.render();
      },

      render: function() {

        //Agent Counters
        var agentsLoggedIn = 0;
        var agentsWaiting = 0;
        var agentsPaused = 0;
        var agentsInCalls = 0;
        var agentsInDispo = 0;
        var agentsInDeadCalls = 0;

        for (var i=0;i<this.agents.length;i++) {
          if ((Filters.inGroup(this.agents.at(i).get('group'))) && (Filters.inCampaign(this.agents.at(i).get('campaign')))) {
            agentsLoggedIn++;
          
            var status = this.agents.at(i).get('status');
            
            if (status === 'READY') {
              agentsWaiting++;
            } else if (status === 'PAUSED') {
              agentsPaused++;
            } else if (status === 'INCALL') {
              agentsInCalls++;
            }
            
            if (status === 'READY' || status === 'PAUSED') {
              if (this.agents.at(i).get('lead_id') > 0) {
                agentsInDispo++;
              }
            }

            var callerId = this.agents.at(i).get('callerid');

            if (callerId) {
              var call = this.calls.findWhere({ callerid: callerId });
              
              if (!call) {
                agentsInDeadCalls++;
              }
            }
          }
        }

        //Call Counters
        var callsRinging = 0;
        var callsActive = 0;
        var callsWaiting = 0;

        for (var i=0;i<this.calls.length;i++) {
          if (Filters.inCampaign(this.calls.at(i).get('campaign'))) {
            callsActive++;
          
            var status = this.calls.at(i).get('status');
            
            if (status === 'SENT') {
              callsRinging++;
            } else if (status === 'XFER') {
              callsWaiting++;
            }
          }
        }
        
        //Update the status
        this.$el.find('#status-agents-logged-in').text(agentsLoggedIn);
        this.$el.find('#status-agents-waiting').text(agentsWaiting);
        this.$el.find('#status-agents-paused').text(agentsPaused);
        this.$el.find('#status-agents-in-calls').text(agentsInCalls);
        this.$el.find('#status-agents-in-dispo').text(agentsInDispo);
        this.$el.find('#status-agents-in-dead-calls').text(agentsInDeadCalls);
        this.$el.find('#status-calls-active').text(callsActive);
        this.$el.find('#status-calls-ringing').text(callsRinging);
        this.$el.find('#status-calls-waiting').text(callsWaiting);
      }
    });



    /**
    * Campaign Stats
    */
    var CampaignModel = bb.Model.extend({
      defaults: {
        calls_today: 0,
        drops_today: 0,
        answers_today: 0,
        dispo_today: 0,
        dialable_leads: 0,
        agent_calls_today: 0,
        agent_pause_today: 0,
        agent_custtalk_today: 0,
        agent_wait_today: 0
      }
    });
    
    var CampaignsCollection = bb.Collection.extend({
      model: CampaignModel,

      url: '/api/campaigns',
    });

    var CampaignsView = bb.View.extend({
      el: $('#campaign-stats-widget'),

      initialize: function(collection) {
        this.collection = collection;
        this.listenTo(this.collection, 'add', this.render);
        this.listenTo(this.collection, 'change', this.render);
        this.render();
      },

      render: function() {
        
        //Init Counter Variables
        var callsToday = 0;
        var dispoToday = 0;
        var dropsToday = 0;
        var answersToday = 0;
        var agentPauseToday = 0;
        var agentTalkToday = 0;
        var dialableLeads = 0;
        var agentWaitToday = 0; 
        var agentCallsToday = 0;

        //Loop through the collection and count the fields of the filtered campaigns
        for(var i=0;i<this.collection.length;i++) {
          //check if this collections campaign is selected by the filter
          if (Filters.inCampaign(this.collection.at(i).get('id'))) {
            //Increment Counters
            callsToday += this.collection.at(i).get('calls_today'); 
            dropsToday += this.collection.at(i).get('drops_today');
            answersToday += this.collection.at(i).get('answers_today');
            dialableLeads += this.collection.at(i).get('dialable_leads');
            agentCallsToday += this.collection.at(i).get('agent_calls_today');
            agentPauseToday += this.collection.at(i).get('agent_pause_today');
            agentTalkToday += this.collection.at(i).get('agent_custtalk_today');
            agentWaitToday += this.collection.at(i).get('agent_wait_today');
            dispoToday += this.collection.at(i).get('dispo_today');
          }
        }
       
        //Calucalate derived stats
        var averageWait = Math.round((agentWaitToday / agentCallsToday) || 0);
        var averagePause = Math.round((agentPauseToday / agentCallsToday) || 0);
        var averageTalk = Math.round((agentTalkToday / agentCallsToday) || 0);
        var averageWrap = Math.round((dispoToday / agentCallsToday) || 0); 
        var droppedPercentage = Math.round((100 * (dropsToday / answersToday)) || 0);

        //Update the view
        this.$el.find('#campaign-stats-calls-today').text(callsToday);
        this.$el.find('#campaign-stats-dialable-leads').text(dialableLeads);
        this.$el.find('#campaign-stats-average-wait').text(averageWait);
        this.$el.find('#campaign-stats-average-pause').text(averagePause);
        this.$el.find('#campaign-stats-average-talk').text(averageTalk);
        this.$el.find('#campaign-stats-average-wrap').text(averageWrap);
        this.$el.find('#campaign-stats-dropped-percentage').text(droppedPercentage);
      },
    });
   

		/**
		 * Active Resources
		 */
		var AgentModel = bb.Model.extend();

		var AgentsCollection = bb.Collection.extend({
      model: AgentModel,

      url: 'api/agents'
    });
    
    var AgentView = bb.View.extend({

			tagName: 'tr',
			
			template: _.template($('#resource-template').html()),
			
			events: {
				'click [data-monitor]' : 'monitor',
				'click [data-coach]'   : 'coach',
				'click [data-barge]'   : 'barge'
			},
			
			initialize: function(model, callsCollection)
			{
        this.model = model;
        this.calls = callsCollection;

				this.usersTable = $('#resourcesTable');
					
				this.listenTo(this.model, 'change', this.change);
				this.listenTo(this.model, 'remove', this.remove);

				this.updateTable = _.debounce(function() {
					this.usersTable.trigger('update');
				}, 1000);
			
        this.render();
      },

			render: function()
			{
        if (!Filters.inCampaign(this.model.get('campaign'))) {
          return;
        }

        if (!Filters.inGroup(this.model.get('group'))) {
          return; 
        }

				var attrs = this.model.toJSON();
				attrs.time = this.formatTime(attrs.time);

				this.$el.html( this.template(attrs) );

				this.usersTable.append( this.$el );
			
				//Update the table for sorting
				this.updateTable();

        this.updateNotification();
				
        $('[title]').tooltip();

				return this;
			},

			formatTime: function(time)
			{
				var hours = 0;
				var	mins = time / 60;
			  var		secs = time % 60;

				if(mins > 60) {
					hours = mins / 60;
					mins = mins % 60;
					secs = mins % 60;
				}

				return this.leadingZero(hours.toFixed(0), 2) + ':' + this.leadingZero(mins.toFixed(0), 2) + ':' + this.leadingZero(secs.toFixed(0), 2);
			},

			leadingZero: function(num, size)
			{
				if(typeof(size) !== "number"){size = 2;}

				var s = String(num);
				while (s.length < size) s = "0" + s;
				
				return s;
			},

			change: function()
			{
				var attrs = this.model.toJSON();
				attrs.time = this.formatTime(attrs.time);

				this.$el.html( this.template(attrs) );
				
				//Update the table for sorting
				this.updateTable();
				
        this.updateNotification();

				return this;
			},

			remove: function()
			{
				this.$el.remove();
			},
      
      updateNotification: function() {
        //Find the element
        var el = $('tr#' + this.model.get('id'));
        
        //First, remove all classes to reset the notification
        el.removeClass();
        
        //Check if notifications are enabled
        var enabled = localStorage.getItem('enableNotifications') || true;
        
        if (enabled == 'false') {
          enabled = false;
        }

        if (enabled) {
          if (this.model.get('status') == 'PAUSED') {
            if (this.model.get('time') > 5*60) {
              el.addClass('notification-paused-danger');
            } else if (this.model.get('time') > 1*60) {
              el.addClass('notification-paused-warning');
            } else {
              el.addClass('notification-paused');
            }
          } else if (this.model.get('status') == 'READY') {
            if (this.model.get('time') > 5*60) {
              el.addClass('notification-ready-danger');
            } else if (this.model.get('time') > 1*60) {
              el.addClass('notification-ready-warning');
            } else {
              el.addClass('notification-ready');
            }
          } else if (this.model.get('status') == 'INCALL') {
            var callerId = this.model.get('callerid');

            if (callerId) {
              var call = this.calls.findWhere({ callerid: callerId });
            } else {
              var call = false;
            }
           
            if (!call) {
              el.addClass('notification-indeadcall');
            } else if (this.model.get('time') > 5*60) {
              el.addClass('notification-incall-danger');
            } else if (this.model.get('time') > 1*60) {
              el.addClass('notification-incall-warning');
            } else {
              el.addClass('notification-incall');
            }
          } else if (this.model.get('status') == '3-WAY') {
            el.addClass('notification-3way');
          }
        }
      },

			monitor: function()
			{
				var
					data = $('.btn-group', this.$el).data(),
					attr = {
						'session_id': data.sessionId,
						'server_ip': data.serverIp,
						'extension': data.extension
					}
				;
				
				socket.emit(
					'monitor', attr, function(res)
					{
						console.log(res);
					}
				);
			},

			coach: function()
			{
				var
					data = $('.btn-group', this.$el).data(),
					attr = {
						'session_id': data.sessionId,
						'server_ip': data.serverIp,
						'extension': data.extension
					}
				;
				
				socket.emit(
					'coach', attr, function(res)
					{
						console.log(res);
					}
				);
			},

			barge: function()
			{
				var
					data = $('.btn-group', this.$el).data(),
					attr = {
						'session_id': data.sessionId,
						'server_ip': data.serverIp,
						'extension': data.extension
					}
				;
				
				socket.emit(
					'barge', attr, function(res)
					{
						console.log(res);
					}
				);
			}

		});


		/**
		 * Application
		 */
		var AppView = bb.View.extend({

			/**
			 * Initialization Function
			 *
			 * register our socket listeners
			 */
			initialize: function()
			{
				var self = this;
        
        //create the collections
				this.callsCollection = new CallsCollection();
				this.agentsCollection = new AgentsCollection();
        this.campaignsCollection = new CampaignsCollection();
				
        
        //Create the views
				this.containerView = new ContainerView();
				this.callsWaitingWidget = new CallsWaitingWidgetView();
				this.summaryStatsWidget = new CampaignStatsWidgetView();
				this.currentStatusWidget = new CurrentStatusWidgetView();
				this.activeResourcesWidget = new ActiveResourcesWidgetView();
				this.customWidget = new CustomWidgetView();

        this.userOptions = new UserOptions();	

        this.campaignsView = new CampaignsView(this.campaignsCollection);
        this.currentStatusView = new CurrentStatusView(this.agentsCollection, this.callsCollection);

        this.listenTo(this.callsCollection, 'add', function(model) {
          var view = new CallView(model);
        });
        
        this.listenTo(this.agentsCollection, 'add', function(model) {
          var view = new AgentView(model, this.callsCollection);
        });

        //initialize the collections 
        self.callsCollection.fetch();
        this.agentsCollection.fetch();
        self.campaignsCollection.fetch();
        
        //Setup update intervals for the collecctions
        setInterval((function() {
          self.callsCollection.fetch();
        }),1000*5);
        
        setInterval((function() {
          self.agentsCollection.fetch();
        }),1000*5);
        
        setInterval((function() {
          self.campaignsCollection.fetch();
        }),1000*60*5);

				//Add sorting to the tables
				$('#resourcesTable').tablesorter({ 
					theme: 'bootstrap', 
				});

				$('#callsTable').tablesorter({
					theme: 'bootstrap', 
				});
		  }
		});


		var App = new AppView;

		$('[title]').tooltip();
	
		var curr = 0;
		$('[data-toggle="phone"]').on('click', function(e)
		{
			e.preventDefault();

			var h = (curr === 330)
				? 0
				: 330;

			curr = h;

			$('#webphone').height(curr);
		});
	});
}(jQuery, Backbone, io));
