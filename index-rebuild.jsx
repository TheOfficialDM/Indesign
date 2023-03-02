/*-----------------------------------------------------------
Build an index from text markers.
Text markers must look like this (where # is an optional (sub)topic separator):

<ix>dog#collie#border collie</ix>dog

or this:

<ix>dog</ix>

That is, the markers either wrap the word to be indexed 
(as in the second example; set "wrapped", below, to "true")
or they don't, as in the first example (set "wrapped" to "false".

Peter Kahrel
-----------------------------------------------------------*/

#target indesign;

//============================================================

wrapped = false;

rebuild_index (app.activeDocument, wrapped);

//============================================================


function rebuild_index (doc, wrapped)
	{
	// "ip" is the insertion point index where page references 
	// are placed; see the try clause
	if (wrapped == true)
		var ip = 4;
	else
		var ip = -1;
	var markers = pagerefs (doc);
	if (markers.length > 0)
		{
		if (doc.indexes.length == 0)
			doc.indexes.add ();
		else
			doc.indexes[0].topics.everyItem().remove();
		var index = doc.indexes[0];
		mess = create_message (30, 'Building index...')
		for (var i = 0; i < markers.length; i++)
			{
			try
				{
				var new_topic = create_topic (index, markers[i].contents);
				new_topic.pageReferences.add (
					markers[i].insertionPoints[ip], 
					PageReferenceType.currentPage);
				}
			catch (_){}
			}
		if (wrapped == true)
			delete_marker (doc, '</?ix>');
		else
			delete_marker (doc, '<ix>.+?</ix>');
		}
	}


function pagerefs (doc)
	{
	app.findGrepPreferences = app.changeGrepPreferences = null;
	app.findChangeGrepOptions.includeFootnotes = true;
	app.findGrepPreferences.findWhat = '<ix>.+?</ix>';
	return doc.findGrep (true);
	}


// Create topic and any subtopics
function create_topic (doc_index, str)
	{
	var array = str.replace (/<\/?ix>/g, '').split ('#');
	mess.text = array[0];
	var new_top = doc_index.topics.add (array[0]);
	for (var k = 1; k < array.length; k++)
		new_top = new_top.topics.add (array[k]);
	return new_top
	}


function find_grep (doc, f)
	{
	app.findGrepPreferences = app.changeGrepPreferences = null;
	app.findGrepPreferences.findWhat = f;
	return doc.findGrep ()
	}

function delete_marker (doc, m)
	{
	app.findGrepPreferences = app.changeGrepPreferences = null;
	app.findGrepPreferences.findWhat = m;
	app.changeGrepPreferences.changeTo = '';
	doc.changeGrep ()
	}


function create_message (le, title)
	{
	dlg = new Window('palette', title);
	dlg.alignChildren = ['left', 'top'];
	txt = dlg.add('statictext', undefined, '');
	txt.characters = le;
	dlg.show();
	return txt
	}

