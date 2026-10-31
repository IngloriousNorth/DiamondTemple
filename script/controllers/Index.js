import MVC from '../../lib/MAINFRAME.js';
import TEMPEST from '../../lib/TEMPEST.js';

$(document).ready(function(){
	TEMPEST.initialize({
		pages : ["home", "graph-search", "quotations"],
		defaultPage : "home",
		dir : "partials",
		fade : true,
		fadeTime : 175,
		helm : 
			[
				{ 
					page : "home",
					fn : function(){
						$(".page_heading").text("Home")
						MVC.View.home.initialize();
						MVC.Controller.flash.initialize(TEMPEST.paramREC()?.index);
					}
				},
				{
					page : "graph-search",
					fn : function(){
						MVC.Controller.search.unfold(TEMPEST.paramREC().q);
						$("h2").text("Graph-Search");
					}
				},
				{
					page: "quotations",
					fn : function(){
						MVC.Controller.quotations.unfold();
						$(".page_heading").text(TEMPEST.paramREC().path)
					}
				}

			]
	}, ()=>MVC.View.menu.unfold());
})

$(document).on("TEMPEST", function(){
	$(".TEMPEST").scrollTop(0);
})

$(document).ready(function(){
	$(".js_mobile_menu").html($(".sidebar").html())
	$(document).on("click", "a.nav_a", function(e){
		e.preventDefault();

		$(this).prev().toggle();
		$(this).prev().prev().toggle();
		$(this).next().slideToggle();
	});
})