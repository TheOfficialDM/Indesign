
// Simple GREP query runner
// Various improvements possible
// Peter Kahrel

(function () {
	
	//------------------------------------------------------------------------
	// Some things to restore the previous session's selection
	
	function scriptPath () {
		try {
			return app.activeScript;
		}
		catch (e) {
			return File (e.fileName);
		}
	}

	function saveData (obj) {
		var f = File (scriptPath().fullName.replace(/\.jsx$/,'.txt'));
		f.open('w');
		f.write(obj.toSource());
		f.close();
	}

	function getPrevious () {
		var f = File(scriptPath().fullName.replace(/\.jsx$/,'.txt'));
		var obj = {};
		if (f.exists) {
			f.open('r');
			var temp = f.read();
			f.close();
			obj = eval(temp);
		}
		return obj;
	}

	//------------------------------------------------------------------------
	// Create an array of GREP queries from the app and the user folder
	// and any query files in the Scripts folder
	
	function findQueries () {

		function findQueriesSub (dir) {
			var f = Folder(dir).getFiles('*.xml');
			return f;
		}
	
		function getPresetNames () {
			return f = Folder(scriptPath().path).getFiles('*.grep-preset');
		}
		
		// The user folder
		var queryFolder = app.scriptPreferences.scriptsFolder.parent.parent + '/Find-Change Queries/Grep/';
		// The app folder
		var appFolder = Folder.appPackage+'/Presets/Find-Change Queries/Grep/'+$.locale;
		var list = findQueriesSub (appFolder);
		list = list.concat (findQueriesSub (queryFolder));
		// Queries in the current script's folder
		list = list.concat (getPresetNames());
		for (var i = list.length-1; i >= 0; i--) {
			list[i] = decodeURI (list[i].name.replace ('.xml', ''));
		}
		return list.sort(function(a,b){return a.toUpperCase() > b.toUpperCase()});
	}

	//------------------------------------------------------------------------
	// Convert an array of ListItems to an array of strings
	
	function getQueryNames (sel) {
		var arr = [];
		for (var i = 0; i < sel.length; i++) {
			arr.push (sel[i].text);
		}
		return arr;
	}
	
	
	function getPresetQueries (f) {
		if (!f.exists) {
			return null;
		}
		f.encoding = 'UTF-8';
		f.open ('r');
		var s = f.read();
		f.close();
		return s.split(/[\n\r]/);
	}
		
	//------------------------------------------------------------------------

	var previous = getPrevious();
	
	var w = new Window ('dialog', 'Run GREP queries', undefined, {closeButton: false});
		w.listContainer = w.add ('group');
		w.list = w.listContainer.add ('listbox', undefined, findQueries(), {multiselect: true});
		w.list.preferredSize = [300, 500];
		w.buttons = w.add ('group');
			w.buttons.add ('button', undefined, 'Cancel');
			w.preset = w.buttons.add ('button', undefined, 'Preset');
			w.run = w.buttons.add ('button', undefined, 'Run', {name: 'ok'});
			
			w.run.helpTip = 'Run the selected queries';
			w.preset.helpTip = 'Create a query preset from the selected queries';

		w.list.onChange = function () {
			w.preset.enabled = w.list.selection && w.list.selection.length !== 1;
			if (w.list.selection && w.list.selection[0].text.indexOf('.grep-preset') > 0) {
				//index = list.selection[0].index;
				var queries = getPresetQueries (File (scriptPath().path + '/' + w.list.selection[0].text));
				if (queries.length > 0) {
					w.list.selection = null;
					for (var i = 0; i < queries.length; i++) {
						w.list.selection = w.list.find (queries[i]);
					}
				}
			}
		}


		w.preset.onClick = function () {
			// Need at least two items for a query
			if (!w.list.selection || w.list.selection.length === 1) {
				return;
			}
			// Create a string of query names, separated by a HRt
			var name = w.list.selection[0].text;
			var s = name;
			for (var i = 1; i < w.list.selection.length; i++) {
				s += '\r' + w.list.selection[i].text;
			}
			// Don't add the query to the list if it's already there
			if (!w.list.find (name + '..grep-preset')) {
				w.list.add ('item', name + '.grep-preset', w.list.selection[0].index);
			}
			// Save the preset in the script's folder
			var f = File (scriptPath().path + '/' + name + '.grep-preset');
			f.encoding = 'UTF-8';
			f.open('w');
			f.write(s);
			f.close();
			w.run.active = true;
		}
			
	
		w.onShow = function () {
			var q;
			if (previous.hasOwnProperty ('location')) {
				w.location = previous.location;
			}
			if (previous.hasOwnProperty ('queries')) {
				for (var i = 0; i < previous.queries.length; i++) {
					q = w.list.find (previous.queries[i]);
					if (q) {
						w.list.selection = q;
					}
				}
			}
			if (!w.list.selection) {
				w.list.selection = 0;
			}
		}


	if (w.show() == 1 && w.list.selection !== null) {
		// Get the selected query names
		var queries = getQueryNames (w.list.selection);
		// Save some data
		saveData ({
			queries: queries, 
			location: [w.location.x, w.location.y]
		});
		// Execute the queries
		for (var i = 0; i < queries.length; i++) {
			app.loadFindChangeQuery (queries[i], SearchModes.GREP_SEARCH);
			app.documents[0].changeGrep();
		}
	}

}());