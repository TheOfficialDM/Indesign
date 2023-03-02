/* Copyright 2022, Kasyan Servetsky
August 16, 2022
Written by Kasyan Servetsky
http://www.kasyan.ho.ua
e-mail: askoldich@yahoo.com */
//======================================================================================
var g = {   scriptName: "Batch processor - 4.8",
				appVersionNum: Number(String(app.version).split(".")[0]),
				win: (File.fs == "Windows") ? true : false,
				debugMode: false,
				count: 0, // counter of processed documents
				doc: null,
				docsFolder: null,
				scriptFile: null,
				scriptFiles: null,
				scriptFolder: null,
				argumentsFile: null,
				arguments: [],
				openDocsList: [],
				winScriptExt: /\.vbs|jsx*(bin)*$/i // in Windows match jsx, js, jsxbin and vbs files
			};
//===================================== FUNCTIONS  ======================================
g.Main = function() {
	var inddFiles,
	startTime = new Date();
	
	g.GetArguments();

	for (var d = 0; d < app.documents.length; d++) { // get the list of open documents
		if (g.appVersionNum >= 7) { // the most reliable way to identify documents
			g.openDocsList.push(app.documents[d].id); // id is better in case a document hasn't been saved yet
		}
	}

	if (g.set.log && g.set.rbScript == 0) { // log -- one script
		g.WriteToFile("=========================================================\rDate & time: " + g.GetDate() + "\rRunning script: " + g.scriptFile.displayName);
	}
	else if (g.set.log && g.set.rbScript == 1) { // log -- a few scripts
		g.WriteToFile("=========================================================\rDate & time: " + g.GetDate() + "\rRunning scripts:");
		for (var i = 0; i < g.scriptFiles.length; i++) {
			g.WriteToFile(g.scriptFiles[i].displayName);
		}
	}

	if (g.set.rbScope == 0 || g.set.rbScope == 1) {
		if (g.set.rbScope == 0) { // active document
			g.doc = app.activeDocument;
			g.ProcessDocument();
		}
		else if (g.set.rbScope == 1) { // all open documents
			for (var d = 0; d < app.documents.length; d++) {
				g.doc = app.documents[d];
				g.ProcessDocument();
			}
		}
	}
	else if (g.set.rbScope == 2) { // active book
		inddFiles = g.GetFilesFromBook();
		if (inddFiles.length == 0) g.ErrorExit("Found no InDesign documents in the active book.", true);
		g.ProcessAllInddDocs(inddFiles);
	}
	else if (g.set.rbScope == 3 || g.set.rbScope == 4) {// folder, or folder with all subfolders
		inddFiles = g.GetAllInddFiles(g.docsFolder);
	
		if (inddFiles.length == 0) g.ErrorExit("Found no InDesign documents in the selected folder.", true);
		g.ProcessAllInddDocs(inddFiles);
	}
	
	var endTime = new Date();
	var duration = g.GetDuration(startTime, endTime);
	
	var report = g.count + ((g.count == 1) ? " document was" : " documents were") + " processed.\rTime elapsed: " + duration + ". ";

	if (g.set.log) {
		g.WriteToFile("\r=========================================================\r\r");
	}
	
	alert("Finished. " + report, g.scriptName);
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
g.GetArguments = function() {
	var str, splitChar;

	if (g.set.argsSeparatorSelectedIdx == 0) { // custom
		splitChar = g.set.argsSeparator; // use \n -- not \r in the dialog box
		if (splitChar.match(/\\/) != null) {
			splitChar = eval("\"" + g.set.argsSeparator +"\"");
		}
	}
	else if (g.set.argsSeparatorSelectedIdx == 1) { // line feed
		splitChar = "\n";
	}
	else if (g.set.argsSeparatorSelectedIdx == 2) { // comma
		splitChar = ",";
	}
	else if (g.set.argsSeparatorSelectedIdx == 3) { // semicolon
		splitChar = ";";
	}
	else if (g.set.argsSeparatorSelectedIdx == 4) { // pile
		splitChar = "|";
	}
	
	if (g.set.useArguments && g.argumentsFile != null) {
		var txt = g.ReadTxtFile(g.argumentsFile);
		var arr = txt.split(splitChar);

		if (arr.length > 0) {
			for (var i = 0; i < arr.length; i++) {
				str = arr[i];

				if (g.set.ignoreComments) {
					str = str.replace(/\/{2}.+$/, ""); // remove comments -- //					
					str = str.replace(/\/\*.+\*\//, ""); // remove comments -- /* */
				}

				str = str.replace(/^"/, "").replace(/"$/, ""); // remove quotes -- " "
				str = g.Trim(str); // remove whitespace from both sides of a string
				g.arguments.push(str);
			}
		}
	}
	else {
		g.arguments = undefined; // if checkbox is off, or no file selected -- don't send arguments
	}
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
g.ProcessAllInddDocs = function(inddFiles) {
	var inddFile;
	
	if (g.set.log) {
		if (g.set.rbScope == 2) g.WriteToFile("Book name: " + app.activeBook.name); // log 'Active Book' name
	}

	var progressWin = g.CreateProgressBar();
	progressWin.show();
	progressWin.pb.minvalue = 0;
	progressWin.pb.maxvalue = inddFiles.length;
	
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;	
	
	for (var i = 0; i < inddFiles.length; i++) {
		try {
			inddFile = inddFiles[i];
			progressWin.pb.value = (i + 1);
			progressWin.st.text = "Processing file - " + inddFile.displayName;

			if ((g.set.docType == 1 || g.set.docType == 2) && inddFile.name.match(/\.indt$/i) != null) {
				g.doc = app.open(inddFile, !g.set.invisibleMode, OpenOptions.OPEN_ORIGINAL);
			}
			else {
				g.doc = app.open(inddFile, !g.set.invisibleMode);
			}
			
			g.ProcessDocument();
			
			if (g.set.saveOnClosing) { // save on closing
				if (g.set.rbScope == 2 || g.set.rbScope == 3 || g.set.rbScope == 4) {
					if (g.appVersionNum >= 7 && g.GetArrayIndex(g.openDocsList, g.doc.id) == -1) { // if it wasn't open before running the script, save & close
						g.doc.close(SaveOptions.YES);
					}
					else if (g.appVersionNum < 7) { // CS4 and below: just save and close without checking it was open originally
						g.doc.close(SaveOptions.YES);
					}
					else { // otherwise save and don't close
						g.doc.save();
					}
				}
			}		
			else { // don't save on closing
				if (g.set.rbScope == 2 || g.set.rbScope == 3 || g.set.rbScope == 4) {
					if (g.appVersionNum >= 7 && g.GetArrayIndex(g.openDocsList, g.doc.id) == -1) { // CS5 and above: if it wasn’t open before running the script, close without saving
						g.doc.close(SaveOptions.NO);
					} 
					else if (g.doc.saved) { // CS4 and below: just to be on a safe side: make sure not to close a newly created (before running the script) and unsaved document
						g.doc.close(SaveOptions.NO); // just don't save and close without checking it was open originally
					}
				}
			}
		}  
		catch(err) {
			if (g.debugMode) $.writeln(err.message + ", line: " + err.line);
			if (err.message == "open") {
				g.WriteToFile("ERROR: Can't open the document; maybe damaged or was saved in a newer version. -- " + inddFile.displayName);
			}
			else {
				g.WriteToFile("ERROR: something went wrong. -- " + err.message + ", line: " + err.line + " -- " + inddFile.displayName);
			}
			// Don't turn on user interaction here, otherwise multiple warnings pop up
		}
	} // end For

	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALL;
			
	progressWin.close();
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
g.ProcessDocument = function() { // Make backup and trigger script(s)
	if (g.doc.name.match(/^Backup/) != null) return; // Skip backups	
	if (g.set.log) g.WriteToFile("---------------------------------------------------------\rDocument name: " + g.doc.name + "\rDocument path: " + File(g.doc.filePath).fsName);
	
	if (g.set.saveOnClosing && g.set.backUp) { // Create a backup copy
		var oldDocPath = g.doc.filePath.absoluteURI;
		var oldDocFile = new File(oldDocPath + "/" + g.doc.name);
		var newDocFile = new File(oldDocPath + "/Backup_" + g.doc.name);
		
		if (newDocFile.exists) { // Don't overwrite existing files
			var increment = 1;
			while (newDocFile.exists) {
				newDocFile = new File(oldDocPath + "/Backup" + "(" + increment++ + ")_" + g.doc.name);
			}
		}
		
		if (oldDocFile.exists) {
			oldDocFile.copy(newDocFile.absoluteURI);
		}
		else { // It’s hardly possible this ever happens: just a precaution.
			g.WriteToFile("ERROR: something went wrong. Can't get the reference to the converted document - " + g.doc.name);
		}
	}

	g.count++;
	g.RunScripts();
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
g.RunScripts = function() {
	try {
		var scriptLanguage, scriptFile;

		if (g.set.rbScript == 0) { // single script
			scriptLanguage = g.GetScriptLanguage(g.scriptFile);
			
			if (g.appVersionNum >= 6) { // Version CS4 and above
				app.doScript(g.scriptFile, scriptLanguage, g.arguments, UndoModes.ENTIRE_SCRIPT, "\"" + g.scriptName + "\" Script");
			}
			else if (g.appVersionNum == 5) { // Version CS3
				app.doScript(g.scriptFile, scriptLanguage, g.arguments);
			}	
			else if (g.appVersionNum >= 3 && appVersion <= 4) { // Versions CS -- CS2
				app.doScript(g.scriptFile, ScriptLanguage.JAVASCRIPT);
			}
		}
		else { // set of scripts
			for (var i = 0; i < g.scriptFiles.length; i++) {
				scriptFile = g.scriptFiles[i];
				scriptLanguage = g.GetScriptLanguage(scriptFile);
				
				if (g.appVersionNum >= 6) { // Version CS4 and above
					app.doScript(scriptFile, scriptLanguage, g.arguments, UndoModes.ENTIRE_SCRIPT, "\"" + g.scriptName + "\" Script");
				}
				else if (g.appVersionNum == 5) { // Version CS3
					app.doScript(scriptFile, scriptLanguage, g.arguments);
				}	
				else if (g.appVersionNum >= 3 && appVersion <= 4) { // Versions CS -- CS2
					app.doScript(scriptFile, scriptLanguage);
				}
			}
		}
	}
	catch(err) {
		g.ErrorExit("Quitting the script because of a fatal error: " + err.message + ", line: " + err.line, g.scriptName, true);
	}
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
g.GetScriptLanguage = function(scriptFile) {
	var scriptLanguage = null,
	scriptFileName = scriptFile.name;
	
	if (!g.win && scriptFileName.match(/\.scpt$/) != null) {
		scriptLanguage = ScriptLanguage.APPLESCRIPT_LANGUAGE;
	}
	else if (g.win && scriptFileName.match(/\.vbs$/) != null) {
		scriptLanguage = ScriptLanguage.VISUAL_BASIC;
	}
	else {
		scriptLanguage = ScriptLanguage.JAVASCRIPT;
	}

	return scriptLanguage;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
g.GetAllInddFiles = function(folder) {
	var files = [],
	fileList = folder.getFiles(),
	i, file;

	for (i = 0; i < fileList.length; i++) {
		file = fileList[i];
		if (file instanceof Folder && g.set.rbScope == 4) {
			files = files.concat(g.GetAllInddFiles(file));
		}
		else if (file instanceof File && file.name.match(/^Backup/) == null) {
			if (g.set.docType == 0 && file.name.match(/\.indd$/i)) {
				files.push(file);
			}
			else if (g.set.docType == 1 && file.name.match(/\.indt$/i)) {
				files.push(file);
			}
			else if (g.set.docType == 2 && file.name.match(/\.ind(d|t)$/i)) {
				files.push(file);
			}
		}
	}

	return files;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
g.GetArrayIndex = function(arr, val) {
	for (var i = 0; i < arr.length; i++) {
		if (arr[i] == val) {
			return i;
		}
	}
	return -1;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
g.GetFilesFromBook = function() {
	var bookContent, file, decodedPath,
	activeBook = app.activeBook,
	files = [];
	
	for (var i = 0; i < activeBook.bookContents.length; i++) {
		bookContent = activeBook.bookContents[i];
		decodedPath = decodeURI(bookContent.fullName.absoluteURI);
		
		if (bookContent.status != BookContentStatus.MISSING_DOCUMENT && bookContent.status != BookContentStatus.DOCUMENT_IN_USE) {
			file = new File(bookContent.fullName);
			files.push(file);
		}
		else if (bookContent.status == BookContentStatus.MISSING_DOCUMENT && g.set.log) {
			g.WriteToFile("ERROR: " + decodedPath + "' is missing because it has been moved, renamed, or deleted.");
		}
		else if (bookContent.status == BookContentStatus.DOCUMENT_IN_USE && g.set.log) {
			g.WriteToFile("ERROR: " + decodedPath + "' is being used by someone else and is therefore locked.");
		}
	}
	
	return files;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
g.CreateDialog = function() {
	g.GetDialogSettings();
	var isFile = (g.set.rbScript == 0) ? true : false; // file, or g.set of scripts in the folder
	if (g.scriptFolder != null) {
		if (g.win) {
			g.scriptFiles = g.scriptFolder.getFiles(g.winScriptExt);
		}
		else {
			g.scriptFiles = g.scriptFolder.getFiles(g.FilterScriptsMac(g.scriptFolder));
		}
	}

	var w = new Window("dialog", g.scriptName);
	w.orientation = "column";
	w.alignChildren = "fill";

	// Container
	var gc = w.add("group");
	gc.orientation = "row";
	gc.alignChildren = "top";

	// Left column group
	var gl = gc.add("group");
	gl.orientation = "column";
	gl.alignChildren = "left";
	
	// Right column group
	var gr = gc.add("group");
	gr.orientation = "column";
	gr.alignChildren = "right";
	// Left column 
	gl.p = gl.add("panel", undefined, "Process:");
	gl.p.orientation = "column";
	gl.p.alignment = "fill";
	gl.p.alignChildren = "left";

	// Scope
	gl.p.rb = gl.p.add("radiobutton", undefined, "active document");
	if (app.documents.length == 0) gl.p.rb.enabled = false;
	gl.p.rb1 = gl.p.add("radiobutton", undefined, "all open documents");
	if (app.documents.length < 2) gl.p.rb1.enabled = false;
	gl.p.rb2 = gl.p.add("radiobutton", undefined, "active book");
	if (app.books.length == 0) gl.p.rb2.enabled = false;
	gl.p.rb3 = gl.p.add("radiobutton", undefined, "documents in the selected folder");
	gl.p.rb4 = gl.p.add("radiobutton", undefined, "documents in the selected folder and its subfolders");
	gl.p.rb.onClick = gl.p.rb1.onClick = gl.p.rb2.onClick = gl.p.rb3.onClick = gl.p.rb4.onClick = function() {
		if (this.text.match(/^documents in the selected folder/) != null) {
			gr.p1.cb1.enabled = gr.p.enabled = gl.p.ddl.enabled = true;
		}
		else if (this.text == "active book") {
			gr.p1.cb1.enabled = true;
			gr.p.enabled = gl.p.ddl.enabled = false;
		}
		else {
			gr.p1.cb1.enabled = gr.p.enabled = gl.p.ddl.enabled = false;
		}
	}

	gl.p.ddl = gl.p.add("dropdownlist", undefined, ["Documents only (indd-files)", "Templates only (indt-files)", "Documents & Templates (indd & indt files)"]);
	gl.p.ddl.selection = g.set.docType;
	gl.p.ddl.alignment = "fill";

	if (g.set.rbScope == 0 && app.documents.length != 0) { // active document
		gl.p.rb.value = true;
		gl.p.ddl.enabled = false;
	}
	else if (g.set.rbScope == 1 && app.documents.length > 1) { // all open documents
		gl.p.rb1.value = true;
		gl.p.ddl.enabled = false;
	}
	else if (g.set.rbScope == 2 && app.books.length != 0) { // active book
		gl.p.rb2.value = true;
		gl.p.ddl.enabled = false;
	}
	else if (g.set.rbScope == 3) { // documents in the selected folder
		gl.p.rb3.value = gl.p.ddl.enabled = true;
	}
	else  { // documents in the selected folder and its subfolders
		gl.p.rb4.value = gl.p.ddl.enabled = true;
	}

	// What to run: a script or g.set of scripts
	gl.p1 = gl.add("panel", undefined, "What to run:");
	gl.p1.alignChildren = "left";
	gl.p1.alignment = "fill";
	gl.p1.rb = gl.p1.add("radiobutton", undefined, "single script");
	gl.p1.rb.onClick = UpdateScriptPanel;
	gl.p1.rb1 = gl.p1.add("radiobutton", undefined, "set of scripts");
	gl.p1.rb1.onClick = UpdateScriptPanel;

	function UpdateScriptPanel() { // clicking a radio button switches between "scipt" and "g.set of scripts"
		var fileObj;

		if (this.text == "single script") {
			isFile = true;
			fileObj = g.scriptFile;
			gl.p2.text = "Script:";
			
			if (fileObj == undefined || !fileObj.exists) {
				gl.p2.st.text = "No file has been selected";
			}
		}
		else {
			isFile = false;
			fileObj = g.scriptFolder;
			gl.p2.text = "Folder with scripts:";
			
			if (fileObj == undefined || !fileObj.exists) {
				gl.p2.st.text = "No folder has been selected";
			}
		}
		
		UpdateWindow(fileObj, gl.p2);
	}
	
	if (isFile) {
		gl.p1.rb.value = true;
	}
	else  {
		gl.p1.rb1.value = true;
	}
	
	var fileObj = (isFile) ? g.scriptFile : g.scriptFolder;
	
	// Scripts folder or a script panel
	gl.p2 = gl.add("panel", undefined, ((isFile) ? "Script:": "Folder with scripts:"));
	gl.p2.alignment = "fill";
	gl.p2.st = gl.p2.add("statictext");
	gl.p2.st.alignment = "left"; // center

	if (fileObj == undefined || !fileObj.exists) {
		gl.p2.st.text = "No " + ((isFile) ? "file": "folder") + " has been selected";
	}
	else {
		gl.p2.st.text = g.TrimPath(fileObj.fsName);
		gl.p2.st.helpTip = fileObj.fsName;
	}

	gl.p2.bt = gl.p2.add("button", undefined, "Select ...");
	gl.p2.bt.onClick = SelectScript;
	
	function SelectScript() {
		if (isFile) {
			if (g.win) {
				g.scriptFile = File.openDialog("Pick a script", "JavaScript files:*.jsx, JavaScript files: *.js, Binary JavaScript files: *.jsxbin, Visual Basic Script files:*.vbs, All Files:*.*");
			}
			else {
				g.scriptFile = File.openDialog("Pick a script", function(file) { return file instanceof Folder || (!(file.hidden) && (file.name.match(/\.scpt|jsx*(bin)*$/i))); }, false);
			}
		
			if (g.scriptFile != null) {
				UpdateWindow(g.scriptFile, gl.p2);
			}
		}
		else {
			g.scriptFolder = Folder.selectDialog("Pick a folder with scripts");
			
			if (g.scriptFolder != null) {
				if (g.win) {
					g.scriptFiles = g.scriptFolder.getFiles(g.winScriptExt);
				}
				else {
					g.scriptFiles = g.scriptFolder.getFiles(g.FilterScriptsMac(g.scriptFolder));
				}

				if (g.scriptFiles.length == 0) {
					alert("There are no scripts in the selected folder.", g.scriptName, true);
					g.scriptFolder = null;
					gl.p2.st.text = "No " + ((isFile) ? "file": "folder") + " has been selected";
				}
				else {
					UpdateWindow(g.scriptFolder, gl.p2);
				}
			}
		}
	}
//====================================   Right column   =====================================================
	// Documents folder
	gr.p = gr.add("panel", undefined, "Documents folder:");
	gr.p.alignment = "fill";
	gr.p.st = gr.p.add("statictext");
	gr.p.st.alignment = "left";
	if (g.docsFolder == null || !g.docsFolder.exists) { 
		gr.p.st.text = "No folder has been selected";
	}
	else {
		gr.p.st.text = g.TrimPath(g.docsFolder.absoluteURI);
		gr.p.st.helpTip = g.docsFolder.fsName;
	}
	gr.p.bt = gr.p.add("button", undefined, "Select ...");
	gr.p.bt.onClick = function() {
		g.docsFolder = g.SelectFolder(this, "Pick a folder with documents.");
	}

	if (gl.p.rb3.value || gl.p.rb4.value) {
		gr.p.enabled = true;
	}
	else {
		gr.p.enabled = false;
	}

	// Settings panel
	gr.p1 = gr.add("panel", undefined, "Settings:");
	gr.p1.alignChildren = "left";
	gr.p1.alignment = "fill";
	
	// Check boxes
	gr.p1.cb = gr.p1.add("checkbox", undefined, "Create log file on the desktop");
	gr.p1.cb.alignment = "left";
	gr.p1.cb.value = g.set.log;
	
	gr.p1.cb1 = gr.p1.add("checkbox", undefined, "Save documents on closing");
	gr.p1.cb1.alignment = "left";
	gr.p1.cb1.value = g.set.saveOnClosing;
	gr.p1.cb1.helpTip = "Saves documents before closing. Works only for documents in the selected folder. The documents that have already been opened before running the script will be saved and remain open.";
	gr.p1.cb1.onClick = function() {
		if (this.value) {
			gr.p1.cb2.enabled = true;
		}
		else {
			gr.p1.cb2.enabled = false;
		}
	}

	if (gl.p.rb2.value || gl.p.rb3.value || gl.p.rb4.value) {
		gr.p1.cb1.enabled = true;
	}
	else {
		gr.p1.cb1.enabled = false;
	}
	
	gr.p1.cb2 = gr.p1.add("checkbox", undefined, "Backup original InDesign documents");
	gr.p1.cb2.alignment = "left";
	gr.p1.cb2.value = g.set.backUp;
	if (!g.set.saveOnClosing) {
		gr.p1.cb2.enabled = false;
	}

	gr.p1.cb3 = gr.p1.add("checkbox", undefined, "Open in invisible mode");
	gr.p1.cb3.alignment = "left";
	gr.p1.cb3.value = g.set.invisibleMode;
	gr.p1.cb3.helpTip = "If on, the document is opened but is not displayed in a window. This may result in a better performance.";

	// Arguments panel
	gr.p2 = gr.add("panel", undefined, "Arguments file (optonal):");
	gr.p2.alignment = "fill";
	
	if (g.appVersionNum >= 5) {
		gr.p2.cb = gr.p2.add("checkbox", undefined, "Use arguments");
		gr.p2.cb.alignment = "left";
		gr.p2.cb.value = g.set.useArguments;
		gr.p2.cb.onClick = function() {
			if (this.value) {
				gr.p2.cb1.enabled = gr.p2.g.enabled = gr.p2.st.enabled = gr.p2.bt.enabled = true;
			}
			else {
				gr.p2.cb1.enabled = gr.p2.g.enabled = gr.p2.st.enabled = gr.p2.bt.enabled = false;
			}
		}

		gr.p2.cb1 = gr.p2.add("checkbox", undefined, "Ignore comments");
		gr.p2.cb1.alignment = "left";
		gr.p2.cb1.value = g.set.ignoreComments;
		
		gr.p2.g = gr.p2.add("group");
		gr.p2.g.orientation = "row";
		gr.p2.g.alignment = "left";
		
		gr.p2.g.st = gr.p2.g.add("statictext", undefined, "Separator:");
		gr.p2.g.st.alignment = "left";

		var separatorList = ["Custom", "\\n (Line feed)", ", (Comma)", "; (Semicolon)", "| (Pile)"];
		gr.p2.g.ddl = gr.p2.g.add("dropdownlist", undefined, separatorList);
		gr.p2.g.ddl.selection = g.set.argsSeparatorSelectedIdx;
		gr.p2.g.ddl.onChange = UpdateEditText;
	
		function UpdateEditText() {
			if (gr.p2.g.ddl.selection == 0) {
				gr.p2.g.et.text = g.set.argsSeparator;
			}
			else if (gr.p2.g.ddl.selection == 1) {
				gr.p2.g.et.text = "\\n";
			}
			else if (gr.p2.g.ddl.selection == 2) {
				gr.p2.g.et.text = ",";
			}
			else if (gr.p2.g.ddl.selection == 3) {
				gr.p2.g.et.text = ";";
			}		
			else if (gr.p2.g.ddl.selection == 4) {
				gr.p2.g.et.text = "|";
			}

			if (gr.p2.g.ddl.selection != 0) {
				gr.p2.g.et.enabled = false;
			}
			else {
				gr.p2.g.et.enabled = true;
			}
		}

		gr.p2.g.et = gr.p2.g.add("edittext", undefined, g.set.argsSeparator);
		gr.p2.g.et.minimumSize = [20, undefined];
		gr.p2.g.et.minimumSize.width = 40; // characters = 3
		gr.p2.g.et.onChange = function() {
			if (this.text.replace(/\s+/g, "") == "") {
				alert("You left the 'Separator' text edit field empty; restoring it to the previous value.", g.scriptName, true);
				this.text = g.set.argsSeparator;
				return;
			}
		}
		
		UpdateEditText();

		gr.p2.p = gr.p2.add("panel", undefined, ""); // separator line
		gr.p2.p.alignment = "fill";

		gr.p2.st = gr.p2.add("statictext");
		gr.p2.st.alignment = "left";

		if (g.argumentsFile == undefined || !g.argumentsFile.exists) {
			gr.p2.st.text = "No arguments file has been selected";
		}
		else {
			gr.p2.st.text = g.TrimPath(g.argumentsFile.fsName);
			gr.p2.st.helpTip = g.argumentsFile.fsName;
		}

		gr.p2.bt = gr.p2.add("button", undefined, "Select ...");
		gr.p2.bt.onClick = SelectArgumentsFile;

		function SelectArgumentsFile() {
			if (g.win) {
				g.argumentsFile = File.openDialog("Pick an arguments file", "Text files: *.txt, CSV files: *.csv, All Files:*.*");
			}
			else {
				g.argumentsFile = File.openDialog("Pick an arguments file", function(file) { return file instanceof Folder || (!(file.hidden) && (file.name.match(/\.(csv|txt)$/i))); }, false);
			}
			
			if (g.argumentsFile != null) {
				UpdateWindow(g.argumentsFile, gr.p2);
			}
		}

		if (g.set.useArguments) {
			gr.p2.cb1.enabled = gr.p2.g.enabled = gr.p2.st.enabled = gr.p2.bt.enabled = true;
		}
		else {
			gr.p2.cb1.enabled = gr.p2.g.enabled = gr.p2.st.enabled = gr.p2.bt.enabled = false;
		}
	}
	else {
		gr.p2.preferredSize.height = 140;
		gr.p2.orientation = "column";
		gr.p2.alignChildren = ["center", "center"];
		gr.p2.st = gr.p2.add("statictext", undefined, "In InDesign CS3 and below the arguments feature is unavailable", {multiline: true});
	}

	function UpdateWindow(fileObj, panel) {
		if (fileObj != null && fileObj.exists) {
			panel.remove(panel.st);
			panel.remove(panel.bt);
			panel.st = panel.add("statictext");
			panel.st.text = g.TrimPath(fileObj.fsName);
			panel.st.helpTip = fileObj.fsName;
			panel.bt = panel.add("button", undefined, "Select ...");
			panel.bt.onClick = SelectScript;
			w.layout.layout(true);
		}
	}

	// Buttons
	w.gb = w.add("group");
	w.gb.orientation = "row";
	w.gb.alignment = "center";
	w.gb.ok = w.gb.add("button", undefined, "OK", {name: "ok" });
	w.gb.ok.onClick = function() { // Use 'children[0]' because the panel is dynamically rebuilt on selecting a new folder so the original references become invalid
		if ((gl.p.rb3.value || gl.p.rb4.value) && gr.p.children[0].text == "No folder has been selected") {
			alert("No 'Documents' folder has been selected.", g.scriptName, true);
			return;
		}
		else if (gr.p2.cb.value && gr.p2.children[3].text == "No arguments file has been selected") {
			alert("No arguments file has been selected.", g.scriptName, true);
			return;
		}
		else if (isFile) { // File
			if (g.scriptFile == null) {
				alert("No script has been selected", g.scriptName, true);
				return;
			}
			else if (!g.scriptFile.exists) {
				alert("Script '" + g.scriptFile.displayName + "' doesn't exist.", g.scriptName, true);
				return;
			}
		}
		else if (!isFile) { // Folder
			if (g.scriptFolder == null) {
				alert("No scripts folder has been selected", g.scriptName, true);
				return;
			}
			else if (!g.scriptFolder.exists) {
				alert("Folder '" + g.scriptFolder.displayName + "' doesn't exist.", g.scriptName, true);
				return;
			}
			else if (g.scriptFiles == null || g.scriptFiles.length == 0) {
				alert("There are no scripts in the scripts folder.", g.scriptName, true);
				return;
			}
		}

		w.close(1); // If we've reached here, everythin's OK
	}

	w.gb.cancel = w.gb.add("button", undefined, "Cancel", {name: "cancel"});
	
	var showDialog = w.show();
	
	if (showDialog == 1) {
		if (gl.p.rb.value == true) { // active document
			g.set.rbScope = 0;
		}
		else if (gl.p.rb1.value == true) { // all open documents
			g.set.rbScope = 1;
		}
		else if (gl.p.rb2.value == true) { // active book
			g.set.rbScope = 2;
		}
		else if (gl.p.rb3.value == true) { // documents in the selected folder
			g.set.rbScope = 3;
		}
		else if (gl.p.rb4.value == true) { // documents in the selected folder and its subfolders
			g.set.rbScope = 4;
		}

		g.set.docType = gl.p.ddl.selection.index;

		if (gl.p1.rb.value == true) { // A script file
			g.set.rbScript = 0;
		}
		else if (gl.p1.rb1.value == true) { // A folder of script files
			g.set.rbScript = 1;
		}
	
		if (g.scriptFile instanceof File) {
			g.set.scriptFilePath = g.scriptFile.fsName;
		}
		else {
			g.set.scriptFilePath = "";
		}
	
		if (g.scriptFolder instanceof Folder) {
			g.set.scriptFolderPath = g.scriptFolder.fsName;
		}
		else {
			g.set.scriptFolderPath = "";
		}

		g.set.docsFolderPath = (g.docsFolder != null) ? g.docsFolder.absoluteURI : ""; // if selected, remember the path; if not, empty string. e.g. for active doc we don't need this

		// Settings panel
		g.set.log = gr.p1.cb.value;
		g.set.saveOnClosing = gr.p1.cb1.value;
		g.set.backUp = gr.p1.cb2.value;
		g.set.invisibleMode = gr.p1.cb3.value;

		// Arguments panel
		g.set.useArguments = gr.p2.cb.value;
		g.set.ignoreComments = gr.p2.cb1.value;
		
		if (g.argumentsFile instanceof File) {
			g.set.argsFilePath = g.argumentsFile.fsName;
		}
		else {
			g.set.argsFilePath = "";
		}

		g.set.argsSeparatorSelectedIdx = gr.p2.g.ddl.selection.index;
		
		if (gr.p2.g.ddl.selection.index == 0) {
			g.set.argsSeparator = g.Trim(gr.p2.g.et.text);
		}
		
		var tmp = g.set;
		app.insertLabel("Kas_" + g.scriptName, g.set.toSource());
		
		g.Main();
	}
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
g.GetDialogSettings = function() {
	g.set = eval(app.extractLabel("Kas_" + g.scriptName));
	
	if (g.set == undefined) {
		g.set = {    rbScope: 0, docType: 0, rbScript: 0, docsFolderPath: "", scriptFilePath: "", scriptFolderPath: "", 
						useArguments: false, ignoreComments: true, argsFilePath: "", argsSeparatorSelectedIdx: 1, argsSeparator: ",",
						log: true, backUp: true, saveOnClosing: false, invisibleMode: false
					};
	}

	g.docsFolder = new Folder(g.set.docsFolderPath);
	if (!g.docsFolder.exists) {
		g.docsFolder = null;
	}

	g.scriptFile = new File(g.set.scriptFilePath);
	if (!g.scriptFile.exists) {
		g.scriptFile = null;
	}

	g.scriptFolder = new Folder(g.set.scriptFolderPath);
	if (!g.scriptFolder.exists) {
		g.scriptFolder = null;
	}

	g.argumentsFile = new File(g.set.argsFilePath);
	if (!g.argumentsFile.exists) {
		g.argumentsFile = null;
	}

	return g.set;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
g.CreateProgressBar = function() {
	var w = new Window("window", g.scriptName);
	w.pb = w.add("progressbar", [12, 12, 350, 24], 0, undefined);
	w.st = w.add("statictext");
	w.st.bounds = [0, 0, 340, 20];
	w.st.alignment = "left";
	return w;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
g.FilterScriptsMac = function(file) {
	return file instanceof Folder || (!(file.hidden) && (file.name.match(/\.scpt|jsx*(bin)*$/i)));
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
g.GetDuration = function(startTime, endTime) {
	var str;
	var duration = (endTime - startTime)/1000;
	duration = Math.round(duration);
	if (duration >= 60) {
		var minutes = Math.floor(duration/60);
		var seconds = duration - (minutes * 60);
		str = minutes + ((minutes != 1) ? " minutes, " :  " minute, ") + seconds + ((seconds != 1) ? " seconds" : " second");
		if (minutes >= 60) {
			var hours = Math.floor(minutes/60);
			minutes = minutes - (hours * 60);
			str = hours + ((hours != 1) ? " hours, " : " hour, ") + minutes + ((minutes != 1) ? " minutes, " :  " minute, ") + seconds + ((seconds != 1) ? " seconds" : " second");
		}
	}
	else {
		str = duration + ((duration != 1) ? " seconds" : " second");
	}

	return str;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
g.GetDate = function() {
	var date = new Date();
	if ((date.getYear() - 100) < 10) {
		var year = "0" + new String((date.getYear() - 100));
	}
	else {
		var year = new String((date.getYear() - 100));
	}
	var dateString = (date.getMonth() + 1) + "/" + date.getDate() + "/" + year + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
	return dateString;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
g.SelectFolder = function(button, prompt) {
	var folder = Folder.selectDialog(prompt);
	
	if (folder != null) {
		var panel = button.parent;
		var window = panel.parent;
		var children = panel.children;
		var staticText = children[0];
		var button = button;
		panel.remove(staticText);
		panel.remove(button);
		staticText = panel.add("statictext", undefined, g.TrimPath(folder.absoluteURI));
		staticText.helpTip = folder.absoluteURI;
		button = panel.add("button", undefined, "Select ...");
		button.onClick = function() {
			g.SelectFolder(this);
		}
		window.layout.layout(true);
		return folder;		
	}
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
g.TrimPath = function(path) {
	var trimPath,
	theFile = new File(path);
	
	if (g.win) {
		trimPath = ((theFile.fsName.split("\\").length > 3) ? "...\\" : "") + theFile.fsName.split("\\").splice(-3).join("\\");
	}	
	else { // Macintosh
		trimPath = "..." + theFile.fsName.split("/").splice(-3).join("/");
	}

	return trimPath;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
g.Trim = function(str) { // removes whitespace from both sides of a string
	return str.replace(/^\s+|\s+$/gm, "");
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
g.ReadTxtFile = function(file) {
	file.open("r"); 
	var txt = file.read();
	file.close();
	return txt;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
g.WriteToFile = function(text) {
	var file = new File("~/Desktop/" + g.scriptName + ".txt");
	file.encoding = "UTF-8";
	if (file.exists) {
		file.open("e");
		file.seek(0, 2);
	}
	else {
		file.open("w");
	}
	file.write(text + "\r"); 
	file.close();
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
g.ErrorExit = function(error, icon) {
	alert(error, g.scriptName, icon);
	exit();
}
//======================================================================================
g.CreateDialog();
//======================================================================================
/* 
PROBLEMS:
1) empty separator text field on close
*/