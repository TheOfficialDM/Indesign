//DESCRIPTION: print all GREP styles in a new document
// Peter Kahrel

if (app.documents.length > 0 && parseInt (app.version) >= 6) {
	grep_style_report (app.activeDocument);
}


function grep_style_report (doc) {
		
	function fetch_group (s, str) {
		while (s.parent.constructor.name != 'Document') {
			return fetch_group (s.parent, s.parent.name + ' > ' + str);
		}
		return str;
	}


	var par_styles = doc.allParagraphStyles;
	var j, grep_styles, cstyle, based_on, list = [];
	for (var i = 1; i < par_styles.length; i++) {
		grep_styles = par_styles[i].nestedGrepStyles.everyItem().getElements();
		if (grep_styles.length > 0) {
			if (par_styles[i].basedOn.name == null) {
				basedon = ' (based on ' + doc.paragraphStyles[0].name + ')';
			} else {
				basedon = ' (based on ' + par_styles[i].basedOn.name + ')';
			}
			list.push ('\rParagraph style: ' + fetch_group (par_styles[i], par_styles[i].name + basedon) + '\r');
			for (j = 0; j < grep_styles.length; j++) {
				cstyle = grep_styles[j].appliedCharacterStyle;
				list.push ('\t' + fetch_group (cstyle, cstyle.name) + '\r\t££££' + grep_styles[j].grepExpression + '\r')
			}
		}
	}
	var target_frame = create_document();
	target_frame.contents = list.join('\r');
	if (target_frame.overflows) {
		flow (app.activeDocument, target_frame);
		app.activeWindow.activePage = app.activeDocument.pages[0];
	}
	finish (app.activeDocument)
}


function finish (doc) {
	app.findGrepPreferences = app.changeGrepPreferences = null;
	app.findGrepPreferences.findWhat = '££££';
	app.changeGrepPreferences.appliedParagraphStyle = 'find_what';
	doc.changeGrep();
	app.changeGrepPreferences = null;
	doc.changeGrep();
}


function flow (doc) {
	doc.viewPreferences.rulerOrigin = RulerOrigin.PAGE_ORIGIN;
	var gb = doc.pages[0].textFrames[0].geometricBounds;
	while (doc.pages[-1].textFrames[0].overflows) {
		doc.pages.add ().textFrames.add ({geometricBounds: gb});
		doc.pages[-1].textFrames[0].previousTextFrame = doc.pages[-2].textFrames[0];
	}
}


