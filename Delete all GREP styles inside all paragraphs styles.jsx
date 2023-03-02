var scriptName = "Delete all GREP styles inside all paragraphs styles",
doc;

app.doScript(PreCheck, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, "\"" + scriptName + "\" script");

//===================================== FUNCTIONS ======================================
function Main() {
	var nestedGrepStyles,
	count = 0,
	parStyles = doc.allParagraphStyles;
	
	for (var i = parStyles.length - 1; i >= 0; i--) {
		nestedGrepStyles = parStyles[i].nestedGrepStyles;
		
		for (var j = nestedGrepStyles.length - 1; j >= 0; j--) {
			nestedGrepStyles[j].remove();
			count++;
		}
	}

	var report = count + " GREP style" + ((count == 1) ? " was" : "s were") + " deleted.";
	alert(report, scriptName);
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