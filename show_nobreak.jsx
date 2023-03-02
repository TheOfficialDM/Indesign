//DESCRIPTION: Show noBreak
//Peter Kahrel


(function () {

	function add_condition (name, colour) {
		//if (!app.documents[0].conditions.item(name).isValid) {
		if (app.documents[0].conditions.item(name).isValid) {
			app.documents[0].conditions.item(name).remove();
		}
		return app.documents[0].conditions.add ({
						name: name, 
						indicatorColor: colour, 
						indicatorMethod: ConditionIndicatorMethod.USE_HIGHLIGHT,
					});
	}

	function showNoBreak () {
		var condition = add_condition ('noBreak', [200, 200, 200]);
		app.findGrepPreferences = app.changeGrepPreferences = null;
		app.findGrepPreferences.noBreak = true;
		app.changeGrepPreferences.appliedConditions = [condition];
		app.documents[0].changeGrep();
		app.documents[0].layoutWindows[0].screenMode = ScreenModeOptions.PREVIEW_OFF;
	}

	showNoBreak();

}());