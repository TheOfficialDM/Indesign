//DESCRIPTION: Add two-way links between note numbers and note references.
// Peter Kahrel

/*
	Notes and references must be in the same story, but there can be more than 
	one story with notes and references.
*/

#targetengine endnote_hyperlinks;

(function () {
	
	var data;
	
	//-----------------------------------------------------------
	// Return the path of the running script
	
	function scriptPath() {
		try {
			return app.activeScript;
		} catch (e) {
			return File (e.fileName);
		}
	}

	//----------------------------------------------------------
	// Read any stored dialog settings
	
	function read_history () {
		var obj = {};
		var f = File (scriptPath().fullName.replace(/\.jsx$/,'.txt'));
		if (f.exists) {
			obj = $.evalFile (f);
		}
		return obj;
	}

	//----------------------------------------------------------
	// Store dialog settings

	function write_history (obj) {
		var f = File(scriptPath().fullName.replace(/\.jsx$/,'.txt'));
		f.open ('w');
		f.write (obj.toSource());
		f.close();
	}

	//-----------------------------------------------------------
	function errorM (m){
		alert (m, 'Error', true);
		exit();
	}

	//-----------------------------------------------------------
	// Set up the Find/Change dialog
	
	function setGrep (find, replace, options) {
		app.findGrepPreferences = app.changeGrepPreferences = null;
		app.findGrepPreferences.findWhat = find;
		app.changeGrepPreferences.changeTo = replace;
		if (options == undefined) options = {};
		app.findGrepPreferences.appliedParagraphStyle = options.PS || null;
		app.findGrepPreferences.appliedCharacterStyle = options.CS || null;
		app.findChangeGrepOptions.properties ={
			includeFootnotes: options.FN || false,
			includeMasterPages: options.M || false,
			includeHiddenLayers: options.HL || false,
			includeLockedLayersForFind: options.LL || false,
			includeLockedStoriesForFind: options.LS || false
		}
	}

	//-----------------------------------------------------------
	// A window to display messages while the script runs
	
	function create_message_window (le) {
		var w = Window.find ('palette', 'Linking notes and references');
		if (w == null) {
			w = new Window ('palette','Endnote to footnote', undefined, {closeButton: false});
			w.txt = w.add ('statictext', undefined, ' ');
			w.txt.characters = le;
		}
		return w;
	}

	//-------------------------------------------------------------
	// The interface

	function get_styles (doc) {
		var styles = read_history ();
		var w = new Window ('dialog {text: "Link notes and references", properties: {closeButton: false}}');
			var c_styles = doc.characterStyles.everyItem().name;
			c_styles.shift();
			var p_styles = doc.paragraphStyles. everyItem().name;
			var panel = w.add ('panel {alignChildren: "right"}');
				var gr1 = panel.add ('group {_ : StaticText {text: "Character style:"}}');
					 var c_list = gr1.add ('dropdownlist', undefined, c_styles);
				var gr2 = panel.add ('group {_ : StaticText {text: "Paragraph style:"}}');
					 var p_list = gr2.add ('dropdownlist', undefined, p_styles);
				
			var buttons = w.add ('group {alignment: "right"}');
				buttons.add ('button', undefined, 'Cancel', {name: 'cancel'});
				buttons.add ('button', undefined, 'OK', {name: 'ok'});

			c_list.preferredSize.width = p_list.preferredSize.width = 200;

			var temp = c_list.find (styles.cstyle);
			if (styles.cstyle == undefined || temp ==  null){
				c_list.selection = 0;
			} else {
				c_list.selection = temp;
			}

			temp = p_list.find (styles.pstyle);
			if (styles.pstyle == undefined || temp ==  null) {
				p_list.selection = 0;
			} else {
				p_list.selection = temp;
			}

		if (w.show () == 2) {
			exit ();
		}
	
		write_history ({
			cstyle: c_list.selection.text, 
			pstyle: p_list.selection.text
		});
	
		return {
			cstyle: doc.characterStyles.item (c_list.selection.text), 
			pstyle: doc.paragraphStyles.item (p_list.selection.text)
		}
	} // get_styles


	//---------------------------------------------------------------
	// Convert automatic paragraph numbering to text and delete the cross-references
	
	function convert_numbering () {
	//~ 	app.findGrepPreferences = null;
	//~ 	app.findGrepPreferences.appliedParagraphStyle = pstyle;
	//~ 	app.findGrepPreferences.findWhat = '^.'
	//~ 	var p = app.activeDocument.findGrep();
	//~ 	for (var i = 0; i < p.length; i++)
	//~ 		p[i].convertBulletsAndNumberingToText();
		var hlinks = data.pstyle.parent.hyperlinks.everyItem().getElements();
		for (var i = hlinks.length-1; i > -1; i--){
			if (hlinks[i].source instanceof CrossReferenceSource && hlinks[i].destination.destinationText.appliedParagraphStyle.name == data.pstyle.name){
				hlinks[i].destination.destinationText.paragraphs[0].convertBulletsAndNumberingToText();
				hlinks[i].source.remove();
			}
		}
	}

	//---------------------------------------------------------------
	// Make sure that each note is a single paragraph by replacing with a code (here %£%)
	// hard returns which aren't followed by a digit 

	function fetch_notes (doc) {
		setGrep (/\r(?![\divxl])/.source, '%£%', {PS: data.pstyle});
		doc.changeGrep();
		app.findGrepPreferences.findWhat = '^[\\divxl]+';
		return doc.findGrep();
	}

	//---------------------------------------------------------------
	
	function fetch_refs (doc) {
		app.findGrepPreferences = null;
		app.findGrepPreferences.findWhat = '[\\divxl]+';
		app.findGrepPreferences.appliedCharacterStyle = data.cstyle;
		return doc.findGrep ();
	}

	//---------------------------------------------------------------
	
	function process_story (story, showmessage) {
		//var notes = fetch_notes (story, data.pstyle);
		//var refs = fetch_refs (story, data.cstyle);
		var doc = story.parent;
		var id, cue_source, note_source, cue_anchor, note_anchor;

		for (var i = data.refs.length-1; i >= 0; i--) {
			showmessage.txt.text = 'Linking... ' + i;
			id = '_' + String(story.id) + '_' + String (i+1);
			cue_source = doc.hyperlinkTextSources.add (data.refs[i]);
			note_source = doc.hyperlinkTextSources.add (data.notes[i]);
			cue_anchor = doc.hyperlinkTextDestinations.add (data.refs[i], {name: 'cue' + id});
			note_anchor = doc.hyperlinkTextDestinations.add (data.notes[i], {name: 'note' + id});
			doc.hyperlinks.add (cue_source, note_anchor, {name: 'HL_cue_to_note' + id});
			doc.hyperlinks.add (note_source, cue_anchor, {name: 'HL_note_to_cue' + id});
		}
	}
	
	//---------------------------------------------------------------
	
	function endnote_links () {

		var doc = app.activeDocument;

		// A display window showing progress
		var showmessage = create_message_window (30);
		showmessage.show();
		showmessage.txt.text = 'Checking styles...';
		convert_numbering ();

		showmessage.txt.text = 'Collecting notes and references...'
		// Find notes and references and compare length
		data.notes = fetch_notes (doc);
		data.refs = fetch_refs (doc);
		if (data.notes.length !== data.refs.length) {
			alert ('Notes and references do not match:\r(' + data.notes.length + ' notes, ' + data.refs.length + ' references.)');
			exit ();
		}
		
		// Now process each story separately
		var stories = app.activeDocument.stories.everyItem().getElements();
		for (var i = 0; i < stories.length; i++) {
			process_story (stories[i], showmessage);
		}

		// Finish off at document level
		// Restore any paragraph breaks
		setGrep ('%£%', '\\r', {FN: true});
		app.activeDocument.changeGrep();
		
		try {showmessage.close()} catch(_){}
	} // endnote_links

	//---------------------------------------------------------------
	
	if (confirm ('This script is destructive. \rMake sure you have saved the document \rand/or that you have a copy of the document.\r\rContinue?', true, 'WARNING')) {
		data = get_styles (app.activeDocument);
		endnote_links();
	}
		
}());