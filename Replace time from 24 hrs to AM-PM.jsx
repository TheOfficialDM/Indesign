/* Copyright 2020, Kasyan Servetsky
April 11, 2020
Written by Kasyan Servetsky
http://www.kasyan.ho.ua
e-mail: askoldich@yahoo.com */
//======================================================================================
var scriptName = "Replace time from 24 hrs to AM-PM",
debugMode = false,
doc;

app.doScript(PreCheck, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.FAST_ENTIRE_SCRIPT, "\"" + scriptName + "\" Script");

//===================================== FUNCTIONS ======================================
function Main() {
	var foundItem, contents;
	app.findGrepPreferences = app.changeGrepPreferences = NothingEnum.NOTHING;
	app.findGrepPreferences.findWhat = "\\d{1,2}:\\d{2}";
	var foundItems = doc.findGrep();
	
	for (var i = 0; i < foundItems.length; i++) {
		foundItem = foundItems[i];
		contents = foundItem.contents;
		
		if (contents.match(/^\d{2}:/) == null) {
			contents = "0" + contents;
		}
	
		convertedTime = ConvertTime(contents);
		if (debugMode) $.writeln(contents + " > " +convertedTime);
		foundItem.contents = convertedTime;
	}
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function ConvertTime(time) {
	// Check correct time format and split into components
	time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

	if (time.length > 1) { // If time format correct
		time = time.slice (1);  // Remove full string match value
		time[5] = +time[0] < 12 ? "AM" : "PM"; // Set AM/PM
		time[0] = +time[0] % 12 || 12; // Adjust hours
	}

	return time.join (""); // return adjusted time or original string
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function PreCheck() {
	if (app.documents.length == 0) ErrorExit("Please open a document and try again.", true);
	doc = app.activeDocument;
	if (doc.converted) ErrorExit("The current document has been modified by being converted from older version of InDesign. Please save the document and try again.", true);
	if (!doc.saved) ErrorExit("The current document has not been saved since it was created. Please save the document and try again.", true);
	Main();
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function ErrorExit(error, icon) {
	alert(error, scriptName, icon);
	exit();
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------