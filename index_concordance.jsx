#targetengine concordance;

// Global constants ===========================================================

	/*
	At "ok_stylenames", list the names of the paragraph styles
	that should be considered. Enter just the first three characters
	of the name preceded by a pipe (|). Case-sensitive. 
	To include all paragraph styles, use "".
	*/

//~ ok_stylenames = "|def|sec|not";
ok_stylenames = "";

//=============================================================================

// The parameter is the name of the text file with the previous dialog settings.
// It lives in the script directory.

concordance ("previous_context_search.txt");

/*
	'context' (which we get from the interface) returns a five-element object:
	context.find: word or phrase to find
	context.before: number of words before before search word
	context.after: number of words after search word
	context.case_sensitive: boolean
	context.active_doc: boolean (do active doc. only, or all open docs)
	footnotes: whether to include footnotes (bool)				
*/

function concordance (previous_search)
	{
	var context = get_context (previous_search);
	var restoreSettings = findChangeSettings ();
	mess___ = create_mess (30);
	var find_expression = build_expression (context);
	var list = find_in_context (find_expression, context);
	mess___.text = 'Sorting and tidying up...';
	// Sort the list by page number
	list = sort_and_tidy (list);
	if (list != "")
		{
		mess___.text = 'Placing list...';
		// Create new document and place the list
		flow (list);
		// Emphasise the concordance word
		emphasise (context.find);
		}
	else
		errorM ('Nothing to do.', " ");
	mess___.parent.close ();
	restoreSettings();
	}

//----------------------------------------------------------

/* Build a GREP expression. A string like this is produced
	(looking for 'discourse' with 5 words before and after):

	Thanks to Jaroslav Průka for some improvements here
	(\s[^\s]+){0,5}[\s[:punct:]]+discourse\w*[[:punct:]]?(\s[^\s]+){0,5}
	We define 'word' as any sequence of characters between two \s
*/


function build_expression (context)
	{
	return context.case_sensitive + 
			'(\\s[^\\s]+){0,' + context.before + '}' +
			'[\\s[:punct:]]+' +
			context.find +
			"[-'\\w]*[[:punct:]]?" +
			'(\\s[^\\s]+){0,' + context.after + '}'
	}


function find_in_context (grep, context)
	{
	mess___.text = 'Collecting words in context...';
	app.findGrepPreferences = null;
	app.findChangeGrepOptions.includeMasterPages = false;
	app.findChangeGrepOptions.includeFootnotes = context.footnotes;
	app.findGrepPreferences.findWhat = grep;
	if (context.active_doc == true)
		var f = app.activeDocument.findGrep ();
	else
		var f = app.findGrep();
	if (f.length > 0)
		{
		mess___.text = 'Building list...';
		return make_arrays (f, context.find, context.case_sensitive);
		}
	else
		errorM ('Nothing to show.');
	}


// insert page number if necessary

function make_arrays (collection, word, cs)
	{
	var re = /^[ivxl]+$/i
	var roman = [];
	var arabic = [];
	var n = 0;
	var s, page, target_word;
	app.findGrepPreferences.findWhat = cs + word;
	for (var i = 0; i < collection.length; i++)
		{
		// We found the target word and the preceding and following words.
		// Now we need the target word itself to get the page number
		// (target word and first word of found string are not necessarily
		// on the same page)
		target_word = collection[i].findGrep()[0];
		if (style_ok (target_word))
			{
			try
				{
				page = find_page (target_word);
				if (page !== null)
					{
					s = clean (collection[i]);
					if (re.test (page.name))
						{
						roman.push ({sortKey: page.documentOffset, item: page.name + ' ' + s})
						} 
					else
						arabic.push ({sortKey: page.name, item: page.name + ' ' + s});
					}
				}
			catch (_) {}
			}
		}
	return {roman: roman, arabic: arabic}
	}


function style_ok (w)
	{
	return ((ok_stylenames == "") || 
				(ok_stylenames.search (w.appliedParagraphStyle.name.slice (0,3)) > 0))
	}


// Replace par. break with ||, tab with space 
function clean (o)
{
	// replace par. breaks with ||
	var s = o.contents.replace (/\r/g, ' || ');
	// replace tab with space
	s = s.replace (/\t/g, ' ');
	// delete spurious spaces
	s = s.replace (/  +/g, ' ');
	return s
}



function find_page (o)
{
	if (parseInt (app.version) > 6) {
		return o.parentTextFrames[0].parentPage;
	}
	return find_page_sub (o);
}


function find_page_sub (o)
{
 try
	{
		if (o.constructor.name == "Page"){
			return o;
		}
	  switch (o.parent.constructor.name)
		 {
		 case "Character": return find_page_sub (o.parent);
		 case "Cell": return find_page_sub (o.parent.texts[0].parentTextFrames[0]);
		 case "Table" : return find_page_sub (o.parent);
		 case "TextFrame" : return find_page_sub (o.parent);
		 case "Group" : return find_page_sub (o.parent);
		 case "Story": return find_page_sub (o.parentTextFrames[0]);
		 case "Footnote": return find_page_sub (o.parent.storyOffset);
		 case "Page" : return o.parent;
		 }
	  }
   catch (_) {return null}
}


