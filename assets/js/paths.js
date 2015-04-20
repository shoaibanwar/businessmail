/**
 * Generates a url using JSON configuration and parameters
 */
var Path = (function () {
	var self = this,
		defaultConfig = {
			protocol: "http",
			host: "136.243.32.250/api/",
			servicePath: '',
			callback: "jsonp=?",
			useParams: true
		},
		config = {};

	var serviceGroups = [//all the service paths, grouped with functionality
		{
			id:'user',
			servicePath: "user/",
			callback: '',
			services: {
				views: 'views',
				login: 'login',
				logout: 'Logout',
				buList: 'bulist',
                keywords: 'keywords'
			}
		},
		{
			id:'messages',
			servicePath: 'views/',
			callback: '',
			services: {
				mailList: 'messages',
				count: 'count',
				buffer: 'buffer'
			}
		},
        {
			id:'search',
			servicePath: 'search/',
			callback: '',
			services: {
				searchMailList: 'messages',
				searchCount: 'count',
				searchBuffer: 'buffer'
			}
		},
		{
			id:'detail',
			servicePath: 'messages/',
			callback: '',
			services: {
				send: 'send',
				detail: 'detail',
				send: 'send',
				markread: 'markread'
			}
		}
	];
	
	var local = {
		keyboardShortcuts: "cfg/shortcuts.json",
		filterData: "cfg/queryFilters.json",
		views: function(file) {
			return '../views/' + file + '.html'
		}
	}
	
	/**
	 * retrieves the relevant service from the service groups
	 * @param   {String} svcToMatch The service to find from the config and build upon
	 * @returns {String}   The matched service, if found
	 */
	function findServiceAndSetOtherParams(svcToMatch) {
		for (var j=0; j<serviceGroups.length; j++) {
			var foundService = serviceGroups[j].services[svcToMatch];
			if (foundService !== undefined) {
				for (var prop in defaultConfig) {//override the config if keys found
					if (serviceGroups[j].hasOwnProperty(prop)) {
						config[prop] = serviceGroups[j][prop]	
					} else {
						config[prop] = defaultConfig[prop]	
					}
				}
				
				if (serviceGroups[j].hasOwnProperty('useParams')) {
					if (serviceGroups[j].useParams) {
						return foundService;	
					} else {
						return ''	
					}
				} else {
					return foundService;
				}
			}
		}
	}

	/**
	 * Creates the final URL string
	 * @returns {String} URL created from paramaters
	 */
	function generateUrlString() {
		var service = '',
			params = {},
			seperator = "?";

		for (var i = 0; i < arguments.length; i++) {
			var argument = arguments[i],
				type = typeof argument;

			if (type == "string") {
				service = findServiceAndSetOtherParams(argument);
				
			} else if (type == "object") {
				params = argument;
				console.log (params);
			}
		}
		
		var basePath = config.protocol + '://' + config.host + config.servicePath + service,
			strParams = "";
        
        console.info(basePath);
		
		if (config.useParams) {
			var thisCount = 0;
			for (var property in params) {
				strParams += seperator + property + "=" + params[property];
				thisCount++;
				if (thisCount >= 1) seperator = "&";
			}
		}
		
		if (strParams.length==0 && config.callback.length==0) {
			seperator = '';	
		}
		return (basePath + strParams + seperator + config.callback);
	}


	return {
		get: generateUrlString,
		local: local
	}
}());