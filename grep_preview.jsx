
// Show GREP matches and replacements before they are applied

// 1. Enter a GREP expression and press Find Next (to commit the expression to InDesign)
// 2. Run the script. To show any replacements, tick the "Show replacement results".

/*
	The script collects all matches in the active document, using the grep expression 
	that's set in the Find/Change window. To make an expression work in the script, 
	make sure to press the Find Next button once so that InDesign knows the
	find (and change, if any) expressions. Just typing the expressions
	in the Find What and Change To fields is not enough. You have to press
	Find Next once before running the script.
	
	The matches are placed in a new document.
	Optionally, the result of replacements is shown.
*/

main ();

function main () {
	var doReplacements = getUserInput();
	var found = app.documents[0].findGrep();
	var arr = [];
	var known = [];
	var str;
	var find = app.findGrepPreferences.findWhat;
	
	function getUserInput() {
		var w = new Window ('dialog', 'Collect matches', undefined, {closeButton: false});
			w.check = w.add ('checkbox {text: "Show replacement results"}');
			w.buttons = w.add ('group');
				w.buttons.add ('button {text: "Cancel"}');
				w.buttons.add ('button {text: "OK"}');
		if (w.show() == 2) exit();
		return w.check.value;
	}

	function nocaps (a,b) {
		return a.toUpperCase() > b.toUpperCase();
	}
	
	for (var i = found.length-1; i >= 0; i--) {
		str = found[i].contents;
		if (!known[str]) {
			known[str] = true;
			arr.push (str);
		}
	}

	var page = app.documents.add().pages[0];
	var m = page.marginPreferences;
	var pb = page.bounds;
	var frame1 = page.textFrames.add ({contents: arr.sort(nocaps).join('\r'), geometricBounds: [pb[0]+m.top, pb[1]+m.left, pb[2]-m.bottom, pb[3]-m.right]});

	if (doReplacements) {
		/*
			If we're replacing in the new list, we have to remove any positive lookbehind and lookahead:
			the results in the created list are in a different context, so the expression would not find anything
			in the list if we didn't remove the lookahead/behind. This probably holds only for positive lookahead/-behind,
			but we'll strip off the negative ones too, to be on the safe side.
		*/
		
		var grep = app.findGrepPreferences.findWhat; // Record the expression so that we can reinstate it later
		var s = app.findGrepPreferences.findWhat.replace (/^\(\?<[!=].+?[^\\]\)/, "");  // Strip any lookbehind. . .
		s = s.replace (/\(\?[!=].+?\)$/, "");  // . . .and lookahead
		app.findGrepPreferences.findWhat = s;

		page = app.documents.add().pages[0];
		var frame2 = page.textFrames.add ({contents: frame1.parentStory.contents, geometricBounds: frame1.geometricBounds});

		frame2.parentStory.changeGrep();  // Apply the grep replacement

		var list2 = frame2.parentStory.contents.split('\r');
		var list1 = frame1.parentStory.contents.split('\r');
		
		for (var i = 0; i < list1.length; i++) {
			list1[i] += '\t' + list2[i];
		}

		frame1.parentStory.contents = list1.join('\r');
		frame2.parent.parent.close (SaveOptions.no);
		
		app.findGrepPreferences.findWhat = grep;
		
	} // doReplacements

} // main
