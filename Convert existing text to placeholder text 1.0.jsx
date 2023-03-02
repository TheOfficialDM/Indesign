/* Copyright 2018, Kasyan Servetsky
March 8, 2018
Written by Kasyan Servetsky
http://www.kasyan.ho.com.ua
e-mail: askoldich@yahoo.com */
//======================================================================================
var scriptName = "Convert existing text to placeholder text - 1.0",
doc, set;

app.doScript(PreCheck, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, "\"" + scriptName + "\" script");

//===================================== FUNCTIONS ======================================
function CreateDialog() {
	GetDialogSettings();
	var w = new Window("dialog", scriptName);
	
	w.p = w.add("panel", undefined, "Settings:");
	w.p.orientation = "column";
	w.p.alignment = "fill";
	w.p.alignChildren = "left";
	
	w.p.g = w.p.add("group");
	w.p.g.orientation = "row";
	w.p.g.st = w.p.g.add("statictext", undefined, "Placeholder text language:");
	w.p.g.ddl = w.p.g.add("dropdownlist", undefined, ["Default", "Cyrillic", "Greek", "Arabic", "Hebrew"]);
	w.p.g.ddl.selection = set.language;
	w.p.g.ddl.alignment = "fill";
	
	w.p.cb = w.p.add("checkbox", undefined, "Skip text frames on master pages");
	w.p.cb.value = set.skipMasters;

	w.p.sl = w.p.add("panel", undefined, ""); // separator line
	w.p.sl.alignment = "fill";

	w.p.rb = w.p.add("radiobutton", undefined, "Keep the same number of characters");
	w.p.rb.onClick = function() {
		set.keepCharsNumber = true;
	}

	w.p.rb1 = w.p.add("radiobutton", undefined, "Fill all available area");
	w.p.rb1.onClick = function() {
		set.keepCharsNumber = false;
	}

	if (set.keepCharsNumber) {
		w.p.rb.value = true;
	}
	else {
		w.p.rb1.value = true;
	}

	// Buttons
	w.bts = w.add("group");
	w.bts.orientation = "row";   
	w.bts.alignment = "center";
	w.bts.ok = w.bts.add("button", undefined, "OK", {name:"ok"});
	w.bts.cancel = w.bts.add("button", undefined, "Cancel", {name:"cancel"});
	
	var showDialog = w.show();
	
	if (showDialog == 1) {
		set.language = w.p.g.ddl.selection.index;
		set.skipMasters = w.p.cb.value;
		
		app.insertLabel("Kas_" + scriptName, set.toSource());
		ConvertTextToLoremIpsum();
	}	
}	
	
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function GetDialogSettings() {
	set = eval(app.extractLabel("Kas_" + scriptName));
	if (set == undefined) {
		set = {language: 0, skipMasters: false, keepCharsNumber: true};
	}

	return set;
}	
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function ConvertTextToLoremIpsum() {
	try {
		var story, charsLength, firstTextFrame, extraText, language,
		doc = app.activeDocument,
		stories = doc.stories;
		
		switch (set.language) {
			case 0:
				language = "";
				break;			
			case 1:
				language = "_CYRILLIC";
				break;
			case 2:
				language = "_GREEK";
				break;
			case 3:
				language = "_ARABIC";
				break;
			case 4:
				language = "_HEBREW";
				break;
			default:
				language = "";
		}
		
		for (var i = 0; i < stories.length; i++) {
			story = stories[i];
			
			if (set.keepCharsNumber && story.contents == "") continue;
				charsLength = story.characters.length;
				firstTextFrame = story.textContainers[0];
				if (set.skipMasters && firstTextFrame.parent.constructor.name == "MasterSpread") continue;
				if (story.contents != "") story.texts[0].remove();
				firstTextFrame.contents = TextFrameContents["PLACEHOLDER_TEXT" + language];
				
				if (set.keepCharsNumber && firstTextFrame.constructor.name != "TextPath") {
					extraText = story.characters.itemByRange(charsLength, story.characters.length - 1);
					if (extraText.isValid) extraText.remove();
				}
		}
		
		alert("Finished.", scriptName);
	}
	catch(err) {
		//$.writeln(err.message + ", line: " + err.line);
	}
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function PreCheck() {
	if (app.documents.length == 0) ErrorExit("Please open a document and try again.", true);
	doc = app.activeDocument;
	if (doc.converted) ErrorExit("The current document has been modified by being converted from older version of InDesign. Please save the document and try again.", true);
	if (!doc.saved) ErrorExit("The current document has not been saved since it was created. Please save the document and try again.", true);
	CreateDialog();
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function ErrorExit(error, icon) {
	alert(error, scriptName, icon);
	exit();
}