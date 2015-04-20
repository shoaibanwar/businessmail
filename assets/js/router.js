FK.router = new kendo.Router({ pushState: true, root: "/mc/", routeMissing: function(e) { console.log(e.url, e.params) } });
FK.router.route("/home", function() {
    console.log('routed to home');
	//FK.layout.showIn("#main", FK.home.view());
});
//FK.router.start();

/*FK.router.route("/inbox", function() {
    console.log('routed to inbox');
	FK.layout.showIn("#main", FK.inbox.view);
});
FK.router.route("/mail/:id", function(id) {
    console.log(id);
});*/

var app = new kendo.mobile.Application(	$(document.body), {
	initial: "#index",
	platform: "ios7"
});

	/*	if ($(el_actual).hasClass('reply')) {
					FK.inbox.actions.reply(el_base.id);
				} else {
					FK.inbox.actions.readMail(el_base.id);	
				}*/
/*var el_base = e.touch.currentTarget,
				el_actual = e.touch.initialTouch;
			
			if ($(el_actual).hasClass('reply')) {//reply held
				$("#actionsheet").data("kendoMobileActionSheet").open();
			} else {//base held
				$(el).toggleClass('k-state-selected');

			}*/