//DESCRIPTION: A simple GREP editor
// Peter Kahrel

#targetengine grep_editor;

var GREPeditor;
var GrepEditorName = 'A GREP editor';

if (app.documents.length > 0) {
	grep_edit();
}

function grep_edit () {
	app.changeGrepPreferences = null;
	GREPeditor = Window.find ('palette', GrepEditorName);
	if (GREPeditor !== null) {
		app.selection = null;
		GREPeditor.highlight.pressed = '0';
		GREPeditor.highlight.text = 'Find';
		GREPeditor.show();
		return;
	}
	
	var script_folder = script_dir();
	var grep_classes = File (script_folder+'/grep_class_inserter.jsx');
	// Retrieve the editor's position when it was quit the last time; 
	// returns some defaults if file not found
	var PREVIOUS_RUN = read_settings (File (script_folder + '/grep_editor.txt'));
	// The editor works better without any selection in the document
	app.selection = null;
	GREPeditor = new Window ('palette', GrepEditorName, undefined, {resizeable: true});
		if (PREVIOUS_RUN.w_location !== undefined) {
			GREPeditor.frameLocation = PREVIOUS_RUN.w_location;
		}
		GREPeditor.orientation = 'row';
		// Edit panel; place previous GREP in it if possible
		GREPeditor.editWindow = GREPeditor.add ('edittext', 
					undefined, 
					decodeURI (decode_grep (PREVIOUS_RUN.w_grep)), 
					{
						multiline: true, 
						wantReturn: true, 
						scrolling: true, 
						name: 'grep_edit_window'
					}
		);
		GREPeditor.editWindow.alignment = ['fill', 'fill'];
		GREPeditor.editWindow.preferredSize = PREVIOUS_RUN.editWindowSize;
		if (PREVIOUS_RUN.w_grep == '' || PREVIOUS_RUN.w_grep == '(?x)') {
			GREPeditor.editWindow.active = true;
		}
		
		GREPeditor.buttons = GREPeditor.add ('group {alignChildren: "fill", orientation: "column"}');
			GREPeditor.buttons.alignment = ['right', 'top'];
			GREPeditor.highlight = GREPeditor.buttons.add ('button {text: "Find", pressed: "0"}');
			var grepClassesButton = GREPeditor.buttons.add ('button {text: "Class picker"}');
			var copyFindWhat = GREPeditor.buttons.add ('button {text: "Copy F/C query"}');
			var gr_style = GREPeditor.buttons.add ('button {text: "Send to GREP style"}');
			//var close_window = GREPeditor.buttons.add ('button {text: "Close this window"}');

	GREPeditor.onResizing = GREPeditor.onResize = function () {
		this.layout.resize();
	}

	//------------------------------------------------------------------------------------------------------------

	GREPeditor.highlight.onClick = function () {

		function showHighlight () {
			if (GREPeditor.editWindow.text == '') {
				try {
					app.activeDocument.conditions.item ('GREP_editor_highlight').remove();
					return 'Find';
				} catch (_) {
				}
			} else {
				app.findGrepPreferences.findWhat = encode_grep (GREPeditor.editWindow.text);
				app.changeGrepPreferences.appliedConditions = [GREP_highlighter ('GREP_editor_highlight')];
				return 'Found ' + app.activeDocument.changeGrep().length;
			}
		}
		
		// BEGIN highlight.onClick

		if (GREPeditor.highlight.pressed == '1') {
			GREPeditor.highlight.pressed = '0';
			GREPeditor.highlight.text = 'Find';
			app.changeGrepPreferences.appliedConditions = NothingEnum.nothing;
			try {
				app.activeDocument.conditions.item ('GREP_editor_highlight').remove ();
			} catch (_) {
			}
			GREPeditor.editWindow.onChanging = function () {
				/* disable the handler */  // Is this necessary?
			}
		} else {
			GREPeditor.highlight.pressed = '1';
			// Conditions are not visible in preview mode
			if (app.activeDocument.layoutWindows[0].screenMode !== ScreenModeOptions.PREVIEW_OFF) {
				app.activeDocument.layoutWindows[0].screenMode = ScreenModeOptions.PREVIEW_OFF;
			}
			// Highlight the matches of whatever is in the window
			GREPeditor.highlight.text = showHighlight();
			// Remove the condition from the Change Format panel
			app.changeGrepPreferences.appliedConditions = NothingEnum.NOTHING;
			// Now highlight the changing window contents
			// (Why is this function here?)
			// (Because we remove it in the if clause (no idea why))
			GREPeditor.editWindow.onChanging = function () {
				GREPeditor.highlight.text = showHighlight();
				// I think at some stage this needed to be done twice, 
				// but from 2018 no longer
				// GREPeditor.highlight.text = showHighlight();
			}
		}
	}

	function GREP_highlighter (name) {
		if (app.activeDocument.conditions.item (name).isValid) {
			app.activeDocument.conditions.item (name).remove ();
		}
		return app.activeDocument.conditions.add ({
			name: name, 
			indicatorColor: [255, 255, 0], 
			indicatorMethod: ConditionIndicatorMethod.USE_HIGHLIGHT
		});
	}

	// Copy expr to GREP style ============================================================

	gr_style.onClick = function () {
		
		function buildListSub (scope, type, groupType, list, str) {
			var styles = scope[type].everyItem().getElements();
			for (var i = 0; i < styles.length; i++) {
				temp = list.add ('item', styles[i].name + (str == '' ? '' : ' ('+str+')'));
				temp.style = styles[i]; // Add property so we can easily get a handle on the style later
			}
			for (var j = 0; j < scope[groupType].length; j++) {
				buildListSub (scope[groupType][j], type, groupType, list, scope[groupType][j].name+ (str == '' ? '' : ': ') + str);
			}
		}

		function buildList (list, type) {
			// paragraphStyles > paragraphStyleGroups
			buildListSub (app.documents[0], type, type.replace(/s$/, 'Groups'), list, '');
			// Delete the first item, [None], [No paragraph style], etc.
			list.remove (list.items[0]);
			// Delete the [Basic Grid] object style too.
			if (type === 'objectStyles') {
				try {
					list.remove (list.find (app.documents[0].objectStyles.item('$ID/[Normal Grid]').name));
				} catch (_) {
				};
			}
		}

		var w1 = new Window ('dialog', 'Copy query to GREP styles', undefined, {closeButton: false});
		
			var panel = w1.add ('panel {alignChildren: "fill"}');
				var pstylegroup = panel.add ('group {alignChildren: "fill", orientation: "column"}'); 
					pstylegroup.add ('statictext {text: "Select paragraph style(s):"}');
					var pstyles = pstylegroup.add ('listbox', undefined, undefined, {multiselect: true});
					buildList (pstyles, 'paragraphStyles');
					pstyles.maximumSize.height = 300;
					pstyles.selection = [0];
					
				var cstylegroup = panel.add ('group {orientation: "row"}');
					cstylegroup.add ('statictext {text: "Select character style:"}');
					var cstyle = cstylegroup.add ('dropdownlist');
						buildList (cstyle, 'characterStyles');
						cstyle.selection = 0;
					
			w1.buttons = w1.add ('group {alignment: "right"}');
				var ok = w1.buttons.add ('button', undefined, 'OK', {name: 'ok'});
				w1.buttons.add ('button', undefined, 'Cancel', {name: 'cancel'});
				ok.enabled = false;

		pstyles.onChange = function () {
			ok.enabled = pstyles.selection != null;
		}

		if (w1.show () == 1) {
			var gr = encode_grep (GREPeditor.editWindow.text);
			var cs = cstyle.selection.style;
			for (var i = 0; i < pstyles.selection.length; i++) {
				try {
					pstyles.selection[i].style.nestedGrepStyles.add ({
						grepExpression: gr, 
						appliedCharacterStyle: cs
					});
				} catch (e) {
					alert (e.message);
				}
			}
		}
		w1.close();
	}

	//=========================================================================================

	GREPeditor.onClose = function () {
		GREPeditor.highlight.pressed = '0';
		app.changeGrepPreferences.appliedConditions = NothingEnum.NOTHING;
		try {
			app.activeDocument.conditions.item ('GREP_editor_highlight').remove();
		} catch (_) {
		}
		
		var windowState = {
			w_location: [GREPeditor.frameLocation.x, GREPeditor.frameLocation.y],
			editWindowSize: [GREPeditor.editWindow.size.width, GREPeditor.editWindow.size.height],
			wildcard_window: wildcard_location(),
			w_grep: encodeURI (encode_grep (GREPeditor.editWindow.text)),
		}
		write_settings (script_folder+'/grep_editor.txt', windowState);
	}


	grepClassesButton.onClick = function () {
		if (!grep_classes.exists) {
			alert ('Cannot find grep_class_inserter.jsx. Copy it to the GREP editor\'s folder.\rSee http://www.kahrel.plus.com/indesign/grep_classes.html.');
			return;
		}
		if (Window.find ('palette', 'GREP classes') === null) {
			app.doScript (grep_classes);
		}
		var classes_window = Window.find ('palette', 'GREP classes');
		if (!classes_window.visible) {
			classes_window.show();
		}
	}


	copyFindWhat.onClick = function () {
		GREPeditor.editWindow.text = decode_grep (app.findGrepPreferences.findWhat);
	}


	GREPeditor.onShow = function () {
		GREPeditor.editWindow.minimumSize.width = 400;
		GREPeditor.editWindow.minimumSize.height = GREPeditor.buttons.size.height;
	}

	GREPeditor.show ();
} // grep_edit


