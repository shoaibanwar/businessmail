FK.index = {};
FK.index.model = {
	onViewInit: function(e) { 
        //var token = FK.App.getCookie('token');
        //console.info(token);       
		if(FK.App.chkSession('token')){
            FK.settings.config.token = sessionStorage.getItem("token");
            app.navigate('views/home.html');
        }
        else{
            app.navigate('views/login.html');
        }
	}
};