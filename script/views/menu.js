import MVC from '../../lib/MAINFRAME.js';
import TEMPEST from '../../lib/TEMPEST.js';

const unfold = function(){
	const menuData = MVC.Model.menu.menu;

	if (menuData.western_thinkers) {
		menuData.western_thinkers.forEach(function(item){
			addDictionary(item, $(".thinkers_menu"));
		});
	}
	if (menuData.buddhist_sutras) {
		menuData.buddhist_sutras.forEach(function(item){
			addDictionary(item, $(".sutras_menu"));
		});
	}
	if (menuData.eastern_glossary) {
		menuData.eastern_glossary.forEach(function(item){
			addDictionary(item, $(".eastern_menu"));
		});
	}
	if (menuData.western_glossary) {
		menuData.western_glossary.forEach(function(item){
			addDictionary(item, $(".western_menu"));
		});
	}
	if (menuData.hermetic_glossary) {
		menuData.hermetic_glossary.forEach(function(item){
			addDictionary(item, $(".hermetic_menu"));
		});
	}

	function addDictionary(item, menu){
		const li = document.createElement("li");
		const a = document.createElement("a");
		$(a).text(item);
		$(a).addClass("TEMPEST");
		$(a).addClass("quotations");
		
		const menuClass = $(menu).attr("class");
		if (menuClass) {
			const classParts = menuClass.split(" ");
			if (classParts[2]) {
				$(a).addClass(classParts[2]);
			}
		}

		$(a).attr("href", "#quotations?path=" + item);
		$(li).append(a);
		menu.append(li);
	}

	$(document).on("TEMPEST", function(){
		$('.TEMPEST').animate({
            scrollTop: 0
        }, 'smooth');
	});
};

export default { unfold };