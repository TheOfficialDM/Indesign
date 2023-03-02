// Global variables are defined here
var scriptName = "Import paragraph styles",
doc,
debugMode = false, // for debugging only
args = [],
calledFromBatchProcessor = (CalledFromBatchProcessor()) ? true : false;

if (calledFromBatchProcessor) { //  // called as a 'secondary' script from the batch processor
	if (typeof arguments != "undefined") {
		args = NormalizeArgs(arguments);
	}
	doc = app.activeDocument;
	Main();
}
else { // called as a 'regular' script
	PreCheck();
}

//===================================== FUNCTIONS =======================================
function Main() {
	try {
		var masterFile;
		
		if (args.length == 0 || // check if we have at least one valid argument
			typeof args[0] === "undefined" ||
			args[0] === null ||
			args[0] === "") // empty string
		{
			masterFilePath = "~/Documents/MyMaster.indd"; // set a default value
		}
		else {
			masterFilePath = args[0];
		}
		
		masterFile = new File(masterFilePath);
		
		if (masterFile.exists) {
			if (doc.converted) {

				var newPath = doc.filePath + "/" + doc.name;
				doc = doc.save(new File(newPath));
				if (calledFromBatchProcessor) g.WriteToFile("Converted from the previous version.");
				if (debugMode) $.writeln(doc.name + " - Converted from the previous version.");
			}
			doc.importStyles(ImportFormat.PARAGRAPH_STYLES_FORMAT, masterFile, GlobalClashResolutionStrategy.LOAD_ALL_WITH_OVERWRITE);
		}
		else {
			if (calledFromBatchProcessor) g.WriteToFile("ERROR: " + "master file doesn't exist -- " + masterFilePath);
		}
	}
	catch(err) { // if an error occurs, catch it and write the  document's name, error message and line# where it happened into the log
		if (calledFromBatchProcessor) g.WriteToFile("ERROR: " + doc.name + " - " + err.message + ", Line: " + err.line + ", Time: " + GetTime());
		if (debugMode) $.writeln(err.message + ", line: " + err.line); // in debugMode -- write the error message and line# to ESTK console
	}
}
//=======================================================================================
function GetTime() { // get exact time for the log -- hr : min : sec -- so we could know when exactly an error occured
	var date = new Date();
	var dateString = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
	return dateString;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function CalledFromBatchProcessor() { // Let's see if it's called as a 'secondary' (returns true) or as a 'regular' (returns false) script
	var result = false;
	
	try {
		var arr = $.stack.split(/[\n]/);
		if (arr.length > 0 && arr[0].match(/\[Batch processor/i) != null) {
			result = true;
		}
	}
	catch(err) {}

	return result;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function NormalizeArgs(args) { // convert a string value read from the arguments file to actual boolen data type (or undefined)
	for (var i = 0; i < args.length; i++) {
		if (args[i] == "true" || args[i] == "false" || args[i] == "undefined" || args[i] == "null") {
			args[i] = eval(args[i]);
		}
	}

	return args;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function PreCheck() {
	if (app.documents.length == 0) ErrorExit("Please open a document and try again.", true);
	doc = app.activeDocument;
	Main();
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function ErrorExit(error, icon) { // Something went totally wrong.
	alert(error, scriptName, icon); // Give a warning
	exit(); // and stop the script
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------