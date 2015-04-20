FK.home = {
	model: kendo.observable({
		DS: new kendo.data.DataSource({
			transport: {
				read: {
					url: Path.get('views'),
					dataType: "json",
					beforeSend: function(req) {
						req.setRequestHeader('Authorization',FK.settings.config.token)
					}
				}
			},
			batch: true,
			schema: {
				data: "content"
			},
			change: function() {
			},
            pullToRefresh: true
		}),
		actions: {
			showView: function(e) {
				//setTimeout(function(){ FK.inbox.model.observable.set('viewTitle', e.target.getAttribute('data-view')); }, 50);
				sessionStorage.setItem('lastViewTitle', e.target.getAttribute('data-view'));
				app.navigate(e.target.getAttribute('data-href'));
			}
		},
		onViewInit: function() {
            if(!FK.App.chkSession('token')){
                app.navigate('views/login.html');
            }            
			$.ajax({
				url: Path.get('buList'),
				headers: {'Authorization':FK.settings.config.token, "cache-control": "no-cache"},
				success: function(data) {
					sessionStorage.setItem('userAccounts', JSON.stringify(data.content));
					FK.settings.config.user.accounts = data.content;
				},
				error : function(e) {
					console.dir(e.responseText);
				}
			});
            $.ajax({
				url: Path.get('keywords'),
				headers: {'Authorization':FK.settings.config.token, "cache-control": "no-cache"},
				success: function(data) {
					sessionStorage.setItem('userKeywords', JSON.stringify(data.content));
					FK.settings.config.user.keywords = data.content;
				},
				error : function(e) {
					console.dir(e.responseText);
				}
			});
			//loadViews().done(function(data) {
				/*$("#home_views").html('hi');
				this.userViews = data.content;
				var data = data.content;

				var html = '';
				for (var i=0; i<data.length; i++) {
					var queryStringParams = FK.home.createInboxParams(data[i].filters);
					html += '<a href="views/inbox.html' + queryStringParams + '">heh ' + data[i].name + '</a>'
				}
				$('#home_views').html(html);*/
				/*$('#home_views').kendoMobileListView({
					dataSource: data.content,
					template: $('#home_views-template').html()
				})*/
			//});
			
			
		},
		onViewShow: function() {
			var tabstrip = app.view().footer.find(".km-tabstrip").data("kendoMobileTabStrip");
			tabstrip.switchTo(0);
		},
        logout: function(){
            $.cookie("token", null);
            sessionStorage.setItem('token', null);
            app.navigate('views/login.html');
        }
	}),	
	createInboxParams : function(params) {
		var queryString = '',
			seperator = '?',
			count = 0;
		
		for (var key in params) {
			if (params.hasOwnProperty(key)) {
				//console.log (key + " -> " + params[key]);
				var val = params[key];
				delete params.uid;
				if (typeof val !== 'object' && typeof val !== 'function' && val != '' && key !== 'name') {
					if (count >= 1) seperator = '&';
					queryString += seperator + key + '=' + val;
					count++;
				}
			}
		}
		return queryString;
	}
};

function loadViews() {
	return $.ajax({
		type: 'GET',
		url: Path.get('views'),
		headers: {'Authorization':FK.settings.config.token}
	});
}
