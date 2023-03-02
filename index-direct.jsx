//DESCRIPTION: Index direct
// Peter Kahrel

#targetengine index_direct;


if (app.documents.length < 2 || app.selection.length == 0 || app.selection[0].parentStory.constructor.name != 'Story') {
    errorM ('Select the frame that contains the word list\r(and open two or more documents).');
}

try {
	index_independent (app.documents[0]);
} catch (e) {
	alert (e.message + '\r(line ' + e.line + ')')
};

//=======================================================================


function index_independent (doc) {
	var obj = get_data (doc);
	create_index (obj);
}


function create_index (obj) {
	app.scriptPreferences.enableRedraw = true;
//~ 	if (app.selection.length == 0 && app.activeDocument.textFrames.length > 1) {
//~ 		errorM ('Select a text frame or an insertion point.');
//~ 	}
	var top_text, pages;
	check_list (app.activeDocument);
	grep_settings (obj);  // grep_settings MUST follow check_list
	// get the topics from the concordance list as paragraph objects
	var tops = app.selection[0].parentStory.paragraphs;
	// get the names of all open documents (creates array of doc. names)
	var docs = app.documents.everyItem().name;
	// and delete current document (the concordance list) from the array (but it will stay open)
	docs.shift();
	// initialise message window
	mess = createmessagewindow (40);
		
	for (var i = 0; i < tops.length; i++) {
		// create text string from topic
		top_text = make_topic (tops[i], obj);
		// get page numbers of the topic from all open docs
		pages = get_pages (docs, top_text, obj);
		// If any, append to topic in concordance list.
		// The last one is added at ins. point -2, the others at -1.
		if (pages.length > 0) {
			if (i == tops.length-1) {
				tops[i].insertionPoints[-1].contents = obj.topic_separator + pages;
			} else {
				tops[i].insertionPoints[-2].contents = obj.topic_separator + pages;
			}
		} else {
			if (obj.mark) {
				tops[i].strikeThru = true;
			}
		}
	}
	if (obj.section_markers) {
		add_sections (tops);
	}
	mess.parent.close();
}


	function add_sections (par) {
		mess.text = 'Adding sections...';
		app.findGrepPreferences = null;
		app.findGrepPreferences.findWhat = '\\w+?';
		var ch1, ch2;
		for (var i = par.length-2; i >= 0; i--) {
			try {
				ch1 = par[i].findGrep()[0].contents.toUpperCase();
				ch2 = par[i+1].findGrep()[0].contents.toUpperCase();
				if (ch1 != ch2) {
					par[i].insertionPoints[-1].contents = ch2+'\r';
				}
			}
			catch (_) {
			}
		}
		try {
			par[0].insertionPoints[0].contents = par[0].findGrep()[0].contents.toUpperCase()+'\r';
		} catch (_) {
		}
	}


	function make_topic (t, obj) {
		var s = t.contents.replace (/\r$/, ''); //remove trailing return
		mess.text = s; // show the topic -- can't do that anywhere else
		// delete everything from comma or parenthesis, including any preceding space
		//~     s = s.replace (/\s?[,(].+$/, '');
		s = s.replace (/(,|_\().+$/, '');
		s = s.split('__').pop();  // extract any subtopic
		s = '\\b'+s+'\\b';  // whole-word-only search
		if (obj.case_sensitive == false) { // case sensitive if necessary
			s = '(?i)' + s;
		}
		return s;
	}


	function get_pages (docs, t, obj) {
		var pages = [];
		for (var i = 0; i < docs.length; i++) {
			var temp = get_one_doc (app.documents.item (docs[i]), t, obj);
			if (temp.length > 0) {
				pages = pages.concat (temp);
			}
		}
		// sort and remove duplicates
		if (pages.length > 1) {
			pages = rerange (pages, obj);
		}
		return pages;
	}


function get_one_doc (doc, t, obj) {
	var page, array = [];
	app.findGrepPreferences.findWhat = t;
	var pp = doc.findGrep();
	for (var i = 0; i < pp.length; i++) {
		if (check_style (pp[i], obj)) {
			page = find_page (pp[i]);
			if (page != null) {
				array.push (page.name);
			}
		}
	}
	return array
}


function find_page (o) {
	try {
		if (o.hasOwnProperty ('parentPage')) {
			return o.parentPage;
		}
		if (o.constructor.name == 'Page') {
			return o;
		}
		switch (o.parent.constructor.name) {
			case 'Character': return find_page (o.parent);
			case 'Cell': return find_page (o.parent.texts[0].parentTextFrames[0]);
			case 'Table' : return find_page (o.parent);
			case 'TextFrame' : return find_page (o.parent);
			case 'Group' : return find_page (o.parent);
			case 'Story': return find_page (o.parentTextFrames[0]);
			case 'Footnote': return find_page (o.parent.storyOffset);
			case 'Page' : return o.parent;
		}
	}
	catch (_) {
		return null
	}
}


function check_style (w, obj) {
	if (obj.selected_styles == '') return true;
	// exclude the selected paragraphs
	if (obj.include == 0 && obj.selected_styles.indexOf ('£$'+w.appliedParagraphStyle.name+'£$') < 0) return true;
	// include just the selected paragraphs
	if (obj.include == 1 && obj.selected_styles.indexOf ('£$'+w.appliedParagraphStyle.name+'£$') > -1) return true;
}

// remove all trailing spaces and returns from the word list

function check_list (doc) {
	app.findGrepPreferences = app.changeGrepPreferences = null;
	app.findGrepPreferences.findWhat = '\\x20\\x20+';
	app.changeGrepPreferences.changeTo = ' ';
	doc.changeGrep();
	app.findGrepPreferences.findWhat = '\\s+$';
	app.changeGrepPreferences.changeTo = '';
	doc.changeGrep();
	app.findGrepPreferences.findWhat = '^\\s+';
	app.changeGrepPreferences.changeTo = '';
	doc.changeGrep();
}

function createmessagewindow( le ) {
    dlg = new Window ('palette');
    dlg.alignChildren = ['left', 'top'];
    txt = dlg.add ('statictext', undefined, '');
    txt.characters = le;
    dlg.show();
    return txt;
	}

//=================================================================

// Sort, remove duplicates, and range page numbers

function rerange (pagenum_array, obj) {
	var page_nums = remove_duplicates (pagenum_array);
	// split array into two: one roman, the other arabic
	var page_nums = split_roman_arabic (page_nums);
	page_nums.arabic = sort_range (page_nums.arabic, obj).join (', ');
	if (page_nums.roman.length > 1) {
		// convert roman numbers to arabic
		page_nums.roman = roman_to_arabic (page_nums.roman);
		page_nums.roman = sort_range (page_nums.roman, obj)
		// convert the arabic numbers in the roman array back to roman, return a string
		page_nums.roman = arabic_to_roman (page_nums.roman.join (', '));
	}
	// concatenate the arrays
	if (page_nums.roman.length > 0 && page_nums.arabic.length > 0) {
		page_nums.roman += ', ';
	}
	page_nums = page_nums.roman + page_nums.arabic;
	// Counter-intuitive construction here, but it's necessary
	return page_nums;
}

function sort_range (array, obj) {
	//array = unrange (array);  // not needed in this script
	array = array.sort (sort_num);
	if (obj.range_pages == true) {
		array = apply_page_ranges (array, obj);
	}
	return array;
}

// return two element object, each element an array,
// one of roman numbers, the other of arabic numbers

function split_roman_arabic (array) {
	var roman = [];
	var arab = [];
	for (var i = 0; i < array.length; i++) {
		if (array[i].match (/^[-\u2013\d]+$/) != null) {
			arab.push (array[i]);
		} else {
			roman.push (array[i]);
		}
	}
	return {roman: roman, arabic: arab}
}


//~ function arabic_to_roman (array)
//~     {
//~     for (var i = array.length-1; i > -1; i--)
//~         array[i] = arabic2roman (array[i]);
//~     return array
//~     }


function arabic_to_roman (s) {
	return s.replace (/\w+/g, arabic2roman)
}


function roman_to_arabic (array) {
	for (var i = array.length-1; i > -1; i--) {
		array[i] = roman2arabic (array[i]);
	}
	return array;
}


function sort_num (a, b) {return a - b}

//~ function sort_roman (a, b) {return roman2arabic (a) - roman2arabic (b)}

function arabic2roman (arab) {
	var roman = '';
	if (arab < 10000) {
	var rom = [
						['', 'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix'], 
						['', 'x', 'xx', 'xxx', 'xl', 'l', 'lx', 'lxx', 'lxxx', 'xc'], 
						['', 'c', 'cc', 'ccc', 'cd', 'd', 'dc', 'dcc', 'dccc', 'cm'], 
						['', 'm', 'mm', 'mmm', '4m', '5m', '6m', '7m', '8m', '9m']
					];
		arab = String (arab).split('').reverse().join('');
		for (var i = 0; i < arab.length; i++) {
			roman = rom[i][arab.charAt(i)] + roman;
		}
	}
	return roman;
}


function roman2arabic (roman) {
	var rom2arab = {i: 1, v: 5, x: 10, l: 50, c: 100, d: 500, m: 1000};
	var arabic = rom2arab [roman.substr (-1)];
	for (var i = roman.length-2; i > -1; i--) {
		if (rom2arab [roman[i]] < rom2arab [roman[i+1]]) {
			arabic -= rom2arab [roman[i]];
		} else {
			arabic += rom2arab [roman[i]];
		}
	}
	return arabic;
}


function remove_duplicates (array) {
	var temp = [];
	var dup = {};
	for (var i = array.length-1; i > -1; i--) {
		if (array[i] != undefined && !dup[array[i]]) {
			dup[array[i]] = true;
			temp.push (array[i]);
		}
	}
	return temp;
}



function apply_page_ranges (array, obj) {
	var tolerance = obj.tolerance+1;
	var temp = [];
	var range = false;
	for (var i = 0; i < array.length; i++) {
		temp.push (array[i]);
		while (array[i+1] - array[i] <= tolerance) {
			i++; range = true;
		}
		if (range) {
			temp[temp.length-1] += obj.dash + array[i];
		}
		range = false;
	}
	return temp;
}

// undo ranging (and digit dropping)

function unrange (array) {
	
	function expand_num () {
	// 123-6 > 123-126
		function undrop (from, to) {return from.slice (0, from.length-to.length) + to};
		var expanded = '';
		var start = arguments[1];
		var stop = arguments[2];
			if (start.length > stop.length) {
				stop = undrop (start, stop);
			}
		start = +start; stop = +stop;
		for (var i = start; i < stop; i++) {
			expanded += i + ',';
		}
		expanded += stop;
		return expanded;
	}

	var s = array.join (',');
	s = s.replace (/(\d+)[-\u2013](\d+)/g, expand_num);
	return s.split (',')
}

// End rerange ============================================================

function errorM (m) {
	alert (m);
	exit ();
}


function grep_settings (o) {
	app.findGrepPreferences = app.changeGrepPreferences = null;
	app.findChangeGrepOptions.properties = {
		includeFootnotes: o.incFN,
		includeHiddenLayers: o.incHL,
		includeLockedLayersForFind: o.incLL,
		includeLockedStoriesForFind: o.incLS
	}
}

// End create_index ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

function get_data (doc) {
	var history_file = script_dir() + '/index_direct.txt';
	var history = read_history (history_file);
	// Get the document's paragraph styles
	var list2 = doc.paragraphStyles.everyItem().name;
	// remove the first item ([No Paragraph])
	list2.shift ();
	// get the styles in the other doc just in case we want to load them (can't do that after the dialog is displayed)
	var parstyles = app.documents[1].paragraphStyles.everyItem().name;
	parstyles.shift();
	
	var w = new Window ('dialog', 'Create independent index', undefined, {closeButton: false});
        w.alignChildren = 'left';
        var panel = w.add ('panel', undefined, 'Select paragraph styles');
            panel.orientation = 'row';
            var list1 = panel.add ('listbox', undefined, list1, {multiselect: true});
            var addbuttons = panel.add ('group');
                addbuttons.orientation = 'column';
                addbuttons.alignChildren = 'fill';
                var add_ = addbuttons.add ('button', undefined, '<---Add selected');
                var add_all = addbuttons.add ('button', undefined, '<---Add all');
                var remove_ = addbuttons.add ('button', undefined, 'Remove selected --->');
                var remove_all = addbuttons.add ('button', undefined, 'Remove all --->');
                var load_styles = addbuttons.add ('button', undefined, 'Load styles');
                var sort_styles = addbuttons.add ('button', undefined, 'Sort styles');
            var list2 = panel.add ('listbox', undefined, parstyles, {multiselect: true});
            list1.preferredSize = list2.preferredSize = [200, 200];
            
            var clude = w.add ('panel');
                clude.orientation = 'row';
                clude.alignment = 'fill';
                clude.alignChildren = 'left';
                clude.add ('radiobutton', undefined, 'Exclude the selected paragraph styles');
                clude.add ('radiobutton', undefined, 'Include ONLY the selected paragraph styles');
                clude.children[0].value = true;
        
        var group23 = w.add ('group');
            group23.alignChildren = 'top';
            var group2 = group23.add ('group');
                group2.orientation = 'column';
                group2.alignChildren = 'left';
                
                var gr0 = group2.add ('group');
                    gr0.add ('statictext', undefined, 'Topic-page separator: ');
                    var topic_sep = gr0.add ('dropdownlist', undefined, ['Space', 'En-space', 'Comma+space']);
                        topic_sep.minimumSize.width = 120;
                        topic_sep.selection = 1;
                        
                var csense = group2.add ('checkbox', undefined, 'Match topics case-sensitively');
                    csense.value = true;
                    
                var ranging = group2.add ('group');
                    var range = ranging.add ('checkbox', undefined, 'Range pages');
                        range.value = true;
                    
                    var ranging_sub = ranging.add ('group');
                        ranging_sub.add ('statictext', undefined, 'Use: ');
                        var range_dash = ranging_sub.add ('dropdownlist', undefined, ['Hyphen', 'En-dash']);
                            range_dash.minimumSize.width = 80;
                            range_dash.selection = 1;
                        
                        ranging_sub.add ('statictext', undefined, 'Tolerance:')
                        var tolerance = ranging_sub.add ('dropdownlist', undefined, ['0','1','2','3','4','5','6','7','8','9','10']);
                            tolerance.minimumSize.width = 50;
                            tolerance.selection = 0;
                            
				var section_markers = group2.add ('checkbox', undefined, 'Add section headings')
                var mark = group2.add ('checkbox', undefined, 'Mark topics without page references');
                            
            var group3 = group23.add ('group');
                group3.orientation = 'column';
                group3.margins = [40,0,0,0];
                group3.alignChildren = 'left';
                var includeLL = group3.add ('checkbox', undefined, 'Include locked layers');
                var includeHL = group3.add ('checkbox', undefined, 'Include hidden layers');
                var includeLS = group3.add ('checkbox', undefined, 'Include locked stories');
                var includeFN = group3.add ('checkbox', undefined, 'Include footnotes');
                
        var buttons = w.add ('group');
            buttons.alignment = 'right';
            var ok_button = buttons.add ('button', undefined, 'OK');
            var cancel_button = buttons.add ('button', undefined, 'Cancel');
    
    
    range.onClick = function () {ranging_sub.enabled = this.value}

		// Restore the selections from the previous run in the dialog -----------------------------------------------------
		if (history.selected_styles.length > 0) {
			previously_selected_styles (history.selected_styles.split ('£$'));
		}
		clude.children[history.include].value = true;
		topic_sep.selection =  topic_sep.find (history.topic_separator);
		csense.value = history.case_sensitive;
		range.value = history.range_pages;
		mark.value = history.mark;
		section_markers.value = history.section_markers;
		range_dash.selection = range_dash.find (history.dash);
		tolerance.selection = tolerance.find (history.tolerance);
		includeLL.value = history.incLL;
		includeHL.value = history.incHL;
		includeLS.value = history.incLS;
		includeFN.value = history.incFN;
		
		list2.selection = 0;
		// Set dependencies
		clude.enabled = list1.items.length > 0;
		ranging_sub.enabled = range.value;


		function previously_selected_styles (array) {
			for (var i = 0; i < array.length; i++) {
				if (list2.find (array[i]) != null) {
					list1.add ('item', array[i]);
					list2.remove (array[i])
				}
			}
		}
    
    // End restore settings --------------------------------------------------------------

		// enable/disable buttons depending on whether a list has any items
		add_.enabled = add_all.enabled = list2.items.length;
		remove_.enabled = remove_all.enabled = list1.items.length;

		add_.onClick = function () {if (list2.selection != null) move_item (list2.selection, list2, list1); clude.enabled = list1.items.length > 0};
		add_all.onClick = function () {move_all (list2, list1)};
		remove_.onClick = function () {if (list1.selection != null) move_item (list1.selection, list1, list2); clude.enabled = list1.items.length > 0};
		remove_all.onClick = function () {move_all (list1, list2); clude.enabled = false};
		load_styles.onClick = function () {load_pstyles ()};
		sort_styles.onClick = function () {sort_listbox (list2)};

		list1.onChange = function () {
			var sel = list1.selection;
			list2.selection = null;
			list1.selection = sel
		};

		list2.onChange = function () {
			var sel = list2.selection;
			list1.selection = null;
			list2.selection = sel
		};
    
		function load_pstyles () {
			list2.removeAll();
			for (var i = 0; i < parstyles.length; i++) {
				list2.add ('item', parstyles[i]);
			}
			list2.selection = 0;
		}
    
		function move_item (to_add, source, target) {
			// Record the index of the (first) selected item so that we can replace the cursor
			var sel = source.selection[0].index;
			for (var i = 0; i < to_add.length; i++) {
				target.add ('item', to_add[i].text);
			}
			for (var i = 0; i < to_add.length; i++) {
				source.remove (to_add[i].text);
			}
			sort_listbox (target);
			add_.enabled = add_all.enabled = list2.items.length;
			remove_.enabled = remove_all.enabled = list1.items.length;
			// Replace the cursor
			if (source.items.length) {
				if (sel >= source.items.length) {
					sel = source.items.length-1;
				}
				source.selection = sel;
			}
		}


		function move_all (source, target) {
			var to_sort = target.items.length > 0;
			for (var i = 0; i < source.items.length; i++) {
				target.add ('item', source.items[i].text);
			}
			source.removeAll ();
			if (to_sort == true) {
				sort_listbox (target);
			}
			add_.enabled = add_all.enabled = list2.items.length;
			remove_.enabled = remove_all.enabled = list1.items.length;
		}
    
		function sort_listbox (list_box) {
			var array = list_to_stringarray (list_box);
			array = array.sort (nocase);
			list_box.removeAll ();
			for (i = 0; i < array.length; i++) {
				list_box.add ('item', array[i]);
			}
		} 
    
    function nocase (a, b) {return a.toLowerCase() > b.toLowerCase()}
    
		function list_to_stringarray (list) {
			var list2 = [];
			for (var i = 0; i < list.items.length; i++) {
				list2.push (list.items[i].text);
			}
			return list2;
		}
    
		function tsep (s) {
			switch (s) {
				case 'Space': return ' ';
				case 'En-space': return '\u2002';
				case 'Comma+space': return ', ';
				default: return ' ';
			}
		}

		function psep (s) {
			switch (s) {
				case 'Hyphen': return '-';
				case 'En-dash': return '\u2013';
				default: return '\u2013';
			}
		}

//~ 	cancel_button.onClick = function () {w.close(); exit ()};
	
	if (w.show() == 1) {
		if (list1.items.length == 0)
			var sel_styles = '';
		else
			var sel_styles = '£$'+list_to_stringarray (list1).join ('£$')+'£$';
			var obj = {selected_styles: sel_styles,
				include: clude.children[0].value ? 0 : 1,
				case_sensitive: csense.value,
				topic_separator: topic_sep.selection.text,
				range_pages: range.value,
				section_markers: section_markers.value,
				mark: mark.value,
				dash: range_dash.selection.text,
				tolerance: tolerance.selection.text,
				incLL: includeLL.value,
				incHL: includeHL.value,
				incLS: includeLS.value,
				incFN: includeFN.value
			}
        write_history (history_file, obj);
        obj.topic_separator = tsep (obj.topic_separator);
        obj.dash = psep (obj.dash);
		w.close();
		return obj;
	}
	w.close();
	exit ();
} // index_independent


function read_history (f) {
	try {
		return $.evalFile (File(f));
	} catch (_) {
		return {
			selected_styles: [],
			include: 0,
			cs: true,
			topic_separator: 'En-space',
			range_pages: true,
			mark: true,
			dash: 'En-dash',
			tolerance: 0,
			section_markers: true,
			incLL: true,
			incHL: false,
			incLS: true,
			incFN: true
		};
	}
}


function write_history (f, obj) {
	f = File(f);
	f.open ('w');
	f.write (obj.toSource());
	f.close();
}


function script_dir () {
	try {
		return File (app.activeScript).path;
	} catch (e) {
		return File (e.fileName).path;
	}
}
