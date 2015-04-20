FK.searchlist = {
    vars: {
		holdState: false
	},
    page: 1
}

FK.searchlist.model = {
	observable: kendo.observable({
		mailCount: 0,
		unread: 0,
		showActions: false,
		viewMode: '',
		viewTitle: 'Search results'
	}),
	onViewInit: function (e) {
        if(!FK.App.chkSession('token')){
            app.navigate('views/login.html');
        }
		console.log('init called on search');

	},
	onViewShow: function (e) {
        setTimeout(clearSearchList,100);
		sessionStorage.setItem('selectedMessages', '[]');
		$('#mailCount').addClass('fa fa-spinner fa-spin');
		getSearchMailCount(e).done(function (data) {
			$('#mailCount').attr('class', '');
			FK.searchlist.model.observable.set('mailCount', data.count);
			
			initSearchList(e);

			var params = e.view.params;
			console.log ('take ' + data.count);
			params.take = data.count;
			params.skip = 0;
			FK.App.allSearchMessageIDsInView(params);
		});
	}
};



FK.searchlist.actions = {
	readMail: function (e) {
		clearSearchList();
		try {
			app.navigate("views/mail.html?itemId=" + e.dataItem.MessageID);
		} catch(e) {
			console.log (e);	
		}
	},
	reply: function (uid) {
		//console.log('reply one');
	}
};


function initSearchMailList(data) {
	var node = $('#searchlist_mailList');
    
	console.log(node.attr('data-role'));
	if (node.hasClass('km-listview')) {
		node.data('kendoMobileListView').destroy();

	}
    
    
	node.kendoMobileListView({
		//pullToRefresh: true,
		endlessScroll: true,
		dataSource: FK.searchlist.DS,
		template: $("#searchlist_mailList-template").text(),
        click: FK.searchlist.actions.readMail
	});	
}

function clearSearchList() {
	var listNode = $("#searchlist_mailList");
	
	if (listNode.attr('data-role') == 'listview') {
		console.log ('destroying list');
		//listNode.data('kendoMobileListView').destroy();
	}
	listNode.html('');
}

function initSearchList(e) {
	//var buPath = (e.view.params).buPath;
	sessionStorage.setItem('viewParams', JSON.stringify(e.view.params));
	FK.searchlist.DS = new kendo.data.DataSource({
		//type: 'odata',
		transport: {
			read: {
				url: Path.get('searchMailList'),
				dataType: "json",
				beforeSend: function (req) {
					req.setRequestHeader('Authorization', FK.settings.config.token)
				},
				data: e.view.params
			}
		},
		requestEnd: function (e) {
			var response = e.response,
				IDs = [];
			for (var i = 0, l = response.length; i < l; i++) {
				IDs.push(response[i].MessageID);
			}
			FK.App.maillistStrip({
				page: FK.searchlist.page,
				mailIDs: IDs
			});
		},
		schema: {
			total: function () {
				return parseInt(FK.searchlist.model.observable.mailCount);
			}
			/*model: {
				parse: function (response) {
					var keywords = [];
					for (var i = 0; i < response.length; i++) {
						var keyword = (response[i].keywords).split(';');
						keywords.push(keyword);
					}
					return keywords;
				}
			}*/
		},
		serverPaging: true,
		pageSize: 150
	});
	/*FK.searchlist.DS.fetch(function () {
		
	});*/
	initSearchMailList();
}

function getSearchMailCount(e) {
	return $.ajax({
		url: Path.get('searchCount'),
		headers: {
			'Authorization': FK.settings.config.token
		},
		data: e.view.params
	});
}

FK.searchlist.model.observable.bind("change", function (e) {
	if (e.field == 'showActions') {
		checkSelected();
	}
});