function emphasise (w)
	{
	mess___.text = 'Emphasising ' + w + '...';
	var cs = app.activeDocument.characterStyles.add ({name:'bold_concordance', fontStyle:'Bold'})
	app.findGrepPreferences = app.changeGrepPreferences = null;
	app.findGrepPreferences.findWhat = '(?i)' + w;
	app.changeGrepPreferences.appliedCharacterStyle = cs;
	app.activeDocument.changeGrep();
	}


function flow (inp)
	{
	var doc = app.documents.add();
	doc.viewPreferences.rulerOrigin = RulerOrigin.pageOrigin;
	var marg = doc.pages[0].marginPreferences;
	var gb = [marg.top, marg.left, 
		app.documentPreferences.pageHeight - marg.bottom, 
		app.documentPreferences.pageWidth - marg.right];
	doc.textFrames.add ({geometricBounds: gb, contents: inp});
	while (doc.pages[-1].textFrames[0].overflows)
		{
		doc.pages.add().textFrames.add ({geometricBounds: gb});
		doc.pages[-1].textFrames[0].previousTextFrame = 
			doc.pages[-2].textFrames[0];
		}
	}


// sort and delete empty lines
function sort_and_tidy (arrays)
	{
//	var s = array.join ('\r');
//	s = s.replace (/\r\r+/g, '\r');
//	s = s.replace (/\r$/, "");
//	array = s.split ('\r');

	var temp = [];
	var roman = arrays.roman.sort (function (a, b) {return a.sortKey - b.sortKey});
	var arabic = arrays.arabic.sort (function (a, b) {return a.sortKey - b.sortKey});
	
	for (var i = 0; i < roman.length; i++) {
		temp.push (roman[i].item);
	}

	for (i = 0; i < arabic.length; i++) {
		temp.push (arabic[i].item);
	}
	
	return temp.join ('\r');
	}


function create_mess (le)
	{
	dlg___ = new Window ('palette');
	dlg___.alignChildren = ['left', 'top'];
	var txt = dlg___.add ('statictext', undefined, '');
	txt.characters = le;
	dlg___.show();
	return txt
	}


function errorM (m, title)
	{
	if (title == undefined) title = " ";
	alert (m, title);
	mess___.parent.close ();
	exit();
	}


function findChangeSettings ()
{
	var f_prefs = app.findGrepPreferences.properties;
	var c_prefs = app.changeGrepPreferences.properties;
	var options = app.findChangeGrepOptions.properties;
	return function () {
		app.findGrepPreferences.properties = f_prefs;
		app.changeGrepPreferences.properties = c_prefs;
		app.findChangeGrepOptions.properties = options;
	}
}


// Interface ==================================================================

function get_context (previous_search)
	{
	var w = new Window ('dialog', 'Concordance', undefined, {closeButton: false});
	var panel = w.add ('panel');
	panel.alignChildren = ['left', 'top'];
	var g1 = panel.add ('group');
		g1.orientation = 'row';
		g1.add ('statictext', undefined, 'Search:');
		var to_search = g1.add ('edittext');
	var g2 = panel.add ('group');
		g2.add ('statictext', undefined, 'Words before:');
		var before = g2.add ('edittext'); before.characters = 3;
		g2.add ('statictext', undefined, 'Words after:');
		var after = g2.add ('edittext'); after.characters = 3
	var g3 = panel.add ('group')
		var case_sens = g3.add ('checkbox', undefined, 'Case sensitive');
		var act_doc = g3.add ('checkbox', undefined, 'Active document only');
		var footnotes = g3.add ('checkbox', undefined, 'Include footnotes');
	var button_group = w.add ('group');
		button_group.orientation = 'row';
		button_group.alignment = 'right';
		//okButton = button_group.add('button', undefined, 'OK');
		button_group.add ('button', undefined, 'OK');
		button_group.add ('button', undefined, 'Cancel');

	var previous = get_previous (previous_search);
	to_search.characters = 50;
	if (app.selection.length > 0 && app.selection[0].characters.length > 0)
		to_search.text = app.selection[0].contents;
	else
		to_search.text = previous.find;
	w.layout.layout();
	to_search.active = true;
	
	before.text = previous.before;		//presets
	after.text = previous.after;
	case_sens.value = previous.case_sensitive == "";
	// Next line in a try/catch for backward compatibility
	try {footnotes.value = previous.footnotes} catch (_){};
	if (app.documents.length == 1)
		act_doc.enabled = false;
	else
		act_doc.value = true;

	// If 'before' changes, change after to the same value
	before.onChange = function() {after.text = before.text}
	
	if( w.show() == 2 )
		exit();
	else
		{
		var obj = {find: to_search.text,
					before: before.text,
					after: after.text,
					case_sensitive: case_sens.value == false ? '(?i)' : "",
					footnotes: footnotes.value,
					active_doc: act_doc.value
				}
		write_previous (previous_search, obj);
		return obj
		}
	}



function get_previous (previous_search)
	{
	var f = File (script_dir() + previous_search);
	if (f.exists)
		{
		f.open ('r');
		f.encoding = 'utf-8';
		var temp = f.read();
		f.close()
		}
	else
		temp = '({find:"", before:5, after:5, footnotes: false})';
	return eval (temp)
	}


function write_previous (previous_search, o)
	{
	var f = File (script_dir() + previous_search);
	f.open ('w');
	f.encoding = 'utf-8';
	f.write (o.toSource());
	f.close ()
	}


function script_dir()
	{
	try {return File (app.activeScript).path+'/'}
	catch (e) {return File (e.fileName).path+'/'}
	}
