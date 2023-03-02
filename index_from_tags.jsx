//DESCRIPTION: Create topics and page references from text tags
/*
	Two types of separator:
	1. Subtopics: \index{mammal@dog@retriever} is added to the index under mammal, 
	with subtopics dog and retriever.
	2. Sort order: \index{M. Carlsen%Carlsen, M.}: the topic appears as M. Carlsen but is sorted as Carlsen, M.
	The characters for the separators (here, @ and %) can be set in the script's interface.
	
	Cross-references
	> see
	>> see also
	>>> see [also]
	e.g. EU>European Union

	If the index tags are not deleted, they're placed in a hiding character style or in conditions.
*/


(function () {
	
	var errors = '';

	function write_history (obj) {
		var f = File(scriptName().replace(/\.jsx$/,'.txt'));
		f.open ('w'); 
		f.encoding = 'utf-8';
		f.write (obj.toSource());
		f.close ();
	}


	function read_history () {
		var f = File(scriptName().replace(/\.jsx$/,'.txt'));
		var o = {
			start: '\\index{', 
			subtopicSeparator: '', 
			sortorderSeparator: '', 
			stop: '}', 
			replace: true
		};

		if (f.exists) {
			f.open ('r'); 
			f.encoding = 'utf-8';
			var obj = f.read ();
			f.close ();
			try {
				return eval (obj);
			} catch (_) {
				return o;
			}
		}
		return o;
	}


	function disallowed (ch) {
	//~ 	return "\\{}\"$%^&*()+=\[\]:;@~#?/<>".indexOf(ch) > -1;
		return "\\{}\"$^&*()+=\[\]:;?/~<>".indexOf(ch) > -1;
	}


	function addEscapes (s) {
		s = s.replace (/\\/g, '\\\\');
		s = s.replace (/([~.{}()\[\]])/g, '\\$1');
		return s.replace (/\$/g, '[$]');
	}


	function errorM (m) {
		alert (m, 'Error', true);
		exit();
	}


	function scriptName() {
		try {
			return String(app.activeScript);
		} catch (e) {
			return e.fileName;
		}
	}


	// Remove start and end tags
	function strip (s, tags) {
		s = s.replace (RegExp ('^'+tags.start), '');
		return s.replace (RegExp (tags.stop+'$'), '');
	}




	//-----------------------------------------------------------------------------------------------------

	function create_topic (index, s, tags) {
		
		var topic, parts;
		
		if (s.indexOf ('>') > -1) {  // see, see also, see [also]
			var seealso = s.match (/>+/)[0];
			parts = s.split (/>+/);
			topic = index.topics.add (parts[0]);
			switch (seealso) {
				case '>' : try {topic.crossReferences.add (FindTopic (index, parts[1]), CrossReferenceType.see)}catch(_){}; break;
				case '>>' : try {topic.crossReferences.add (FindTopic (index, parts[1]), CrossReferenceType.seeAlso)}catch(_){}; break;
				case '>>>' : try {topic.crossReferences.add (FindTopic (index, parts[1]), CrossReferenceType.seeOrAlsoBracket)}catch(_){};
			}
			return '';
		}

		var topicChain = s.split (tags.subtopicSeparator);
		
		parts = topicChain[0].split (tags.sortorderSeparator);
		try {
			topic = index.topics.add (parts[0]);
			if (parts[1]) topic.sortOrder = parts[1];
		} catch (e) {
			errors += parts[0] + '\r';
		}
		
		for (var i = 1; i < topicChain.length; i++) {
			parts = topicChain[i].split (tags.sortorderSeparator);
			try {
				topic = topic.topics.add (parts[0]);
			} catch (e) {
				errors += parts[0] + '\r';
			}
			if (parts[1]) topic.sortOrder = parts[1];
		}
		
		return topic;
	}


	function addPageRef (found, tags) {
		var ip = found.insertionPoints[-1].index;
		var topic_text = strip (found.contents, tags);
		var topic = create_topic (app.documents[0].indexes[0], topic_text, tags);
		if (topic == '') return; // If the topic is a cross-reference, an empty string is returned
		var p_ref = topic.pageReferences.add (found.insertionPoints[-1], PageReferenceType.CURRENT_PAGE);
		if (Math.abs(p_ref.sourceText.index - ip) > 0){ // Workaround for the table bug
			try {
				found.parentStory.characters[p_ref.sourceText.index].move (LocationOptions.after, found.insertionPoints[0]);
			} catch (_) {}
		}
	}


	function delete_tags () {
		app.findGrepPreferences = app.changeGrepPreferences = null;
		app.findGrepPreferences.findWhat = '~I';
		app.changeGrepPreferences.appliedCharacterStyle = app.documents[0].characterStyles[0];
		app.documents[0].changeGrep();
		
		app.findGrepPreferences = app.changeGrepPreferences = null;
		app.findGrepPreferences.appliedCharacterStyle = app.documents[0].characterStyles.item('index_from_tags');
		app.documents[0].changeGrep();
		
		try{
			app.documents[0].characterStyles.item('index_from_tags').remove()
		} catch(_){};
	}


	function tagsToCharacterStyles (tags) {
		if (!app.documents[0].characterStyles.item('index_from_tags').isValid) {
			app.documents[0].characterStyles.add ({name: 'index_from_tags', pointSize: '0.1 pt', horizontalScale: 1});
			// app.documents[0].characterStyles.add ({name: 'index_from_tags', fillColor: 'C=0 M=100 Y=0 K=0'});
		}
		app.findGrepPreferences = app.changeGrepPreferences = null;
		app.changeGrepPreferences.appliedCharacterStyle = app.documents[0].characterStyles.item('index_from_tags');
		app.findChangeGrepOptions.includeFootnotes = true;
		app.findGrepPreferences.findWhat = tags.start + '.+?' + tags.stop;
		app.documents[0].changeGrep();
	}


	// Interface -----------------------------------------------------------------------------

	function get_tags () {
		var previous = read_history();
		var w = new Window ('dialog', 'Index from text tags', undefined, {closeButton: false});
		w.alignChildren = 'fill';
			//w.main = w.add ('panel {orientation: "column", alignChildren: ["right", "top"]}');
			w.main = w.add ('panel {alignChildren: "right"}')
				var g1 = w.main.add ('group');
					g1.add ('statictext', undefined, 'Start tag: ');
					var start_tag = g1.add ('edittext', undefined, previous.start);
					start_tag.active = true;
					start_tag.characters = 10;
				var g2 = w.main.add ('group');
					g2.add ('statictext', undefined, 'Subtopic separator: ');
					var subtopicSeparator = g2.add ('edittext', undefined, previous.subtopicSeparator);
					subtopicSeparator.characters = 10;
				var g3 = w.main.add ('group');
					g3.add ('statictext', undefined, 'Sort-order separator: ');
					var sortorderSeparator = g3.add ('edittext', undefined, previous.sortorderSeparator);
					sortorderSeparator.characters = 10;
				var g4 = w.main.add ('group');
					g4.add ('statictext', undefined, 'End tag: ');
					var stop_tag = g4.add ('edittext', undefined, previous.stop);
					stop_tag.characters = 10;
			
			w.main2 = w.add ('panel {alignChildren: "left"}');
				var replace_index = w.main2.add ('checkbox', undefined, 'Replace existing index');
					replace_index.value = previous.replace;
					
				var keep_tags = w.main2.add ('checkbox {text: "Keep (and hide) tags"}');
					keep_tags.value = previous.keep_tags;
				
			w.buttons = w.add ('group {orientation: "row", alignChildren: ["right", "bottom"]}');
				w.buttons.add ('button', undefined, 'OK');
				w.buttons.add ('button', undefined, 'Cancel', {name: 'cancel'});
				
		if (w.show () == 2) exit ();
		if (start_tag.text == '' || stop_tag.text == '') {
			errorM ('Start tag and End tag must not be empty.');
		}

		write_history ({start: start_tag.text, 
											subtopicSeparator: subtopicSeparator.text, 
											sortorderSeparator: sortorderSeparator.text, 
											stop: stop_tag.text, 
											replace: replace_index.value,
											keep_tags: keep_tags.value
											});

		return {
					start: addEscapes (start_tag.text), 
					subtopicSeparator: addEscapes (subtopicSeparator.text), 
					sortorderSeparator: addEscapes (sortorderSeparator.text), 
					stop: addEscapes (stop_tag.text), 
					replace_index: replace_index.value,
					keep_tags: keep_tags.value
				}
	}

	//-----------------------------------------------------------------------------

	function main () {
		
		var i;
		var found;
		var Le;
		var tags = get_tags();
		
		if (tags.replace_index && app.documents[0].indexes.length > 0) {
			app.documents[0].indexes[0].topics.everyItem().remove();
		}
		
		if (app.documents[0].indexes.length == 0) {
			app.documents[0].indexes.add();
		}
		
		tagsToCharacterStyles (tags);
		
		found = app.documents[0].findGrep();
		Le = found.length;
		
		app.scriptPreferences.enableRedraw = true;
		var w = new Window ('palette', 'Creating topics');
		w.pbar = w.add ('progressbar', [0, 0, 300, 20], 0, Le);
		w.show();
		
		for (i = Le-1; i > -1; i--) {
			w.pbar.value = Le-i;
			addPageRef (found[i], tags);
		}

		if (tags.keep_tags == false) {
			delete_tags ();
		}
		
		w.close();
		
		if (errors !== '') {
			alert ('No topics/references created for \r\r' + errors);
		}
	}

	main();

}());