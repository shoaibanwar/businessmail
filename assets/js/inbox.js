FK.inbox = {
	vars: {
		holdState: false
	},
	page: 1
}

FK.inbox.model = {
	observable: kendo.observable({
		mailCount: 0,
		unread: 0,
		showActions: false,
		viewMode: '',
		viewTitle: 'loading...'
	}),
	onViewInit: function (e) {
		console.log('init called on inbox');
        if(!FK.App.chkSession('token')){
            app.navigate('views/login.html');
        }

	},
	onViewShow: function (e) {
		setTimeout(clearList,100);
		FK.App.clearFooterTabStrip();
		
		//this.observable.set('viewTitle', e.view.params.buPath);
		this.observable.set('viewTitle', sessionStorage.getItem('lastViewTitle'));
		
		sessionStorage.setItem('selectedMessages', '[]');
		$('#mailCount').addClass('fa fa-spinner fa-spin');
		getMailCount(e).done(function (data) {
			$('#mailCount').attr('class', '');
			FK.inbox.model.observable.set('mailCount', data.count);

			initInbox(e, data.count);

			var params = e.view.params;
			params.take = data.count;
			params.skip = 0;
			FK.App.allMessageIDsInView(params);
		});
	}
};



FK.inbox.actions = {
	readMail: function (e) {
		clearList();
		try {
			app.navigate("views/mail.html?itemId=" + e.dataItem.MessageID);
		} catch(e) {
			console.log (e);	
		}
		//FK.router.navigate("/mail/" + id);
	},
	reply: function (uid) {
		console.log('reply one');
	}
}

function clearList() {
	var listNode = $("#inbox_mailList");
	
	if (listNode.attr('data-role') == 'listview') {
		console.log ('destroying list');
		//listNode.data('kendoMobileListView').destroy();
		
	}
	
	listNode.html('');
}

function mark(e) {
	console.log(e);
}


function initMailList(data) {
	var listNode = $('#inbox_mailList');
	console.log(listNode.attr('data-role'));
	if (listNode.hasClass('km-listview')) {
		listNode.data('kendoMobileListView').destroy();

	}
	
	listNode.kendoMobileListView({
		//pullToRefresh: true,
		//loadMore: true,
		endlessScroll: true,
		dataSource: FK.inbox.DS,
		template: $("#inbox_mailList-template").text(),
		click: FK.inbox.actions.readMail
	});
	
}



function manageSelectedMessages(el_base) {
	var selectedClass = 'k-state-selected',
		messageIds_in_storage = JSON.parse(sessionStorage.getItem('selectedMessages'));
	$(el_base).toggleClass(selectedClass);
	if ($(el_base).hasClass(selectedClass)) {
		messageIds_in_storage.push(el_base.id);
	} else {
		var index = messageIds_in_storage.indexOf(el_base.id);
		if (index > -1) {
			messageIds_in_storage.splice(index, 1);
		}
	}
	sessionStorage.setItem('selectedMessages', JSON.stringify(messageIds_in_storage));
	checkSelected();
}

function checkSelected() {
	var selectedItems = document.getElementById('inbox_mailList').querySelectorAll('.k-state-selected');
	if (selectedItems.length) {
		console.log('actionbuttons available');
		$('#view_inbox').addClass('allowActions');
		FK.inbox.model.observable.set('showActions', true)
		FK.inbox.model.observable.set('viewMode', 'edit')
	} else {
		FK.inbox.model.observable.set('showActions', false)
		FK.inbox.model.observable.set('viewMode', '')
		$('#view_inbox').removeClass('allowActions');
	}
}

function initInbox(e, mailCount) {
	//FK.inbox.DS.fetch();
	//var buPath = (e.view.params).buPath;
	sessionStorage.setItem('viewParams', JSON.stringify(e.view.params));
	FK.inbox.DS = '';	
	FK.inbox.DS = new kendo.data.DataSource({
		//type: 'odata',
		transport: {
			read: {
				url: Path.get('mailList'),
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
				page: FK.inbox.page,
				mailIDs: IDs
			});
		},
		schema: {
			total: function () {
					return parseInt(FK.inbox.model.observable.mailCount);
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
		pageSize: 100
	});
	/*FK.inbox.DS.fetch(function () {
		
	});*/
	initMailList();

}

function getMailCount(e) {
	return $.ajax({
		url: Path.get('count'),
		headers: {
			'Authorization': FK.settings.config.token
		},
		data: e.view.params
	});
}

FK.inbox.model.observable.bind("change", function (e) {
	if (e.field == 'showActions') {
		checkSelected();
	}
});

/*.kendoTouch({
		filter: 'li > div',
		touchstart: function (e) {
			// e.sender.cancel(); // e.sender is a reference to the touch widget.
		},
		hold: function (e) {
			console.log(e.sender);
			console.log('setting holdstate true');
			if (FK.inbox.vars.holdState !== true) { //apply action 'hold' to UI once
				FK.inbox.vars.holdState = true;
				e.sender.cancel();

				var el_base = e.touch.currentTarget,
					el_actual = e.touch.initialTouch;

				if ($(el_actual).hasClass('reply')) { //reply held
					console.log('showing reply options');
					window.setTimeout(
						function () {
							$("#actionsheet").data("kendoMobileActionSheet").open();
						}, 1000);
				} else { //base held
					manageSelectedMessages(el_base);
				}
			}

		},
		tap: function (e) {
			var el_base = e.touch.currentTarget,
				el_actual = e.touch.initialTouch;
			//console.log ($(el_actual).attr('class'));
			if ($(el_actual).hasClass('mailListItem_selector')) {

				manageSelectedMessages(el_base);
			} else {
				if (FK.inbox.vars.holdState == true) {
					console.log(e.sender + 'tap cancelled');
				} else {
					console.log('tap on ' + el_actual);
					if ($(el_actual).hasClass('reply')) {
						FK.inbox.actions.reply(el_base.id);
					} else {
						FK.inbox.actions.readMail(el_base.id);
					}
					FK.inbox.vars.holdState = false;
				}
			}
		}
	});*/
