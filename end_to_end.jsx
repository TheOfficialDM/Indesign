//DESCRIPTION: Convert static (imported) endnotes to dynamic endnotes
// Peter Kahrel

(function () {

	var styles;
	var notes;
	var mess;
	
	//-------------------------------------------------------------------------------------------------------------

	function crossref_notes (doc) {
		var endnote_link;
		var reference;
		var endnote_links = [];
		
		for (var i = notes.endnotes.length-1; i > -1; i--) {
			mess.txt.text = 'Adding destinations: ' + String (i+1); mess.show();
			endnote_links[i] = doc.paragraphDestinations.add (notes.endnotes[i].insertionPoints[0]);
		}
		
		for (var i = notes.references.length-1; i > -1; i--) {
			mess.txt.text = 'Creating links: ' + String (i+1); mess.show();
			reference = doc.crossReferenceSources.add (notes.references[i].insertionPoints[0], styles.cr_format);
			notes.references[i].contents = '';
			doc.hyperlinks.add (reference, endnote_links[i], {visible: false});
		}
	}


	function reset_numbers (doc) {
		app.findGrepPreferences = null;
		app.findGrepPreferences.appliedParagraphStyle = styles.paragraph_numbered;
		app.findGrepPreferences.findWhat = '';

		var f = app.documents[0].findGrep();
		for (var i = 0; i < f.length; i++) {
			f[i].paragraphs[0].numberingContinue = false
			f[i].paragraphs[0].numberingStartAt = 1;
		}
		doc.crossReferenceSources.everyItem().update();
	}


	function remove_old_numbers (doc) {
		app.findGrepPreferences = app.changeGrepPreferences = null;
		app.findGrepPreferences.findWhat = '^[\\d\\s\\.]+';
		app.findGrepPreferences.appliedParagraphStyle = styles.paragraph_numbered;
		doc.changeGrep();
	}


	function add_crossref_format (doc, name) {
		var cr = doc.crossReferenceFormats.item (name);
		if (!cr.isValid) {
			cr = doc.crossReferenceFormats.add ({name: name});
			cr.buildingBlocks.add (BuildingBlockTypes.paragraphNumberBuildingBlock);
			cr.appliedCharacterStyle = styles.character;
		}
		return cr;
	}


	function add_par_style (doc) {
		var p_style = styles.paragraph.parent.paragraphStyles.add ({name: styles.paragraph.name + '_numbered'});
		p_style.basedOn = styles.paragraph;
		p_style.bulletsAndNumberingListType = ListType.numberedList;
		return p_style;
	}


	function apply_numbered_style (doc) {
		app.findGrepPreferences = null;
		app.findGrepPreferences.findWhat = '^\\t*\\d';
		app.findGrepPreferences.appliedParagraphStyle = styles.paragraph;
		var f = doc.findGrep();
		if (f.length > 0) {
			for (var i = 0; i < f.length; i++) {
				f[i].applyParagraphStyle (styles.paragraph_numbered, false);
			}
		} else {
			errorM ('Cannot find any manually numbered notes.\rPlease undo automatic numbering in the endnotes.');
		}
	}


	function references_match_notes () {
		var m;
		if (notes.references.length != notes.endnotes.length) {
			m = 'The number of endnote references does not match\rthe number of endnotes.\r';
			m += '(' + String (notes.references.length) + ' references, ' + String (notes.endnotes.length) + ' notes)';
			if (notes.endnotes.length === 0) {
				m += '\r\r0 notes probably means that you need to disable the note style\'s paragraph numbering (convert the paragraphs numbers to text first if necessary).';
			}
			errorM (m);
		}
		return true
	}


	// Delete phantom applications of the character style
	// (i.e. the char style applied to white space)

	function phantoms (doc) {
		app.findGrepPreferences = app.changeGrepPreferences = null;
		app.findGrepPreferences.findWhat = '\\D+';
		app.findGrepPreferences.appliedCharacterStyle = styles.character;
		app.changeGrepPreferences.appliedCharacterStyle = doc.characterStyles[0];
		doc.changeGrep()
	}


	function find_notes (doc) {
		
		function find_references (doc) {
			app.findGrepPreferences = null;
			app.findGrepPreferences.appliedCharacterStyle = styles.character;
			return doc.findGrep();
		}

		function find_endnotes (doc) {
			app.findGrepPreferences = null;
			app.findGrepPreferences.findWhat = '^\\s*?\\d+';
			app.findGrepPreferences.appliedParagraphStyle = styles.paragraph;
			return doc.findGrep();
		}
	
		return {
			endnotes: find_endnotes (doc),
			references: find_references (doc)
		}
	}


	function create_counter () {
		var w = Window.find ('palette', 'Convert endnotes');
		if (w === null) {
			w = new Window ('palette', 'Convert endnotes');
			w.txt = w.add ('statictext', undefined, '');
			w.txt.characters = 30;
		}
		return w;
	}


	function errorM (m) {
		alert (m, 'Error', true);
		exit ();
	}

	// --------------------------------------------------------------------------------------------------------------------


	function convert_endnotes (doc) {
		mess.txt.text = 'Fixing references...';
		mess.show();
		phantoms (doc);
		// Check that there are as many endnote references as there are numbered notes
		mess.txt.text = 'Checking styles...'; mess.show();
		notes = find_notes (doc);
		if (references_match_notes()) {
			styles.paragraph_numbered = add_par_style (doc); // Add a numbered paragraph style for the first paragraph of each note
			apply_numbered_style (doc);  // Apply the numbered note style to the paragraphs that begin with a number
			styles.cr_format = add_crossref_format (doc, 'endnote'); // Add a cross-reference format
			crossref_notes (doc); 	// Link notes and references
			remove_old_numbers (doc);  // Remove the manual numbers in the endnotes
		}
		mess.txt.text = 'Updating numbers...'; 
		mess.show();
		reset_numbers (doc)
	}


	// The interface ----------------------------------------------------------------------------------------------------

	// Get the names of the paragraph and character styles from the user.
	// These names are probably those used by MS Word, so we try to find
	// those styles in the document. If found, show them as defaults for the
	// dropdows; if not found, use the document's basic styles.


	function buildListSub (scope, type, groupType, list, str) {
		styles = scope[type].everyItem().getElements();
		for (var i = 0; i < styles.length; i++) {
			temp = list.add ('item', styles[i].name + (str == '' ? '' : ' ('+str+')'));
			temp.id = styles[i].id; // Add property so we can easily get a handle on the style later
		}
		for (var j = 0; j < scope[groupType].length; j++) {
			buildListSub (scope[groupType][j], type, groupType, list, scope[groupType][j].name+ (str == '' ? '' : ': ') + str);
		}
	}


	function buildList (list, type) {
		buildListSub (app.documents[0], type, type.replace(/s$/, 'Groups'), list, '');
		list.remove (list.items[0]);
		if (type === 'objectStyles') {
			try {list.remove (list.find (app.documents[0].objectStyles.item('$ID/[Normal Grid]').name));} catch(_){};
		}
	}


	function find_index (names, list) {
		var x;
		for (var i = 0; i < names.length; i++) {
			x = list.find (names[i]);
			if (x !== null) {
				return x;
			}
		}
		return 0;
	}


	function endnote_styles (doc) {
		var c_names = ['Endnote refs', 'Endnote Reference',  'Endnotenzeichen', 'Appel de note de fin', 'Eindnootverwijzing'];
		var p_names = ['Endnotes', 'Endnote Text',  'Endnotentext',  'Note de fin', 'Eindnoottekst'];
		var w = new Window ('dialog {text: "Dynamic endnotes", alignChildren: "right"}');
			w.panel = w.add ('panel {alignChildren: "right"}');
				w.group1 = w.panel.add ('group');
					w.group1.add ('statictext {text: "Character style: "}');
					w.c_list = w.group1.add ('dropdownlist');
				w.group2 = w.panel.add ('group');
					w.group2.add ('statictext {text: "Paragraph style: "}');
					w.p_list = w.group2.add ('dropdownlist');
				
		w.buttons = w.add ('group');
			w.buttons.add ('button', undefined, 'OK', {name: 'ok'});
			w.buttons.add ('button', undefined, 'Cancel', {name: 'cancel'});

		w.c_list.preferredSize = [200,22];
		w.p_list.preferredSize = [200,22];

		buildList (w.p_list, 'paragraphStyles');
		buildList (w.c_list, 'characterStyles');
		
		w.c_list.selection = find_index (c_names, w.c_list);
		w.p_list.selection = find_index (p_names, w.p_list);

//~ 		w.c_list.selection = 1
//~ 		w.p_list.selection = 2


		if (w.show () == 2) {
			exit ();
		}

		return {
			character: app.documents[0].characterStyles.itemByID (w.c_list.selection.id),
			paragraph: app.documents[0].paragraphStyles.itemByID (w.p_list.selection.id)
		}
	}

	//-------------------------------------------------------------------------------------------------------------------------------

	function main () {
		styles = endnote_styles (app.documents[0]);  // endnote_styles() returns a character and a paragraph style
//~ 		if (styles.paragraph.bulletsAndNumberingListType !== ListType.NO_LIST) {
//~ 			alert (styles.paragraph.name + 'uses automatic paragraph numbers. Convert the numbers to text and start again.');
//~ 			exit();
//~ 		}
		mess = create_counter();
		convert_endnotes (app.documents[0]);
		mess.close();
	}


	if (parseInt (app.version) <= 5 || app.documents.length === 0) {
		alert ('Open a document in InDesign CS4 or later.');
		exit();
	}

	main ();

}());