//DESCRIPTION: convert footnotes to dynamic (cross-referenced) endnotes
// Peter Kahrel


//-----------------------------------------------------------------------------------------------

(function () {
	
	var styles;
	
	//-----------------------------------------------------------------------------------------------------------------

	function combineParagraphs (note) {
		app.findGrepPreferences = app.changeGrepPreferences = null;
		app.findGrepPreferences.findWhat = '\\r';
		app.changeGrepPreferences.changeTo = '@£';
		note.changeGrep();
	}


	function restoreParagraphs (styles) {
		app.findGrepPreferences = null;
		app.findGrepPreferences.findWhat = '@£';
		app.findGrepPreferences.appliedParagraphStyle = styles.first;
		var found = app.documents[0].findGrep();
		for (var i = found.length-1; i >= 0; i--) {
			found[i].insertionPoints[0].contents = '\r'
		}


		if (found.length > 0) {
			app.findGrepPreferences.findWhat = '@£(.)';
			app.changeGrepPreferences.changeTo = '$1';
			app.changeGrepPreferences.appliedParagraphStyle = styles.next;
			app.documents[0].changeGrep();
		}
	}


	function check_overset (IDs) {
		var parent_page = parseInt (app.version) < 7 ? 'parent' : 'parentPage';
		var mess = '';
		for (var i = 0; i < IDs.length; i++) {
			if (app.activeDocument.stories.itemByID(IDs[i]).overflows) {
				mess += app.activeDocument.stories.itemByID(IDs[i]).textContainers.pop()[parent_page].name + '\r';
			}
		}
		if (mess != '') {
			mess = 'The conversion caused overset frames on the pages listed below. Resolve the overset situations, then update the crossreferences.\r\r' + mess;
			var f = File ('~/Desktop/footnote_to_endnote_problems.txt');
			f.encoding = 'UTF-8';
			f.open ('w');
			f.write (mess);
			f.close();
			f.execute();
		}
	}


	function find_stories (doc) {
		var array = [];
		// no selection: return all stories
		if (app.selection.length == 0) {
			return doc.stories.everyItem().getElements();
		} else {
			try {
				app.selection[0].parentStory;
				return [app.selection[0].parentStory];
			} catch (e) {
				alert ('Invalid selection', 'Convert footnotes', true);
				exit ();
			}
		}
	}


	function delete_notemarkers (scope) {
		app.findGrepPreferences = app.changeGrepPreferences = app.findChangeGrepOptions = null;
		app.findGrepPreferences.findWhat = '~F';
		scope.changeGrep ();
	}

	//-----------------------------------------------------------------------------------------------------------------------------------
	
	function add_styles () {
		var char_style;
		var endnote;
		var endnote_numbered;
		var xrefFormat;
		var doc = app.activeDocument;

		// If the document doesn't use a character style for the note references,
		// create one and use the formatting set in the Footnote Options window
		
		if (doc.footnoteOptions.footnoteMarkerStyle === doc.characterStyles[0]) {
			char_style = doc.characterStyles.item ('endnote_marker');
			if (char_style === null) {
				char_style = doc.characterStyles.add ({name: 'endnote_marker'});
			}
			char_style.position = Position.SUPERSCRIPT;
			doc.footnoteOptions.footnoteMarkerStyle = char_style;
		} else {
			char_style = doc.footnoteOptions.footnoteMarkerStyle;
		}

		// If the document doesn't use a dedicated footnote paragraph style,
		// create one and base it on [Basic Paragraph], otherwise use the set footnote style
		// for the endnotes. We need two styles: one for the first paragraph of the note,
		// which is numbered, another for any following paragraphs in the same note.

		if (doc.footnoteOptions.footnoteTextStyle.name[0] == '[') {
			if (!doc.paragraphStyles.item ('endnote').isValid) {
				doc.paragraphStyles.add ({name: 'endnote', basedOn: doc.paragraphStyles[1]});
			}
			doc.footnoteOptions.footnoteTextStyle = doc.paragraphStyles.item ('endnote');
		}
		endnote = doc.footnoteOptions.footnoteTextStyle;
		
		endnote_numbered = doc.paragraphStyles.item (endnote.name + ' numbered');
		if (!endnote_numbered.isValid) {
			endnote_numbered = doc.paragraphStyles.add ({name: endnote.name + ' numbered', basedOn: endnote});
			endnote_numbered.bulletsAndNumberingListType = ListType.numberedList;
			endnote_numbered.numberingFormat = app.documents[0].footnoteOptions.footnoteNumberingStyle;
			endnote_numbered.numberingExpression = '^#' + app.documents[0].footnoteOptions.separatorText;
			endnote_numbered.numberingContinue = true;
		}

		xrefFormat = doc.crossReferenceFormats.item ('endnote_marker');
		if (!xrefFormat.isValid) {
			xrefFormat = doc.crossReferenceFormats.add ({name: 'endnote_marker'});
			xrefFormat.appliedCharacterStyle = char_style;
			xrefFormat.buildingBlocks.add (BuildingBlockTypes.paragraphNumberBuildingBlock);
		}
		
		return {
			first: endnote_numbered,
			next: endnote, 
			xrefFormat: xrefFormat
		}
	
	};

	//-----------------------------------------------------------------------------------------------------------------------------------

	function fix_trailing_space () {
		app.findGrepPreferences = app.changeGrepPreferences = null;
		app.findGrepPreferences.findWhat = '\\s+\\z';
		app.findGrepPreferences.appliedParagraphStyle = app.activeDocument.footnoteOptions.footnoteTextStyle;
		app.activeDocument.changeGrep();
	}


	function create_message_window (le) {
		var w = Window.find ('palette', 'Foonotes to Endnotes');
		if (w == null) {
			w = new Window ('palette', 'Foonotes to Endnotes', undefined,{closeButton: false});
			w.txt = w.add ('statictext', undefined, ' ');
			w.txt.characters = le;
		}
		return w;
	}


	function initialise () {
		app.scriptPreferences.enableRedraw = true;
		fix_trailing_space ();
		styles = add_styles ();  // 'styles' defined as a global in this script
	}

	//-------------------------------------------------------------------------------------------------------------------------------------------
	
	function foot_to_end (doc) {
		
		var i, j;
		var endnote, footn, endnote_link, cue;
		var storyIDs = [];
		var stories = find_stories (doc);
		
		var progress = create_message_window (30);
		progress.show();
		progress.txt.text = 'Preparing...';
		
		initialise();
		for (j = 0; j < stories.length; j++) {
			if (stories[j].footnotes.length === 0) continue;
			stories[j].insertionPoints[-1].contents = '\rNotes';
			footn = stories[j].footnotes;
			for (i = 0; i < footn.length; i++) {
				progress.txt.text = 'Stories ' + j + '/Notes ' + i;
				stories[j].insertionPoints[-1].contents = '\r';
				combineParagraphs (footn[i].texts[0]);
				endnote = footn[i].texts[0].move (LocationOptions.after, stories[j].insertionPoints[-1]);
				endnote.applyParagraphStyle (styles.first, false);
				if (i == 0) {
					endnote.numberingContinue = false;
					endnote.numberingStartAt = 1;
				}
				if (endnote.paragraphs.length > 1) {
					endnote.paragraphs.itemByRange(1, -1).applyParagraphStyle (styles.next, false);
				}
				endnote_link = doc.paragraphDestinations.add (endnote.insertionPoints[0]);
				cue = doc.crossReferenceSources.add (footn[i].storyOffset, styles.xrefFormat);
				doc.hyperlinks.add (cue, endnote_link, {visible: false});
			}
			delete_notemarkers (stories[j]);
			storyIDs.push (stories[j].id);
		}
		doc.crossReferenceSources.everyItem().update();
		if (storyIDs.length > 0) {
			progress.close();
		}
		restoreParagraphs (styles);
		check_overset (storyIDs);
	}


	//--------------------------------------------------------------------------------------------------------------------------------------------
	
	if (parseInt (app.version) < 6) { // Only CS4 and later
		alert ('This script works only in CS5 and later', 'Convert footnotes', true);
		exit();
	}

	if (app.documents.length === 0) {
		alert ('Open a document', 'Convert footnotes', true);
		exit();
	}

	foot_to_end (app.documents[0]);

}());