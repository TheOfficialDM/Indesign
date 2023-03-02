/*=====================================================================

Apply a designated paragraph style to paragraphs whose first letter
changes from the previous paragraph. Provide the paragraph style's name
at "skip_style". To add section letters and apply the skip style
to the section headings, set "insert_letter" to true.

Peter Kahrel

=====================================================================*/

(function () {

	var skip_style = 'index_skip';
	var insert_letter = false;

	function check_style () {
		if (!app.activeDocument.paragraphStyles.item (skip_style).isValid) {
			alert ('Cannot find paragraph style "' + skip_style + '"', 'Error', true);
			exit();
		}
		return app.activeDocument.paragraphStyles.item (skip_style);
	}

	function changed (x, y) {
		return x.toLowerCase() !== y.toLowerCase();
	}

	function apply_skip_style () {
		var skipper = check_style (skip_style);
		app.findGrepPreferences = null;
		app.findGrepPreferences.findWhat = '^.';
		var found = app.selection[0].parentStory.findGrep();
		for (var i = found.length-1; i > 0; i--) {
			if (changed (found[i].contents, found[i-1].contents)) {
				if (insert_letter) {
					found[i].contents = found[i].contents.toUpperCase() + '\r' + found[i].contents;
				}
				found[i].paragraphs[0].applyParagraphStyle (skipper, false);
			}
		}
	}

	try {
		var story = app.selection[0].parentStory;
	} catch (_) {
		alert ('Select a story');
		exit();
	}

	apply_skip_style();

}());