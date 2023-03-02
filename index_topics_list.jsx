//DESCRIPTION: Index from word list
// Peter Kahrel

/*--------------------------------------------------------------------------

To create separate indexes, prefix items with any of the symbols £ % & @.
Open the word list and all files to be concordanced.
The word list document's name must have 'topic list' in its name.

------------------------------------------------------------------------------*/

(function () {

	// true: search documents case-sensitively,
	// false: ignore case
	var case_sensitive = true;

	// Replace index?
	var replace_index = true;

	// Ignore text after comma?
	var comma_split = true;

	// Ignore text after parenthesis?
	var paren_split = false;

	// List the paragraph styles to be included, using the first three
	// characters of their name (case-sensitive), and prefixed with '|'.
	// Use '' to ignore this and include all paragraph styles

	var paragraph_styles = '';
	//paragraph_styles = '|def|sec';

	//----------------------------------------------------------------------------

	function init_progress () {
		var w = new Window ('palette', 'Concordance');
		w.alignChildren = ['left', 'top'];
		w.docName = w.add ('statictext', undefined, '------');
		w.docName.characters = 40;
		w.topic = w.add ('statictext');
		w.topic.characters = 40;
	//	w.pbar = w.add ('progressbar', undefined, 1, 50);
	//	w.pbar.preferredSize = [270,20];
		return w;
	}

	//----------------------------------------------------------------------------

	function environment_check () {
		if (app.documents < 2) {
			alert ('Open a word list and the document(s) to be indexed.');
			exit();
		}
		var listDocName = findTopicList();
		if (!listDocName) {
			alert ('Open the document with the topics to be marked (it should have "topic list" in its name)');
			exit();
		}
		// The list document is now the active document
		if (app.documents.item(listDocName).pages[0].textFrames.length != 1) {
			alert ('The list document should have one text frame on the first page -- not more, not fewer.');
			exit();
		}
		return listDocName;
	}

	//-------------------------------------------------------------------------------
	
	function get_story () {
		var doc = app.documents.add();
		doc.zeroPoint = [0,0];
		doc.textPreferences.properties = {
			smartTextReflow: true,
			deleteEmptyPages: true,
			limitToMasterTextFrames: false,
		}

		var bounds = doc.pages[0].bounds;
		var m = doc.pages[0].marginPreferences;
		var gb = [m.top, m.left, bounds[2]-m.bottom, bounds[3]-m.left];
		var frame1 = doc.pages[0].textFrames.add ({geometricBounds: gb});
		frame1.nextTextFrame = doc.pages.add().textFrames.add ({geometricBounds: gb});
		return frame1.parentStory;
	}

	//----------------------------------------------------------
	
	function set_find_options () {
		app.findGrepPreferences = app.changeGrepPreferences = null;
		app.findChangeGrepOptions.properties = {
			includeLockedLayersForFind: false,
			includeLockedStoriesForFind: false,
			includeHiddenLayers: true,
			includeMasterPages: false,
			includeFootnotes: true,
		}
	}

	//---------------------------------------------------------------------
		
	function get_list (doc) {
		var story = doc.pages[0].textFrames[0].parentStory;
		// Remove trailing spaces
		app.findGrepPreferences = null;
		app.findGrepPreferences.findWhat = '\\s+$';
		app.changeGrepPreferences.changeTo = '';
		story.changeGrep ();
		// Remove serial spaces
		app.findGrepPreferences.findWhat = '  +';
		app.changeGrepPreferences.changeTo = ' '
		story.changeGrep();
		return story.contents.split ('\r');
	}

	//---------------------------------------------------------------------
	// Take an item from the word list and create a search item:
	// split word-list item on comma. If that fails,
	// split on parenthesis. If that fails too, return the whole item.
	// Wrap string in word-boundary markers and 
	// prefix the case-insensitive code, if necessary.

	function get_search_item (s) {
		// Delete prefixed symbol
		s = s.replace(/^[£%&@]/, '');
		if (comma_split) {
			// Delete anything from comma or parenthesis
			s = s.replace (/\s?[,(].+$/, '');
		}
		// Add word boundaries
		s = '\\b' + s  + '\\b';
		if (case_sensitive == false) {
			s = '(?i)' + s;
		}
		return s;
	}

	//---------------------------------------------------------------------
	
	function style_ok (w) {
		return (paragraph_styles == '' || paragraph_styles.search (w.appliedParagraphStyle.name.slice (0,3)) > 0);
	}

	//---------------------------------------------------------------------
		
	function findTopicList () {
		var docs = app.documents.everyItem().getElements();
		for (var i = docs.length-1; i >= 0; i--) {
			//if (docs[i].name.toUpperCase().replace(/[\x20_]/g,"").indexOf('TOPICLIST') > -1) {
			if (/topic[-\x20_]?list/i.test (docs[i].name)) {
				return docs[i].name;
			}
		}
		return null;
	}

	//---------------------------------------------------------------------

	function index_documents (word_list, listName, displ) {
		var i, j, k;
		var new_topic, found;
		var notFound = [];
		var duplicates = {};
		var docs = app.documents.everyItem().getElements();
		for (i = 0; i < docs.length; i++) {
			if (docs[i].name == listName) continue; // Skip the list itself
			if (docs[i].indexes.length && replace_index) {
				displ.docName.text = docs[i].name + ' (deleting index)';
				docs[i].indexes[0].topics.everyItem().remove();
			}
			if (docs[i].indexes.length == 0) {
				docs[i].indexes.add();
			}
			displ.docName.text = docs[i].name;
			for (j = 0; j < word_list.length; j++) {
				//$.bp(word_list[j].indexOf('Boulé') > -1)
				//displ.pbar.value = j;
				displ.topic.text = word_list[j];
				// Split a word-list entry into an item to search and use for index
				var search_item = get_search_item (word_list[j]);
				duplicates[search_item] ? duplicates[search_item].push (word_list[j]) : duplicates[search_item] = [word_list[j]];
				try {
					new_topic = docs[i].indexes[0].topics.add (word_list[j]);
					app.findGrepPreferences.findWhat = search_item;
					found = docs[i].findGrep();
					if (!found.length) {
						notFound.push (word_list[j] + ' >> ' + search_item.replace(/\\b/g,''));
					} else {
						for (k = found.length-1; k > -1; k--) {
							try {
								if (style_ok (found[k])) {
									new_topic.pageReferences.add (found[k], PageReferenceType.currentPage);
								}
							} catch (_) {
								/* not interested in errors */
							}
						}
					}
				} catch (_) {
					notFound.push (word_list[j] + ' >> ' + search_item);
				}
			}
			//doc.save ();
			//doc.close ();
		}
		return {
			notFound: notFound,
			duplicates: duplicates,
		}
	}


	function index_from_list () {
		var listName = environment_check();
		set_find_options();
		var list = get_list (app.documents.item (listName));
		//app.activeDocument.close (SaveOptions.yes);
		var displ = init_progress ();
		displ.show();
		var result = index_documents (list, listName, displ);
		if (result.notFound.length || result.duplicates.__count__) {
			var story = get_story();
			if (result.notFound.length) {
				story.contents = 'Not found:\r\r' + result.notFound.join('\r');
			}
			if (result.duplicates.__count__) {
				story.insertionPoints[-1].contents = '\r\rAmbiguous entries:';
				for (var i in result.duplicates) {
					if (result.duplicates[i].length > 1) {
						story.insertionPoints[-1].contents = '\r\r';
						story.insertionPoints[-1].contents = result.duplicates[i].join('\r');
					}
				}
			}
		}
	}

	index_from_list ();

}());