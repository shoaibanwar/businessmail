FK.login = {};
FK.login.model = {
    observable: kendo.observable({
        email: '',
        password: '',
        version: '',
        remember: false
    }),
	onViewInit: function(e) { 
        if(FK.App.chkCookie('token')){
            sessionStorage.setItem('token', $.cookie('token'));
            FK.settings.config.token = $.cookie('token');   
            app.navigate('views/home.html');
        }
        
        $("#loginForm").kendoValidator();         
        this.observable.set('version', FK.settings.version)
	},
	onViewShow: function(e) {
	},
    verify : function(){       
        if(this.observable.email == "" || this.observable.password == "")
        {
            FK.App.notification.hide();  
            FK.App.notification.show('Email/Password is Blank', 'error'); 
        }
        else if(!validateEmail(this.observable.email)){
            FK.App.notification.hide();  
            FK.App.notification.show('Email is Invalid', 'error'); 
        }
        else
        {            
            var token = "Basic "+ btoa(this.observable.email+":"+this.observable.password);
            console.info(token);
            $.ajax({
                url: Path.get('login'),
                headers: {
                    'Authorization': token
                },
                success: function(result){
                    if(result["status"] == "Success"){
                        try{
                            console.info("reload");
                            FK.home.model.DS.read();
                        }
                        catch(e){
                            console.log("ignore");
                        }
                        
                        FK.settings.config.token = token;   
                        if(FK.login.model.observable.remember == true)
                        {
                            $.cookie('token',token, {expires: 7});  
                        } 
                        sessionStorage.setItem('token',token);                          
                        app.navigate('views/home.html');
                    }else{
                        FK.App.notification.hide();  
                        FK.App.notification.show('Invalid User Credentials', 'error');
                        console.info(result);
                    }                
                }
            });
        }
    },
    onNotificationShow: function(e) {
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
};

function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}