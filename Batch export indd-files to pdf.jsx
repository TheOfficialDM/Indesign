// Script for InDesign CS3-5.
// July 22 2011
// Written by Kasyan Servetsky
// http://www.kasyan.ho.com.ua
// e-mail: askoldich@yahoo.com
//======================================================================================
var gScriptName = "Batch export INDD-files to PDF"; // Name of the script
var gScriptVersion = "1.0"; // Version

var gSet = GetSettings();
CreateDialog();

//===================================== FUNCTIONS  ======================================
function CreateDialog() {
	var pdfPresetsList =app.pdfExportPresets.everyItem().name;	
	var win = new Window("dialog", gScriptName + " - " + gScriptVersion);

	win.p = win.add("panel", undefined, "");
	win.p.alignChildren = "right";
	win.p.alignment = "fill";
	
	win.p.g = win.p.add("group");
	win.p.g.st = win.p.g.add("statictext", undefined, "PDF-presets:");
	win.p.g.ddl = win.p.g.add("dropdownlist", undefined, pdfPresetsList);
	win.p.g.ddl.selection = gSet.selectedPdfPresetIndex;
	win.p.g.ddl.preferredSize.width = 220;

	win.buttons = win.add("group");
	win.buttons.orientation = "row";   
	win.buttons.alignment = "center";
	win.buttons.ok = win.buttons.add("button", undefined, "OK", {name:"ok" });
	win.buttons.cancel = win.buttons.add("button", undefined, "Cancel", {name:"cancel"});

	var showDialog = win.show();

	if (showDialog == 1) {
		gSet.selectedPdfPresetIndex = win.p.g.ddl.selection.index;
		app.insertLabel("Kas_" + gScriptName + gScriptVersion, gSet.toSource());
		Main();
	}	
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function Main() {
	var folder = Folder.selectDialog("Select a folder with InDesign files to export");
	if (folder == null) exit();
	var files = GetFiles(folder);
	var pdfFolder = new Folder(folder.fsName + "/" + "Pdf");
	VerifyFolder(pdfFolder);

	if (files.length == 0) {
		alert("No files to open.", gScriptName + " - " + gScriptVersion);
		exit();
	}

	var pdfPresets =app.pdfExportPresets.everyItem().getElements();
	var selectedPdfPreset = pdfPresets[gSet.selectedPdfPresetIndex];
	var count = 1;
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;

	// Progress bar -----------------------------------------------------------------------------------
	var progressWin = new Window ("window", gScriptName + " - " + gScriptVersion);
	var progressBar = progressWin.add ("progressbar", [12, 12, 350, 24], 0, files.length);
	var progressTxt = progressWin.add("statictext", undefined, "Starting exporting files");
	progressTxt.bounds = [0, 0, 340, 20];
	progressTxt.alignment = "left";
	progressWin.show();
	// Progress bar -----------------------------------------------------------------------------------

	for (var i = 0; i < files.length; i++) {
		var currentFile = files[i];
		
		try {
			var doc = app.open(currentFile, false);
			var docName = doc.name;

			// Progress bar -----------------------------------------------------------------------------------
			progressBar.value = count;
			progressTxt.text = String("Exporting file - " + docName + " (" + count + " of " + files.length + ")");
			// Progress bar -----------------------------------------------------------------------------------

			var file = new File(pdfFolder + "/" + GetFileName(docName) + ".pdf");
			if (file.exists) {
				var increment = 1;
				while (file.exists) {
					file = new File(pdfFolder + "/" + GetFileName(docName) + "(" + increment++ + ").pdf");
				}
			}
		
			doc.exportFile(ExportFormat.pdfType, file, false, selectedPdfPreset);
			doc.close(SaveOptions.NO);
			count++;
		}
		catch(e) {}
	}

	// Progress bar -----------------------------------------------------------------------------------
	progressWin.close();
	// Progress bar -----------------------------------------------------------------------------------

	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALL;

	alert("Done.", gScriptName + " - " + gScriptVersion);
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function VerifyFolder(folder) {
	if (!folder.exists) {
		var folder = new Folder(folder.absoluteURI);
		var array1 = new Array();
		while (!folder.exists) {
			array1.push(folder);
			folder = new Folder(folder.path);
		}
		var array2 = new Array();
		while (array1.length > 0) {
			folder = array1.pop();
			if (folder.create()) {
				array2.push(folder);
			} else {
				while (array2.length > 0) {
					array2.pop.remove();
				}
				throw "Folder creation failed";
			} 
		}
	}
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function GetFiles(theFolder) {
	var files = [],
	fileList = theFolder.getFiles(),
	i, file;
	
	for (i = 0; i < fileList.length; i++) {
		file = fileList[i];
		if (file instanceof Folder) {
			files = files.concat(GetFiles(file));
		}
		else if (file instanceof File && file.name.match(/\.indd$/i)) {
			files.push(file);
		}
	}

	return files;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function GetFileName(fileName) {
	var string = "";
	var result = fileName.lastIndexOf(".");
	if (result == -1) {
		string = fileName;
	}
	else {
		string = fileName.substr(0, result);
	}
	return string;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function GetSettings() {
	var set = eval(app.extractLabel("Kas_" + gScriptName + gScriptVersion));
	if (set == undefined) {
		set = { selectedPdfPresetIndex : 0 };
	}

	return set;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------