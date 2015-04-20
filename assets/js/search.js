FK.search = {
}

FK.search.model = {
    accounts: [],
    fromList: [],
    toList: [],
    buPathData: [],
    keywords: [],
	onViewInit: function(e) { 
        if(!FK.App.chkSession('token')){
            app.navigate('views/login.html');
        }
        
        this.set('accounts', JSON.parse(sessionStorage.getItem('userAccounts')));
        
        this.set('buPathData', JSON.parse(sessionStorage.getItem('userAccounts')));
        this.set('keywords', JSON.parse(sessionStorage.getItem('userKeywords')));   

    },
	onViewShow: function(e) {},
	actions: {
        that: this,
		send: function() {
			/*this.set('searchStopBtn_isVisible', true);
			this.set('searchBtn_isVisible', false);*/

            if (FK.search.model.observable.bUPaths != '') {
                var queryString = "",
                    paramsObject = FK.search.model.observable,
                    paramsClone = [],
                    seperator = '?',
                    ct = 0;

                for (var key in paramsObject) {
                    if (paramsObject.hasOwnProperty(key)) {
                        paramsClone[key] = paramsObject[key]
                    }
                }
                delete paramsClone["uid"];
                delete paramsClone["_events"];
                delete paramsClone["parent"];

                for (var key in paramsClone) {
                    var val = paramsClone[key];
                    console.log(key, val);
                    if (key == "fromRecvDate") {
                        val = kendo.toString(val, "yyyy-MM-dd");
                        if(val != "")
                            val += " 00:00:00";
                    }
                    if (key == "toRecvDate") {
                        val = kendo.toString(val, "yyyy-MM-dd");
                        if(val != "")
                            val += " 23:59:59";
                    }
                    if (ct > 0) seperator = "&";
                    if (val != '') {
                        queryString += seperator + key + "=" + val;
                        ct++;
                    }
                }
                console.log(queryString);
                app.navigate("#views/searchlist.html" + queryString);
            } else {                
                FK.App.notification.hide();     
                FK.App.notification.show('No public folder selected', 'error');              
            }
		},
		stopSearch: function() {
			this.set('searchStopBtn_isVisible', false);
			this.set('searchBtn_isVisible', true);
		},        
		openFromList: function() {
            $("#setFrom").closest(".k-widget").show(); 
            this.fromDropDown.open(); 
        },
		openToList: function() {
            $("#setTo").closest(".k-widget").show(); 
            this.toDropDown.open(); 
        },
        setFrom: function() {           
        },
		keyword_onSelect: function(e) {
			var buttonGroup = e.sender;
            var index = buttonGroup.current().index();
			console.log (index);
			FK.search.model.observable.keywords.andOr = index;
		}
	},
    /*isValidKey: function(object,key) {
        if(object.hasOwnProperty(key)){
            if(!(object[key] == "" || key == "uid" || key == "_events" || key == "parent" || key == "type" || key == "length"))
            {
                return true;
            }                
        }
        return false;
    },*/
    buPath_onSelect: function() {
        var selected =[],
            that = this;
        $("#search_buPath").find("input:checked").each(function() {
            selected.push($(this).attr("name"))
        });
        that.observable.set('bUPaths', selected.join(";"));
        $('#modalView-buPaths').closest('.km-modalview-root').hide();
    },
    buPath_onCancel: function() {
        var selected = $('#search_input').val().split(";");
        $("#search_buPath").find("input").each(function() {
            if($.inArray($(this).attr("name"), selected) == -1){
                $(this).removeAttr("checked");  
            }else{
                $(this).click(); 
            }
        });
        $('#modalView-buPaths').closest('.km-modalview-root').hide();
    },
    openBuModal: function() {
       $('#modalView-buPath').data("kendoMobileModalView").open();
    },
    to_onSelect: function() {
        var selected =[],
            that = this;
        
        if(FK.search.model.observable.toField != "")
            selected = FK.search.model.observable.toField.split(";");
        
        for (var i = 0; i < selected.length; i++)
        {                    
            selected[i] = selected[i].trim();
        }
        
        $("#modalView-search_toList").find("input:checked").each(function() {            
            selected.push($(this).attr("name"));  
            $(this).removeAttr("checked");   
        });

        that.observable.set('toField', selected.join(";"));
        $("#toField").val(FK.search.model.observable.toField);                
        $('#modalView-search_toList').closest('.km-modalview-root').hide();
        
    },
    to_onCancel: function() {
        $("#modalView-search_toList").find("input:checked").each(function() {
            $(this).removeAttr("checked");   
        });
        $('#modalView-search_toList').closest('.km-modalview-root').hide();
    },
    from_onSelect: function() {
        var selected =[],
            that = this;
        
        if(FK.search.model.observable.fromField != "")
            selected = FK.search.model.observable.fromField.split(";");
        
        for (var i = 0; i < selected.length; i++)
        {                    
            selected[i] = selected[i].trim();
        }
        
        $("#modalView-search_fromList").find("input:checked").each(function() {            
            selected.push($(this).attr("name"));  
            $(this).removeAttr("checked");   
        });

        that.observable.set('fromField', selected.join(";"));
        $("#fromField").val(FK.search.model.observable.fromField);
        $('#modalView-search_fromList').closest('.km-modalview-root').hide();
    },
    from_onCancel: function() {
        $("#modalView-search_fromList").find("input:checked").each(function() {
            $(this).removeAttr("checked");   
        });
        $('#modalView-search_fromList').closest('.km-modalview-root').hide();
    },
    keywords_onSelect: function() {    
        var selected =[],
            that = this;
        
        if(FK.search.model.observable.keywords != "")
            selected = FK.search.model.observable.keywords.split(";");
        
        for (var i = 0; i < selected.length; i++)
        {                    
            selected[i] = selected[i].trim();
        }
        
        $("#modalView-search_keywords").find("input:checked").each(function() {
            selected.push($(this).attr("name")); 
            $(this).removeAttr("checked");  
        });
        that.observable.set('keywords', selected.join(";"));
        $("#modalView-search_keywords").val(FK.search.model.observable.keywords); 
        $('#modalView-search_keywords').closest('.km-modalview-root').hide();
    },
    keywords_onCancel: function() {
        var selected = $('#keywords').val().split(";");
        $("#modalView-search_keywords").find("input").each(function() {
            if($.inArray($(this).attr("name"), selected) == -1){
                $(this).removeAttr("checked");  
            }else{
                $(this).click(); 
            }                
        });
        $('#modalView-search_keywords').closest('.km-modalview-root').hide();
    },
    notKeywords_onSelect: function() {
        var selected =[],
            that = this;
        
        if(FK.search.model.observable.notKeywords != "")
            selected = FK.search.model.observable.notKeywords.split(";");
        
        for (var i = 0; i < selected.length; i++)
        {                    
            selected[i] = selected[i].trim();
        }
        
        
        $("#modalView-search_notKeywords").find("input:checked").each(function() {
            selected.push($(this).attr("name")); 
            $(this).removeAttr("checked"); 
        });

        that.observable.set('notKeywords', selected.join(";"));
        $("#modalView-search_notKeywords").val(FK.search.model.observable.notKeywords); 
        $('#modalView-search_notKeywords').closest('.km-modalview-root').hide();
       // $('#notKeywords').val(selected.join(';'));
        //$('#modalView-search_fromList').data("kendoMobileModalView").close();
    },
    notKeywords_onCancel: function() {
        var selected = $('#notKeywords').val().split(";");
        $("#modalView-search_notKeywords").find("input").each(function() {
            if($.inArray($(this).attr("name"), selected) == -1){
                $(this).removeAttr("checked");  
            }else{
                $(this).click(); 
            }               
        });
        $('#modalView-search_notKeywords').closest('.km-modalview-root').hide();
    },
    observable:  kendo.observable({
        bUPaths: '',
        subjectField: '',
        fullText: '',
        fromField: '',
        toField: '',
        keywords:'',
        notKeywords: '',
        rEFN: '',
        bREF: '',
        fromRecvDate: '',
        toRecvDate: ''        
    }),
	searchStopBtn_isVisible: false,
	searchBtn_isVisible: true
};
