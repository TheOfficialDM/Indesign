
// Change case interactively. Find/change options should be set in InDesign's Find/Change window.

// Peter Kahrel

#targetengine "change_case";

create_palette().show();

function create_palette ()
	{
	var w = Window.find ("palette", "Change case");
	if (w === null)
		return create_palette_sub ();
	return w;
	}


function create_palette_sub ()
	{
	var changetype;
	var w = new Window ("palette", "Change case", undefined, {resizeable: true});
		w.alignChildren = "fill";
		var options = [ChangecaseMode.lowercase, ChangecaseMode.uppercase];
		var rb = w.add ("panel");
			var upper_to_lower = rb.add ("radiobutton", undefined, "A > a");
			var lower_to_upper = rb.add ("radiobutton", undefined, "a > A");
		var smallcaps = w.add ("checkbox", undefined, " Apply SC");
		var b = w.add ("group {orientation: 'column', alignChildren: 'fill'}");
		
		var find = b.add ("button", undefined, "Find");
		
			var change = b.add ("button", undefined, "Change");
			var change_all = b.add ("button", undefined, "Change all");
			var change_find = b.add ("button", undefined, "Change/find");


		if (app.findGrepPreferences.findWhat.indexOf ("\\u") > -1)
			{
			upper_to_lower.value = true;
			changetype = ChangecaseMode.lowercase;
			}
		else
			{
			lower_to_upper.value = true;
			changetype = ChangecaseMode.uppercase;
			}

		upper_to_lower.onClick = function () {changetype = ChangecaseMode.lowercase};
		lower_to_upper.onClick = function () {changetype = ChangecaseMode.uppercase};

		var found, found_counter;

		find.onClick = function () {
			if (this.text === 'Find') {
				found = app.documents[0].findGrep();
				if (found.length > 0){
					found_counter = 0;
					find.text = 'Find next';
					show_found (found[found_counter]);
				} else {
					alert ("No (more) matches found.");
				}
			} else {
				found_counter++;
				if (found_counter < found.length){
					show_found (found[found_counter]);
				} else {
					find.text = 'Find';
					alert ("No (more) matches found.");
				}
			}
		}


		change.onClick = function () {
			found[found_counter].changecase(changetype);
			if (smallcaps.value == true) {
				found[found_counter].capitalization = Capitalization.smallCaps;
			}
		}
		
		change_find.onClick = function (){
			if (found_counter < found.length){
				found[found_counter].changecase(changetype);
				if (smallcaps.value == true) {
					found[found_counter].capitalization = Capitalization.smallCaps;
				}
				found_counter++;
				if (found_counter < found.length){
					show_found (found[found_counter]);
				} else {
					alert ("No (more) matches found.");
				}
			}
		}
		
		change_all.onClick = function () {
			for (var i = found_counter; i < found.length; i++) {
				found[i].changecase(changetype);
				if (smallcaps.value == true) {
					found[i].capitalization = Capitalization.smallCaps;
				}
			}
		}
		
		w.onDeactivate = w.onActivate = function () {find.text = 'Find'}
		
	return w;
	
	} // create_palette_sub



function show_found (f)
	{
	if (f.parentTextFrames.length === 0)  // If in overset text
		{
		app.activeWindow.activePage = find_page(f.parentStory.textContainers[0].endTextFrame);
		}
	else
		{
		f.select();
		app.activeWindow.activePage = find_page (f.parentTextFrames[0]);
		}
	}


function find_page(o)
	{
	if (o.hasOwnProperty ("parentPage"))  // CS5 and later
		return o.parentPage;
	else
		return find_page_classic(o)
	}


function find_page_classic (o)
	{
	try
		{
		if (o.constructor.name == "Page")
			return o;
		switch (o.parent.constructor.name)
			{
			case "Character": return find_page_classic (o.parent);
			case "Cell": return find_page_classic (o.parent.texts[0].parentTextFrames[0]);
			case "Table" : return find_page_classic (o.parent);
			case "TextFrame" : return find_page_classic (o.parent);
			case "Group" : return find_page_classic (o.parent);
			case "Story": return find_page_classic (o.parentTextFrames[0]);
			case "Footnote": return find_page_classic (o.parent.storyOffset);
			case "Page" : return o.parent;
			}
		}
		catch (_) {return ""}
	}
