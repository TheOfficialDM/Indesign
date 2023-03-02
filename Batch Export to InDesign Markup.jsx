// Batch Export to InDesign Markup
// Script for InDesign CS6.
// Opens all InDesign documents in the selected folder 
// and  exports them to 'Interchange Files' subfolder as inx files, which is created in the selected folder.
// Version 1.0
// February 12, 2010
// Written by Kasyan Servetsky
// http://www.kasyan.ho.com.ua
// e-mail: askoldich@yahoo.com
//--------------------------------------------------------------------------------------------------------------
var myInDesignVersion = Number(String(app.version).split(".")[0]);

var myFolder = Folder.selectDialog("Select a folder with InDesign files to resave");
if (myFolder == null) exit();
var myFilelist = [];
var myAllFilesList = myFolder.getFiles();

for (var f = 0; f < myAllFilesList.length; f++) {
	var myFile = myAllFilesList[f];
	if (myFile instanceof File && myFile.name.match(/\.indd$/i)) {
		myFilelist.push(myFile);
	}
}

if (myFilelist.length == 0) {
	alert("No files to open.", "Batch Export to InDesign Markup");
	exit();
}

var myExportFolder = new Folder( myFolder.fsName + "/IDML-Files/" );
VerifyFolder(myExportFolder);

var myCounter = 1;
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;

// Progress bar -----------------------------------------------------------------------------------
var myProgressWin = new Window ( "window", "Batch Export to InDesign Markup" );
var myProgressBar = myProgressWin.add ("progressbar", [12, 12, 350, 24], 0, myFilelist.length);
var myProgressTxt = myProgressWin.add("statictext", undefined, "Starting exporting files");
myProgressTxt.bounds = [0, 0, 340, 20];
myProgressTxt.alignment = "left";
myProgressWin.show();
// Progress bar -----------------------------------------------------------------------------------

for (var i = myFilelist.length-1; i >= 0; i--) {
		var myCurrentFile = myFilelist[i];
		var myNewName = GetNameWithoutExtension(myCurrentFile) + ".idml";
	
	try {
		var myDoc = app.open(myCurrentFile, false);
		var myDocName = myDoc.name;
		var myDocFilePath = new File(myExportFolder.fsName + "/" + myNewName);

		// Progress bar -----------------------------------------------------------------------------------
		myProgressBar.value = myCounter;
		myProgressTxt.text = String("Exporting file - " + myDocName + " (" + myCounter + " of " + myFilelist.length + ")");
		// Progress bar -----------------------------------------------------------------------------------

		myDoc.exportFile(ExportFormat.INDESIGN_MARKUP, myDocFilePath);
		myDoc.close(SaveOptions.NO);
		
		myCounter++;
	}
	catch(e) {
		alert(e);
	}
}

	// Progress bar -----------------------------------------------------------------------------------
	myProgressWin.close();
	// Progress bar -----------------------------------------------------------------------------------

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALL;

alert("Done.", "Batch Export to InDesign Markup");

//--------------------------------------------------------------------------------------------------------------
function VerifyFolder(myFolder) {
	if (!myFolder.exists) {
		var myFolder = new Folder(myFolder.absoluteURI);
		var myArray1 = new Array();
		while (!myFolder.exists) {
			myArray1.push(myFolder);
			myFolder = new Folder(myFolder.path);
		}
		myArray2 = new Array();
		while (myArray1.length > 0) {
			myFolder = myArray1.pop();
			if (myFolder.create()) {
				myArray2.push(myFolder);
			} else {
				while (myArray2.length > 0) {
					myArray2.pop.remove();
				}
				throw "Folder creation failed";
			} 
		}
	}
}
//--------------------------------------------------------------------------------------------------------------
function GetNameWithoutExtension(myFile) {
	var myFileName = myFile.name;
	var myIndex = myFileName.lastIndexOf( "." );
	if ( myIndex > -1 ) {
		myFileName = myFileName.substr(0, myIndex);
	}
	return myFileName;
}