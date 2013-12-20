(function($, bb, io)
{
	var socket = io.connect();
	
	//doc ready
	$(function()
	{
		/**
		 * Calls Waiting
		 */
		var Call = bb.Model.extend({});
		var CallCollection = bb.Collection.extend({});
		var CallView = bb.View.extend({
			
			tagName: 'tr',
			template: _.template($('#call-template').html()),
			
			events: {
				
			},
			
			initialize: function()
			{
				this.callsTable = $('#callsTable');

				this.listenTo(this.model, 'change', this.change);
				this.listenTo(this.model, 'add', this.render);
				this.listenTo(this.model, 'remove', this.remove);
			
				this.updateTable = _.debounce(function() {
					this.callsTable.trigger('update');
				}, 1000);

				this.sortTable = _.debounce(function() {
					this.callsTable.find('thead th:eq(2)').trigger('sort');
				}, 2000);

			},

			render: function()
			{
				if( this.model.get('status') !== 'XFER')
				{
					this.remove();
					return;
				}
				
				this.$el.html(this.template(this.model.toJSON()));
				this.callsTable.append( this.$el );
				
				//Update the table and sort on the time on hold column
				this.updateTable();
				this.sortTable();

				$('[title]').tooltip();
				
				return this;
			},

			change: function()
			{
				if (!this.$el) return;

				this.$el.html(this.template(this.model.toJSON()));
				return this;
			},
			
			remove: function()
			{
				if(!this.$el) return;
				
				this.$el.remove();
				this.el = null;
				this.$el = null;
			}

		});


		/**
		 * Active Resources
		 */
		var User = bb.Model.extend({});
		var UsersCollection = bb.Collection.extend({});
		var UserView = bb.View.extend({

			tagName: 'tr',
			
			template: _.template($('#resource-template').html()),
			
			events: {
				'click [data-monitor]' : 'monitor',
				'click [data-coach]'   : 'coach',
				'click [data-barge]'   : 'barge'
			},
			
			initialize: function()
			{
				this.usersTable = $('#resourcesTable');
					
				this.listenTo(this.model, 'change', this.change);
				this.listenTo(this.model, 'remove', this.remove);

				this.updateTable = _.debounce(function() {
					this.usersTable.trigger('update');
				}, 1000);
			},

			render: function()
			{
				var attrs = this.model.toJSON();
				attrs.time = this.formatTime(attrs.time);

				this.$el.html( this.template(attrs) );

				this.usersTable.append( this.$el );
			
				//Update the table for sorting
				this.updateTable();

				$('[title]').tooltip();

				return this;
			},

			formatTime: function(time)
			{
				var 
					hours = 0,
					mins = time / 60,
					secs = time % 60
				;

				if(mins > 60)
				{
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
				
				return this;
			},

			remove: function()
			{
				this.$el.remove();
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

				this.calls = new CallCollection();
				this.users = new UsersCollection();
		
				
				//Add sorting to the tables
				$('#resourcesTable').tablesorter({ 
					theme: 'bootstrap', 
				});

				$('#callsTable').tablesorter({
					theme: 'bootstrap', 
				});


				socket.emit('client.ready', function(data)
				{
					self.renderStats(data.stats);
					self.calls.add(data.calls);
					self.users.add(data.users);
				});

				socket.on('stats.changed', function(stats)
				{
					self.renderStats(stats);
				});


				socket.on('users.add', function(user)
				{
					self.users.add(user, { merge: true });
				});

				socket.on('users.remove', function(user)
				{
					self.users.remove(user);
				});

				socket.on('users.change', function(user)
				{
					self.users.add(user, { merge: true });
				});


				socket.on('calls.add', function(call)
				{
					self.calls.add(call, { merge: true });
				});

				socket.on('calls.remove', function(call)
				{
					self.calls.remove(call);
				});
				
				socket.on('calls.change', function(call)
				{
					self.calls.add(call, { merge: true });
				});
			

				socket.on('reconnecting', function(elapsed,attempts)
				{
					if(attempts > 3)
					{
						location.reload();
					}
				});


				this.listenTo(this.users, 'add', function(model)
				{
					var view = new UserView({ model: model });
					view.render();
				});

				this.listenTo(this.calls, 'add', function(model)
				{
					var view = new CallView({ model: model });
					view.render();
				});
			},
			
			renderStats: function(stats)
			{
				for(var key in stats)
				{
					var $el = $('[data-stat="' + key + '"]');
					if($el.length)
					{
						$el.text(stats[key]);
					}
				}

				if(stats['dropped'] == stats['prev_dropped'])
				{
					// $('[data-stat="dropped_running_tally"]').html('<i class="icon-arrow-right text-warning"></i>');
					$('[data-stat="dropped_running_tally"]').html('');
					$('[data-stat="dropped_delta"]').html('<span class="text-warning">+- 0</span>');
					$('[data-stat="dropped_pct"]').parent().removeClass('text-success text-danger').addClass('text-warning');
				}
				else if(stats['dropped'] > stats['prev_dropped'])
				{
					$('[data-stat="dropped_running_tally"]').html('<i class="icon-arrow-up text-danger"></i>');
					$('[data-stat="dropped_delta"]').html( '<span class="text-danger">+' + (stats['dropped_pct'] - stats['prev_dropped']) + '</span>' );
					$('[data-stat="dropped_pct"]').parent().removeClass('text-success text-warning').addClass('text-danger');
				}
				else
				{
					$('[data-stat="dropped_running_tally"]').html('<i class="icon-arrow-down text-success"></i>');
					$('[data-stat="dropped_delta"]').html( '<span class="text-success">-' + (stats['prev_dropped'] - stats['dropped_pct']) + '</span>' );
					$('[data-stat="dropped_pct"]').parent().removeClass('text-warning text-danger').addClass('text-success');
				}
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
