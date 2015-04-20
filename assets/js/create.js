FK.create = {};
FK.create.model = new kendo.observable({
	to: {
		to:'',
		cc:'',
		bcc:''
	},
	method: '',
	from: null,
	accounts: [],
	contacts: [],
	subject: '',
	body: '',
	onViewInit: function(e) { 
        if(!FK.App.chkSession('token')){
            app.navigate('views/login.html');
        }
		this.set('accounts', JSON.parse(sessionStorage.getItem('userAccounts')));
	},
	onViewShow: function(e) {
		var model = FK.create.model;
		if (model.method != 'reply') {
			model.set ('to' ,{
				to:'',
				cc:'',
				bcc:''
			});
			model.set('subject', '');
		}
		model.method = '';
		model.set('body', '');
		model.set('from', this.accounts[0].address)
		
		/*$('#create_message').kendoEditor({
			tools: [
				"bold",
				"italic",
				"underline"
			]
		});*/
	},
	readyToSend: function() {
		var state = false;
		
		if (FK.create.model.to.to != '') {
			state = true
		}
		

		
		if (state) {
			FK.create.model.send()
		} else {
			FK.App.notification.hide();
			FK.App.notification.show('No recipients', 'error');
		}
	},
	send: function() {
		var model = FK.create.model,
			requiredParams = {
				from: model.from,
				cc: (model.to.cc).split(",").join(";"),
				bcc: function bccBuild() {
					var bcc_ = [model.from];
			
					if (model.to.bcc != '') {
						bcc_.push(model.to.bcc.split(",").join(";"));
					}
					
					return bcc_.join(";")
				}(),
				to: (model.to.to).split(",").join(";"),
				subject: model.subject,
				body: model.body
			};

		for (var key in requiredParams) {
			if (requiredParams[key]	== '' || requiredParams[key] == null) delete requiredParams[key]
		}

		$.ajax({
			url: Path.get('send'),
			headers: {'Authorization':FK.settings.config.token, 'Content-Type':'application/json'},
			data: JSON.stringify(requiredParams),
			type: "POST",
			success: function(data) {
				if (data.status == "Failure") {
                    FK.App.notification.hide();
					FK.App.notification.show(data.message,'error');                    
				} else if (data.status == "Success") {
                    FK.App.notification.hide();
					FK.App.notification.show('sent');
					app.navigate("views/home.html");
				}
			}
		});
	}
});

function prompt(data) {
	console.log (message)
}
