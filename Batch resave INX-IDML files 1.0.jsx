/* Batch resave INX-IDML files
Copyright 2013, Kasyan Servetsky
September 8, 2013
Written by Kasyan Servetsky
http://www.kasyan.ho.com.ua
e-mail: askoldich@yahoo.com */
//======================================================================================
var scriptName = "Batch resave INX-IDML files - 1.0";

Main();

//===================================== FUNCTIONS  ======================================
function Main() {
	var file, currentFile, doc, docName, newDocFile, increment,
	fileList = [],
	counter = 0;
	
	var inDesignVersion = Number(String(app.version).split(".")[0]);
	if (inDesignVersion < 5) {
		alert("This script is for InDesign CS3 and above.", scriptName, true);
		exit();
	}

	var folder = Folder.selectDialog("Select a folder with InDesign files to resave");
	if (folder == null) exit();

	var allFilesList = folder.getFiles();

	for (var f = 0; f < allFilesList.length; f++) {
		file = allFilesList[f];
		if (file instanceof File && file.name.match(/\.i(nx|dml)$/i)) {
			fileList.push(file);
		}
	}

	if (fileList.length == 0) {
		alert("No files to open.", scriptName, true);
		exit();
	}

	var resavedFolder = new Folder(folder.fsName + "/Resaved Files/");
	VerifyFolder(resavedFolder);
	
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;

	var progressWin = new Window ("window", scriptName);
	var progressBar = progressWin.add ("progressbar", [12, 12, 350, 24], 0, fileList.length);
	var progressTxt = progressWin.add("statictext", undefined, "Starting resaving files");
	progressTxt.bounds = [0, 0, 340, 20];
	progressTxt.alignment = "left";
	progressWin.show();

	for (var i = fileList.length-1; i >= 0; i--) {
		currentFile = fileList[i];
		
		try {
			doc = app.open(currentFile, false);
			docName = currentFile.name.replace(/\.i(nx|dml)$/i, ".indd");
			newDocFile = new File(resavedFolder.fsName + "/" + docName);
			
			if (newDocFile.exists) {
				increment = 1;
				while (newDocFile.exists) {
					newDocFile = new File(resavedFolder.fsName + "/" + currentFile.name.replace(/\.i(nx|dml)$/i, "") + "(" + increment++ + ").indd");
				}
			}

			progressBar.value = counter;
			progressTxt.text = String("Resaving file - " + docName + " (" + counter + " of " + fileList.length + ")");

			doc = doc.save(newDocFile);
			doc.close();
			counter++;
		}
		catch(e) {}
	}

	progressWin.close();

	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALL;

	var report = counter + " files " + ((counter == 1) ? "was" : "were") + " resaved.";
	alert("Finished. " + report, scriptName);
}

function VerifyFolder(folder) {
	if (!folder.exists) {
		var folder = new Folder(folder.absoluteURI);
		var arr1 = new Array();
		while (!folder.exists) {
			arr1.push(folder);
			folder = new Folder(folder.path);
		}
		var arr2 = new Array();
		while (arr1.length > 0) {
			folder = arr1.pop();
			if (folder.create()) {
				arr2.push(folder);
			} else {
				while (arr2.length > 0) {
					arr2.pop.remove();
				}
				throw "Folder creation failed";
			} 
		}
	}
}