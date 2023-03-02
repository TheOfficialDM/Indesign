var scriptName = "Set object export options",
doc, obj,
debugMode = true;

PreCheck();

//===================================== FUNCTIONS ======================================
function Main() {
	try {
		var objectExportOptions = obj.objectExportOptions;
		
		with (objectExportOptions) {
			preserveAppearanceFromLayout = PreserveAppearanceFromLayoutEnum.PRESERVE_APPEARANCE_RASTERIZE_CONTAINER;
			imageConversionType = ImageFormat.PNG;
			imageExportResolution = ImageResolution.PPI_150;
		}
	}
	catch(err) {
		//$.writeln(err.message + ", line: " + err.line);
		ErrorExit(err.message + ", line: " + err.line);
	}
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function PreCheck() {
	if (app.documents.length == 0) ErrorExit("Please open a document and try again.", true);
	doc = app.activeDocument;
	if (doc.converted) ErrorExit("The current document has been modified by being converted from older version of InDesign. Please save the document and try again.", true);
	if (!doc.saved) ErrorExit("The current document has not been saved since it was created. Please save the document and try again.", true);
	
	if (app.selection.length == 0) {
		ErrorExit("Nothing is selected.", true);
	}
	else if (app.selection.length == 1 && app.selection[0].hasOwnProperty("baseline")) {
		ErrorExit("Some text is selected.", true);
	}
	else if (app.selection.length == 1) {
		if (debugMode) $.writeln(app.selection[0].constructor.name);

		if (app.selection[0].constructor.name == "Group" || app.selection[0].constructor.name == "TextFrame") {
			obj = app.selection[0];
			Main();			
		}
		else if (app.selection[0].constructor.name == "Table") {
			obj = app.selection[0].parent;
			Main();
		}
		else if (app.selection[0].constructor.name == "Cell") {
			obj = app.selection[0].parent.parent;
			Main();
		}	
	}
	else if (app.selection.length > 1) {
		var group = MakeGroup(app.selection);
		
		if (group != null) {
			obj = group;
			Main();
		}
	}
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function MakeGroup(items) {
	var group = null;
	
	try {
		group = doc.groups.add(items);
	}
	catch(err) {
		//$.writeln(err.message + ", line: " + err.line);
		ErrorExit(err.message + ", line: " + err.line);
	}

	return group;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function ErrorExit(error, icon) {
	alert(error, scriptName, icon);
	exit();
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------