(function($, Backbone, io)
{
	var socket = io.connect();

	//doc ready
	$(function()
	{
		//init the table sorter
		$('#resourcesTable').tablesorter();
		
		/**
		 * Active Resources
		 */
		var UsersCollection = Backbone.Collection.extend({});
		
		
		var UserView = Backbone.View.extend({

			el: $('#resourcesTable').find('tbody:last'),
			
			template: _.template($('#resource-template').html()),

			events: {
				'click [data-monitor]' : 'monitor',
				'click [data-coach]'   : 'coach',
				'click [data-barge]'   : 'barge'
			},
			
			initialize: function(model)
			{
				this.model = model;
				this.listenTo(this.model, 'change', this.change);
				this.listenTo(this.model, 'remove', this.remove);
			},

			render: function()
			{
				var attrs = this.model.toJSON();
				attrs.time = this.formatTime(attrs.time);


				this.$el.append(this.template(attrs));
				
				//Update the element now that it's been added
				this.el = $('#resourcesTable').find('tbody:last');

				
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
				console.log("model changed");
				var attrs = this.model.toJSON();
				attrs.time = this.formatTime(attrs.time);

				this.$el.html(this.template(attrs));
				return this;
			},

			remove: function()
			{
				//this.$el.remove();
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
		var AppView = Backbone.View.extend({

			/**
			 * Initialization Function
			 *
			 * register our socket listeners
			 */
			initialize: function()
			{
				var self = this;

				this.users = new UsersCollection();

				socket.emit('client.ready', function(data)
				{
					self.users.add(data.users);
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


				socket.on('reconnecting', function(elapsed,attempts)
				{
					if(attempts > 3)
					{
					//	location.reload();
					}
				});


				this.listenTo(this.users, 'add', function(model)
				{
					var view = new UserView(model);
					view.render();
				});

			},
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
