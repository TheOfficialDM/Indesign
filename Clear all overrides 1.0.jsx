// Clear all overrides
// Clears all types of override
// Copyright 2011 L'Express de Toronto Inc.
// Version 1.0
// March 14, 2011
// Written by Kasyan Servetsky
// http://www.kasyan.ho.com.ua
// e-mail: askoldich@yahoo.com
//==================================================================
if (app.documents.length == 0) ErrorExit("Please open a document and try again.");
// globals
var txt;
var gScriptName = "Clear all overrides";
var gScriptVersion = "1.0";
var doc = app.activeDocument;
var sel = doc.selection[0];

if (doc.selection.length != 1) ErrorExit("One text frame or some text should be selected, or the cursor should be inserted into the text.");

if (sel.constructor.name == "TextFrame") { // a text frame is selected
	sel.texts[0].clearOverrides(OverrideType.ALL);
}
else if (sel.constructor.name == "Character" || // some text is selected 
	sel.constructor.name == "Word" ||
	sel.constructor.name == "TextStyleRange" ||
	sel.constructor.name == "Line" ||
	sel.constructor.name == "Paragraph" ||
	sel.constructor.name == "TextColumn" ||
	sel.constructor.name == "Text")
	{
		sel.clearOverrides(OverrideType.ALL);
	}
else {
	ErrorExit("One text frame or some text should be selected.");
}

//===================================== FUNCTIONS  ======================================
function ErrorExit(error, icon) {
	alert(error, gScriptName + " - " + gScriptVersion, icon);
	exit();
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------