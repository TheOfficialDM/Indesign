
(function () {
	var s, s1;
	var pstyleName = 'Running Head';
	var parts;
	
	var dash = /[-\u2013\u2011]/;
	var leadingDigits = /\b(\d+)(\d+[-\u2013\u2011])\1(\d+)\b/g;
	var restoreTeens = /1(\d[-\u2013\u2011])/;
	var undoCenturies = /\b(\d)(\d\d\d[-\u2013\u2011])(?=\d\d\d\b)/;
	
	app.findGrepPreferences = app.findChangeGrepOptions = null;
	if (app.documents[0].paragraphStyles.item (pstyleName).isValid) {
		app.findGrepPreferences.appliedParagraphStyle = app.documents[0].paragraphStyles.item (pstyleName);
	}
	app.findGrepPreferences.findWhat = '(?<!-)\\b(\\d)\\d+[-\\x{2013}\\x{2011}]\\1\\d+\\b(?!-)';
	var found = app.documents[0].findGrep();
	for (var i = found.length-1; i >= 0; i--) {
		s = found[i].contents;
		parts = s.split(dash);
		if (parts[0].length !== parts[1].length) continue;
		found[i].contents = s.replace (leadingDigits, function () {
			// Drop digits, restore teens
			s1 = (arguments[1] + arguments[2] + arguments[3]).replace (restoreTeens, '1$11');
			// Undo century breaks: 1496-510 > 1496-1510
			return s1.replace (undoCenturies, '$1$2$1');
		});
	}
}());
