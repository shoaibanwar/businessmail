var Multilingual = (function() {
	var self = this, allTranslations = [];

	var init = function() {
		loadTranslations();
		self.loadAvailableLanguages();
	};


	self.loadAvailableLanguages = function() {
		$.ajax({
			type: "GET",
			url: "cfg/languages.json",
			dataType: "json",
			success: setLanguages
		});

		function setLanguages(languagesData) {
			//console.info(languagesData);
			function findCulture(lang) {
				var culture = "";
				var obj = {};
				$.each(languagesData.languages.language, function(i, v) {
					if (v.code.search(new RegExp(lang)) != -1) {
						obj.culture = v.culture;
						if (v.firstWorkingDay) {
							obj.weekStart = v.firstWorkingDay;
						} else {
							obj.weekStart = 0;
						}
							
						return false;
					}
				});
				return obj;
			}

			var storedLanguage = sessionStorage.getItem('language'),
				firstLang = {};
			firstLang.code = languagesData.languages.default;
			/*if (storedLanguage != undefined && storedLanguage != "" && storedLanguage != "undefined") {
				firstLang.code = storedLanguage;
			} else {
				firstLang.code = languagesData.languages.default;	
			}*/
			var getAgain = findCulture(firstLang.code);
			firstLang.culture = getAgain.culture;
			firstLang.weekStart = getAgain.weekStart;
			console.log ('setting cookie ' +firstLang.code);
			$.cookie('firstLang',JSON.stringify(firstLang));
			FK.App.locale.init();
		}
	};

	function loadTranslations() {
		var x = $.ajax({
			type: "GET",
			url: "cfg/translations.json",
			dataType: "json",
			success: buildCSS,
			error: function(e) {console.log (e.responseText) }
		});
	};
	function buildCSS(translationsData) {
		self.allTranslations = translationsData;
		console.log (translationsData);
		var html = "";
		for (var label in translationsData) {
			var translations = translationsData[label];
			for (var lang in translations) {
				html += 'body[lang="' + lang + '"] *[data-text="' + label + '"]:before {content:"' + translations[lang] + '"}'
			}
		}
		document.getElementById('translations').innerHTML = html;
	}
	var fn = new function() {
		var selfFns = this;
		selfFns.refreshTooltips = function(elem) {
			if (elem == undefined) var elem = 'body';
			$(elem).find('[title]').each(function(i,v){
				var text = $(v).data('tooltip');
				$(v).attr('title',selfFns.translatedText(text));
			});
		}
		selfFns.translatePlaceholder = function(elem) {
			var translation = "";
			if ($(elem).attr('placeholder')) {
				translation = (self.allTranslations[$(elem).attr('placeholder')][$('body').attr('lang')]);
			}
			return translation;
		}
		selfFns.translatedText = function(text) {
			try {
				return self.allTranslations[text][$('body').attr('lang')];
			} catch(e) {
				console.log (text);	
			}
		}
		selfFns.translateTooltipsInModule = function(containerId) {
			$('#'+containerId).find('[data-tooltip]').each(function(i,v){
				$(v).attr('title',selfFns.translatedText($(v).attr('data-tooltip')));
			})
		}
		selfFns.translateSpecialInModule = function(containerId, attribute) {
			$('#'+containerId).find('[' + attribute + ']').each(function(i,v) {
				$(v).attr(attribute + '-translated',selfFns.translatedText($(v).attr(attribute)));
			})
		}
	};
	
	return {
		init:init,
		fn: fn
	}	
}());



