
(function () {
	var s, s1;
	var pstyleName = 'Running Head';
	var dash = /[-\u2013\u2011]/;
	var leadingDigits = /\b(\d+)(\d+[-\u2013\u2011])\1(\d+\d)\b/g;
	var undoCenturies = /\b(\d)(\d\d\d[-\u2013\u2011])(?=\d\d\d\b)/;
	
	app.findGrepPreferences = app.findChangeGrepOptions = null;
	if (app.documents[0].paragraphStyles.item (pstyleName).isValid) {
		app.findGrepPreferences.appliedParagraphStyle = app.documents[0].paragraphStyles.item (pstyleName);
	}

	// The InDesign GREP skips first numbers with fewer than 3 digits 
	// (i.e. smaller than 100) and ranges whose first digits don't match
	app.findGrepPreferences.findWhat = '(?<!-)\\b(\\d)\\d\\d+[-\\x{2013}\\x{2011}]\\1\\d+\\b(?!-)';
	var found = app.documents[0].findGrep();
	for (var i = found.length-1; i >= 0; i--) {
		s = found[i].contents;
		parts = s.split(dash);
		if (parts[0].length !== parts[1].length) continue;
		if (dash.test(s)) {
			// The JS regex deletes identical leading digits but always leaves 
			// two digits in the second number. The embedded regex /^0/ deletes 
			// leading zeros in the second number.
			found[i].contents = s.replace (leadingDigits, function () {
				var s1 = arguments[1] + arguments[2] + arguments[3].replace(/^0/,'');
				// Undo century breaks: 1496-510 > 1496-1510
				return s1.replace (undoCenturies, '$1$2$1');
			});
		}
	}
}());