//---------------------------------------------------------------
// Replace returns and tabs with text codes

function encode_grep (s) {
	// Remove trailing returns
	var temp = s.replace (/[\n\r]+$/, '');
	// Replace remaining returns with (?#) as placeholders for line breaks
	temp = temp.replace (/[\n\r]/g, '(?#)');
	// Replace tabs with (?#T)
	temp = temp.replace (/\t/g, '(?#T)');
	// If string contains spaces and doesn't start with (?x), add it
	if (temp.indexOf(' ') > -1 && temp.slice (0,4) !== '(?x)') {
		temp = '(?x)' + temp;
	}
	return temp;
}


// Prepare a string for display in the editor
// Replace certain codes with returns and tabs

function decode_grep (s) {
	// Remove the initial (?x)
	s = s.replace (/^\(\?x\)/, '');
	// Remove any initial (?#) (legacy)
	s = s.replace (/^\(\?#\)/, '');
	// Replace (?#) with \r
	s = s.replace (/(\(\?#\))/g, '\r');
	// Replace (?#T) with tabs
	s = s.replace (/(\(\?#T\))/g, '\t');
	return s;
}

//===================================================================================

function read_settings (f) {
	try {
		return $.evalFile(f);
	} catch (_) {
		return { // Default
			w_location: undefined,
			w_grep: '',
			w_title: GrepEditorName,
			wildcard_window: [10, 10],
			editWindowSize: [400, 200]
		}
	}
}

function write_settings (s, obj) {
	var f = File (s);
	f.open ('w');
	f.write (obj.toSource());
	f.close ();
}


function wildcard_location () {
	var w = Window.find ('palette', 'Select a wildcard');
	if (!w) {
		return [10, 10];
	}
	return [w.frameLocation.x, w.frameLocation.y];
}


function script_dir () {
	try {
		return File (app.activeScript).path;
	} catch (e) {
		return File (e.fileName).path;
	}
}                                  