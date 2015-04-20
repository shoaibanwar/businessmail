FK.App = (function() {
	function init() {
		Multilingual.init();
		setProfile();
        
	}
	
	function loadProfile_fromServer() {
		return $.ajax({
			type: "GET",
			url: "./dummy/cfg.json",
			contentType: "application/json; charset=utf-8",
			dataType: 'json'
		});
	}
	
	function setProfile() {
		/*loadProfile_fromServer().done(function (data) {
			FK.create.model.set('accounts', data.settings.mailAccounts);
			FK.create.model.set('contacts', data.settings.contacts);
		});	*/
		//FK.settings.config.user.accounts = JSON.parse(sessionStorage.getItem('userAccounts'));
	}

		
	var locale = new function() {
		var self = this, elem = document.getElementsByTagName('body')[0];
		self.init = function() {
			var locale = sessionStorage.getItem('locale');
			if (locale == null || locale == "null") {
				var cookieVal = $.cookie('firstLang');
				console.log ('no stored locale information. using cookie ' + cookieVal);
				self.change(JSON.parse(cookieVal));	
			} else {
				self.set(JSON.parse(locale));
			}
		};
		self.timezone = function() {
			//return (tzdetect.matches()[0])
			var timezone = jstz.determine();
			return timezone.name();
		};
		self.timezoneOffset = function() {
			return ( -1*(moment().zone()) );
		};
		self.change = function(locale) {
			console.log (locale);
			sessionStorage.setItem('locale', JSON.stringify(locale));
			self.set(locale)
		};
		self.set = function(locale) {
			moment.locale(locale.code);
			elem.setAttribute('lang',locale.code);
			elem.setAttribute('data-culture',locale.culture);
			var setCulture = function() {
				//console.log("changing culture to " + culture);
				kendo.culture(locale.culture);
				FK.settings.dateFormat=kendo.culture().calendar.patterns.d;
				FK.settings.timeFormat=kendo.culture().calendar.patterns.t;
			}();
		};
		self.get = function() {
			var locale = JSON.parse(sessionStorage.getItem('locale'));
			return locale;
		}
		self.culture = function() {
			var culture = sessionStorage.getItem('culture');
			if (culture == "" || culture == undefined) {
				culture = navigator.language || navigator.userLanguage;
				if (culture == "" || culture == undefined || culture == "en-US") {
					culture = "en-GB"
				}
			}
			return culture;
		};
	};
	
	function maillistStrip() {
		if (arguments.length > 0) {//setter
			for (var i = 0; i < arguments.length; i++) {
				var argument = arguments[i],
					type = typeof argument;

				if (type == "string") {
					//service = findServiceAndSetOtherParams(argument);
				} else if (type == "object") {
					sessionStorage.setItem('inboxStrip',JSON.stringify(argument))
				}
			}
		} else {//getter
			return JSON.parse(sessionStorage.getItem('inboxStrip'));
		}
	}
    
	
	function loadAllMessageIDs(params) {
		return $.ajax({
			url: Path.get('buffer'),
			headers: {'Authorization':FK.settings.config.token},
			data: params
		});
	}
    
    function loadAllSearchMessageIDs(params) {
		return $.ajax({
			url: Path.get('searchBuffer'),
			headers: {'Authorization':FK.settings.config.token},
			data: params
		});
	}
	
	function allMessageIDsInView() {
		if (arguments.length > 0) {//setter
			loadAllMessageIDs(arguments[0]).done( function(data) {
				sessionStorage.setItem('allMessageIDsInView', JSON.stringify(data.content));
			});
			console.log ();
		} else {//getter
			return JSON.parse(sessionStorage.getItem('allMessageIDsInView'));
		}
	}
    
    function allSearchMessageIDsInView() {
		if (arguments.length > 0) {//setter
			loadAllSearchMessageIDs(arguments[0]).done( function(data) {
				sessionStorage.setItem('allMessageIDsInView', JSON.stringify(data.content));
			});
			console.log ();
		} else {//getter
			return JSON.parse(sessionStorage.getItem('allMessageIDsInView'));
		}
	}
	
	function clearFooterTabStrip() {
		var tabstrip = app.view().footer.find(".km-tabstrip").data("kendoMobileTabStrip");
  		tabstrip.clear();
	}
	
	function mergeEmails(personArray) {
		var markup = '';
		for (var i=0; i<personArray.length; i++) {
			var person = (personArray[i]);
			markup += '<span>';
			markup += person.name;
			markup += '<small>' + person.address + '</small>';
			markup += '</span>';
		}
		//console.log (markup);
		return markup;
	}

	var popupNotification = $("#notification").kendoNotification({
        animation: false,
		show: onNotificationShow
	}).data("kendoNotification");

	function onNotificationShow(e) {
		if (!$("." + e.sender._guid)[1]) {
			var element = e.element.parent(),
				eWidth = element.width(),
				eHeight = element.height(),
				wWidth = $(window).width(),
				wHeight = $(window).height(),
				newTop, newLeft;

			newLeft = Math.floor(wWidth / 2 - eWidth / 2);
			newTop = Math.floor(wHeight / 2 - eHeight / 2);

			e.element.parent().css({top: newTop, left: newLeft});
		}
	}
    
    function chkCookie(name){
        var c = $.cookie(name);
        console.info(c);
        if(!c)
            return false;
        if(c == 'null')
            return false;
        return true;
    }    
    
    function chkSession(name){
        var c = sessionStorage.getItem(name);
        console.info(c);
        if(!c)
            return false;
        if(c == 'null')
            return false;
        return true;
    }  
	
	return {
		locale:locale,
		init:init,
		maillistStrip: maillistStrip,
		allMessageIDsInView: allMessageIDsInView,
        allSearchMessageIDsInView: allSearchMessageIDsInView,
		clearFooterTabStrip: clearFooterTabStrip,
		mergeContacts: mergeEmails,
		notification: popupNotification,
        chkCookie: chkCookie,
        chkSession: chkSession
	}
}());