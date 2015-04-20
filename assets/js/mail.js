FK.email = {
	timer : ''	
};

FK.email.model = {
    boolBuffer : true,
    curretnItem: [],
	observable: kendo.observable({
		MessageID: null,
		body: '',
		sender: '',
		to: '',
		subject: '',
		cc:'',
		sent:'',
		recieved:'',
		size:'',
		categories: []
	}),
	onViewInit: function(e) {
        if(!FK.App.chkSession('token')){
            app.navigate('views/login.html');
        }
		FK.email.settings = {
			take: 50,
			page:1,
			skip:0
		};
		initSwipe();
	},
	onViewShow: function(e) {
		FK.App.clearFooterTabStrip();
		initDS(parseInt(e.view.params.itemId));
	},
	reply: function(all) {
		var model_ = FK.email.model.observable;        
		FK.create.model.set('to.to', extractEmail(model_.sender).join(";"));
		
		if (all == 'all') {
			FK.create.model.set('to.cc', extractEmail(model_.cc).join(";"));
			//FK.create.model.set('to.bcc', model_.bcc);
		}
		FK.create.model.set('subject', 're:' + model_.subject);
		FK.create.model.set('method', 'reply');
		app.navigate('views/create.html');
	},
	replyAll: function() {
		this.reply('all')	
	}
	
};

function reformatCategories(objArray) {
	var markup = '';
	for (var i=0; i<objArray.length; i++) {
		var obj = (objArray[i]);
		markup += '<mark>';
		markup += obj.name;
		markup += '</mark>';
	}
	//console.log (markup);
	return markup;
}

function initDS(id) {
	console.log ('initialising DS at ' + id);
	setTimeout(function() {app.pane.loader.show()},100);
	var messagesToFetch = messageIdStrip_formulate(id);
	$('#view_mailDetail .km-content').css('visibility','hidden');
	loadMessages(messagesToFetch).done(function (messages) {
		var dataClone = [],
			data = messages.content;
		
		for (var a=0; a<messagesToFetch.length; a++) {//sort the server data in the same order as requested
			for (var i=0; i<data.length; i++) {
				if (messagesToFetch[a] ==  data[i].MessageID) {//match the id in the array with the loaded content
					var newObj = {};
					
					if (data[i].hasOwnProperty('Error')) {
						newObj.error = true;
						newObj.body = "Error retrieving message";
						newObj.sender = "";
						newObj.MessageID = "";
						newObj.subject = "";
						newObj.to = "";
						newObj.sent = "";
						newObj.categories = "";
					} else {
						newObj = data[i].MailProperties;
						//console.log (newObj.from);
						newObj.from = FK.App.mergeContacts([newObj.from]);
						newObj.to =FK.App.mergeContacts(newObj.to);
						newObj.cc = FK.App.mergeContacts(newObj.cc);
                        newObj.received = FK.App.mergeContacts([newObj.received]);
						newObj.categories = reformatCategories(newObj.categories);
						newObj.error = false;
					}
					newObj.id = data[i].MessageID;
					
					dataClone.push(newObj);
					break;
				}
			}
		}
		
		console.log (dataClone);
		
		FK.email.DS = new kendo.data.DataSource({
			data: dataClone
		});
		var	observable = FK.email.model.observable,
			DS = FK.email.DS;

		DS.fetch(function() {
			console.log ('local DS.fetch()');
			FK.email.actions.showMail(id);
			$('#view_mailDetail .km-content').css('visibility','visible');
			app.pane.loader.hide();
		})
	});
}
FK.email.actions = {
	swipeTo: function (direction) {
		var currentMailId = FK.email.model.observable.MessageID,
			DS = FK.email.DS,
			selectedItem = DS.get(currentMailId),
			selectedItemIndex = DS.indexOf(selectedItem);
		console.log (selectedItemIndex);
		
		if ((selectedItemIndex == DS.total()-1 || selectedItemIndex == 0) && FK.email.model.boolBuffer == true) {
			console.log ('reached limit ');
			initDS(DS.at(selectedItemIndex).id);
          
		} else {
			if (direction == 'left' || direction == 'right') {
				if (direction == 'left') selectedItemIndex++;
				if (direction == 'right') selectedItemIndex--;
			}
			if (DS.at(selectedItemIndex)) this.showMail(DS.at(selectedItemIndex).id)	
		}
	},
	showMail: function(id) {
		window.clearTimeout(FK.email.timer);
		try {
			var DS = FK.email.DS,
				observable = FK.email.model.observable;
			DS.fetch(function() {
				var item = DS.get(id);
                FK.email.model.curretnItem = DS.get(id);
                console.info(item);
				observable.set("body", item.body);
				observable.set('sender', item.from);
				observable.set('MessageID', item.id);
				observable.set('subject', item.subject);
				observable.set('to', item.to);
                observable.set('cc', item.cc);
				observable.set('sent', item.sent);
                observable.set('received', item.received);
				observable.set('categories', item.categories);
			});
            console.info(observable);
			FK.email.timer = window.setTimeout(function() { markAsRead(id), 3000});
		} catch(e) {
			
			setTimeout(function()  {app.pane.loader.hide();}, 200);
			app.navigate('/');
		}
	}
};
			
function markAsRead(id) {
	$.ajax({
		url: Path.get('markread'),
		headers: {'Authorization':FK.settings.config.token},
		data: 'messageId='+id
	});
}

function loadMessages(messageIDs) {
	console.log (messageIDs);
	return $.ajax({
		url: Path.get('detail'),
		headers: {'Authorization':FK.settings.config.token},
		data: 'messageId='+messageIDs.join(';')
	});
}
function messageIdStrip_formulate(currentMailId) {
	try {
		var storedMailIDs = FK.App.allMessageIDsInView(),
            currentPos = storedMailIDs.indexOf(currentMailId);
        if(storedMailIDs.length < 13){
            var get_prev = 1;
            if(storedMailIDs.length == 1){
                  get_prev = 0;
            }
            FK.email.model.boolBuffer = false;
            var storedMailIDs_total = storedMailIDs.length-1,
                get_next = 1,			    
                get_total = storedMailIDs.length,
			 cursor = currentPos;    
        }
        else
        {
            var storedMailIDs_total = storedMailIDs.length -1,  
			get_next = 7,
			get_prev = 5,
			get_total = get_prev + get_next,
			cursor = currentPos - get_prev;              
        }
			
		mailsToRequest = [];
            
        
        console.info(storedMailIDs);

		if (cursor <= 0) {
			cursor = storedMailIDs_total + cursor + 1;
			//console.log (cursor, storedMailIDs_total);
		}

		for (var i=0; i<get_total; i++) {
			if ((cursor) > storedMailIDs_total) {
				cursor=0; //move to first record
			}
			mailsToRequest.push(storedMailIDs[cursor]);
			cursor++;
		}

		return mailsToRequest;
	} catch(e) {
		app.navigate('/');	
	}
}

function initSwipe() {
	console.log ('initialising swipe');
	$('#view_mailDetail').kendoTouch({
		enableSwipe: true,
		swipe: function (e) {
			console.log ('swipe')
			FK.email.actions.swipeTo(e.direction);
		},
		tap: function (e) {
			console.log ('tap')	
		}
	});	
}

function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}

function extractEmail(mails) {
    var to = mails.toString().replace(/<(?:.|\n)*?>/gm, ';');
    var to = to.split(";");
    var selected = []
    for(var validto in to){
        if(validateEmail(to[validto])){
           selected.push(to[validto])
        }
    }   
    return selected;
}