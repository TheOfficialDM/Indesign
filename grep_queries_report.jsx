//DESCRIPTION: List GREP queries in a new document
// Peter Kahrel


(function () {

	function create_document () {
		
			function add_styles (doc) {
				
				function add_style (s, array) {
					doc.colors.add ({name: s, colorValue: array});
					doc.characterStyles.add ({name: s, fillColor: s});
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
			} // add_styles


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
				pstyle.nestedGrepStyles.add({grepExpression: '(?<!\\\\)[()\\[\\]\\{\\}|?]'+comment, appliedCharacterStyle: cstyles.item('blue-light')});
				
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
		
		var doc = app.documents.add ({textPreferences: {typographersQuotes: false}});
		add_styles (doc);
		doc.paragraphStyles.add ({name: 'query name', spaceBefore: '6pt'});

		var changeto = doc.paragraphStyles.add ({name: 'change to'});
		changeto.nestedGrepStyles.add({grepExpression: '\\x{0024}\\d', appliedCharacterStyle: doc.characterStyles.item('red')});
		changeto.nestedGrepStyles.add({grepExpression: '(?<!\\\\)\\~.', appliedCharacterStyle: doc.characterStyles.item('orange')});
		
		var pstyle = doc.paragraphStyles.add({name: 'find what'});
		create_nested_styles (pstyle);
		
		var m = doc.pages[0].marginPreferences;
		var gb = [m.top, m.left, 
			doc.documentPreferences.pageHeight - m.bottom, 
			doc.documentPreferences.pageWidth - m.right];	

		return doc.pages[0].textFrames.add ({geometricBounds: gb});
	}


	//----------------------------------------------------------------------------------------------------------------------------------

	function finish (doc) {
		app.findGrepPreferences = app.changeGrepPreferences = null;
		app.findGrepPreferences.findWhat = '^###';
		app.changeGrepPreferences.appliedParagraphStyle = 'find what';
		doc.changeGrep();
		app.findGrepPreferences.findWhat = '^>>>';
		app.changeGrepPreferences.appliedParagraphStyle = 'change to';
		doc.changeGrep();
		app.findGrepPreferences.findWhat = '^@@@';
		app.changeGrepPreferences.appliedParagraphStyle = 'query name';
		doc.changeGrep();
		
		app.findGrepPreferences = app.changeGrepPreferences = null;
		app.findGrepPreferences.findWhat = '^(###|@@@|>>>)';
		app.changeGrepPreferences.changeTo = ''
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


	//----------------------------------------------------------------------------------------------------------------------------------


	function find_queries () {
		var xml;
		var queries = Folder (app.scriptPreferences.scriptsFolder.parent.parent + '/Find-Change Queries/Grep/').getFiles ('*.xml');
		var s = '';
		for (var i = 0; i < queries.length; i++) {
			queries[i].open ('r');
			xml = new XML (queries[i].read());
			s += '@@@//' + queries[i].name.replace (/%20/g, ' ') + '\r';
			queries[i].close();
			s += '###' + xml.Description.FindExpression.@value + '\r';
			s += '>>>' + xml.Description.ReplaceExpression.@value + '\r\r';
		}
		return s
	}


	var queries = find_queries();
	var target_frame = create_document();
	target_frame.contents = queries;
	if (target_frame.overflows) {
		flow (app.activeDocument, target_frame);
		app.activeWindow.activePage = app.activeDocument.pages[0];
	}
	finish (app.activeDocument);

}());