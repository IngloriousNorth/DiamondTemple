import TEMPEST from "./TEMPEST.js"

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

$(document).on("TEMPEST", function(){
	$(".js_mobile_menu").hide();
})

$(document).ready(function(){
	$("#js_mobile_menu").click(function(e){
		e.preventDefault();
		if(!$(".js_mobile_menu").is(":visible")){
			$(".page_heading").text("Menu");
		}
		else{
			let heading;
			if(TEMPEST.pageREC()==="quotations"){
				heading = TEMPEST.paramREC().path;
			}
			else if(!TEMPEST.pageREC()){
				heading = TEMPEST._default;
			}
			else{
				heading = TEMPEST.pageREC();
			}
			$(".page_heading").text(toTitleCase(heading));
		}
		$(".js_mobile_menu").slideToggle();

	})

	$(window).resize(function(){
		if($(window).width() > 1079)
			$(".js_mobile_menu").hide();
	})
})