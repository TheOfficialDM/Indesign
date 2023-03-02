//DESCRIPTION: Exchange commas and periods in numbers
// Peter Kahrel

(function () {
	
	function findItems () {
		if (!app.selection.length) {
			return app.activeDocument.findGrep();
		}
		if (app.selection[0] instanceof TextFrame) {
			return app.selection[0].parentStory.findGrep();
		}
		try {
			return app.selection[0].findGrep();
		} catch (_) {
		}
		exit();
	}

	app.findGrepPreferences = app.changeGrepPreferences = null;
	app.findGrepPreferences.findWhat = "\\d+[,.\\d]+\\d+";
	var found = findItems();
	var temp;
	for (var i = found.length-1; i >= 0; i--) {
		temp = found[i].contents.replace (/,/g, '#');
		temp = temp.replace (/\./g, ',');
		found[i].contents = temp.replace (/#/g, '.')
	}
}());