//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function create_document () {
	
	function add_styles (doc) {
		
		function add_style (s, array) {
			doc.colors.add ({
				name: s, 
				space: ColorSpace.CMYK, 
				colorValue: array
			});
			doc.characterStyles.add ({
				name: s, 
				fillColor: s
			});
		}

		var le = doc.swatches.length;
		for (var i = le-1; i > -1; i--) {
			try {doc.swatches[i].remove()} catch(_){};
		}
		add_style ('black', [100,100,100,100]);
		add_style ('blue-dark', [100,30,0,0]);
		add_style ('blue-light', [100,0,0,0]);
		add_style ('green', [100,20,100,0]);
		add_style ('green-light', [70,0,100,0]);
		add_style ('orange', [0,65,100,0]);
		add_style ('red', [0,100,100,0]);
		add_style ('yellow', [0,0,100,0]);
	}


	function create_nested_styles (pstyle) {
		var comment;
		var cstyles = pstyle.parent.characterStyles;			
		
		comment = '(?#*.?! not preceded by \\))'; // (?<!\\)[*.?!]
		pstyle.nestedGrepStyles.add({grepExpression: '(?<!\\\\)[*.?!+]'+comment, appliedCharacterStyle: cstyles.item('orange')});
		
		comment = '(?# InDesign specials such as ~F and ~=)'; // (?<!\\)\~.
		pstyle.nestedGrepStyles.add({grepExpression: '(?<!\\\\)\\~.'+comment, appliedCharacterStyle: cstyles.item('orange')});
		
		comment = '(?# The lookbehinds and lookaheads)'; // \(\?<?[=!]
		pstyle.nestedGrepStyles.add({grepExpression: '\\(\\?<?[=!]'+comment, appliedCharacterStyle: cstyles.item('blue-light')});
		
		comment = '(?# Brackets, braces, etc. not preceded by \\)'; // (?<!\\)[()\[\]\{\}|?]
		pstyle.nestedGrepStyles.add({grepExpression: '(?<!\\\\)[()\\[\\]\{\\}|?]'+comment, appliedCharacterStyle: cstyles.item('blue-light')});
		
		comment = '(?# Word character not preceded by \\)';  // (?<!\\)\\\w
		pstyle.nestedGrepStyles.add({grepExpression: '(?<!\\\\)\\\\\\w'+comment, appliedCharacterStyle: cstyles.item('red')});
		
		comment = '(?# POSIX and char. equivalents)'; // \[?\[[=:]\w+?[\=:]\]\]?
		pstyle.nestedGrepStyles.add({grepExpression: '\\[?\\[[=:]\\w+?[\\=:]\\]\\]?'+comment, appliedCharacterStyle: cstyles.item('red')});
		
		comment = '(?# The modifiers)';  // \(\?-?[imsx]\)
		pstyle.nestedGrepStyles.add({grepExpression: '\\(\\?-?[imsx]\\)'+comment, appliedCharacterStyle: cstyles.item('blue-light')});
		
		comment = '(?# Non-marking expressions)'; // (\?:
		pstyle.nestedGrepStyles.add({grepExpression: '\\(\\?:'+comment, appliedCharacterStyle: cstyles.item('blue-light')});
		
		comment = '(?# Unicode characters)'; // \\x\{\w\w\w\w\}
		pstyle.nestedGrepStyles.add({grepExpression: '\\\\x\\{\\w\\w\\w\\w\\}'+comment, appliedCharacterStyle: cstyles.item('orange')});
		
		comment = '(?# Unicode characters)'; // \\x\w\w
		pstyle.nestedGrepStyles.add({grepExpression: '\\\\x\\w\\w'+comment, appliedCharacterStyle: cstyles.item('orange')});
		
		comment = '(?# Boundaries)'; // \\[AaBbZz<>]
		pstyle.nestedGrepStyles.add({grepExpression: '\\\\[AaBbZz]'+comment, appliedCharacterStyle: cstyles.item('blue-dark')});
		
		comment = '(?# Boundaries)'; // (?<!\\)[$^]
		pstyle.nestedGrepStyles.add({grepExpression: '(?<!\\\\)[$^]'+comment, appliedCharacterStyle: cstyles.item('blue-dark')});
		
		comment = '(?# Line comments)'; // //.*
		pstyle.nestedGrepStyles.add({grepExpression: '//.*'+comment, appliedCharacterStyle: cstyles.item('green')});
		
		comment = '(?# Nested comments)'; // \(\?#.+?\)
		pstyle.nestedGrepStyles.add({grepExpression: '\\(\\?#.*?\\)'+comment, appliedCharacterStyle: cstyles.item('green')});
		
	} // create_nested_styles

	// BEGIN create_document
	
	var doc = app.documents.add();
	add_styles (doc);
	doc.paragraphStyles.add ({name: 'query_name', spaceBefore: '6pt'});

	var changeto = doc.paragraphStyles.add ({name: 'change_to'});
	changeto.nestedGrepStyles.add ({
		grepExpression: '\\x{0024}\\d', 
		appliedCharacterStyle: doc.characterStyles.item('red')
	});

	changeto.nestedGrepStyles.add ({
		grepExpression: '(?<!\\\\)\\~.', 
		appliedCharacterStyle: doc.characterStyles.item('orange')
	});
	
	var pstyle = doc.paragraphStyles.add({name: 'find_what'});
	create_nested_styles (pstyle);
	
	var m = doc.pages[0].marginPreferences;
	var gb = [
		m.top, 
		m.left, 
		doc.documentPreferences.pageHeight - m.bottom, 
		doc.documentPreferences.pageWidth - m.right
	];

	return doc.pages[0].textFrames.add ({geometricBounds: gb});
}
