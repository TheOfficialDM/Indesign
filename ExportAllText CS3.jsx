if(app.documents.length != 0){ 
	if(app.documents.item(0).stories.length != 0){ 
		myGetFileName(app.documents.item(0).name); 
	} 
}
//========================= FUNCTIONS ===========================
function myGetFileName(myDocumentName){ 
	var myFilePath = File.saveDialog("Save Exported File As:"); 
	if(myFilePath != null){ 
		myDisplayDialog(myDocumentName, myFilePath); 
	} 
}
//--------------------------------------------------------------------------------------------------------------
function myDisplayDialog(myDocumentName, myFilePath){ 
	//Need to get export format, story separator. 
	var myExportFormats = ["Text Only", "Tagged Text", "RTF"]; 
	var myDialog = app.dialogs.add({name:"ExportAllStories"}); 
	with(myDialog.dialogColumns.add()){ 
		with(dialogRows.add()){ 
			with(dialogColumns.add()){ 
				var myExportFormatDropdown = dropdowns.add({stringList:myExportFormats, selectedIndex:0}); 
			} 
		} 
		with(dialogRows.add()){ 
			var myAddSeparatorCheckbox = checkboxControls.add({staticLabel:"Add separator line", checkedState:true}); 
		} 
	} 
	var myResult = myDialog.show(); 
	if(myResult == true){ 
		var myExportFormat = myExportFormats[myExportFormatDropdown.selectedIndex]; 
		var myAddSeparator = myAddSeparatorCheckbox.checkedState; 
		myDialog.destroy(); 
		myExportAllText(myDocumentName, myFilePath, myExportFormat, myAddSeparator); 
	} 
	else{ 
		myDialog.destroy(); 
	} 
}
//--------------------------------------------------------------------------------------------------------------
function myExportAllText(myDocumentName, myFilePath, myExportFormat, myAddSeparator){ 
	var myPage, myStory;
	var myExportedStories = [];
	var myTempFolder = Folder.temp; 
	var myTempFile = File(myTempFolder + "/tempTextFile.txt"); 
	var myNewDocument = app.documents.add(); 
	var myDocument = app.documents.item(myDocumentName); 
	var myTextFrame = myNewDocument.pages.item(0).textFrames.add({geometricBounds:myGetBounds(myNewDocument, myNewDocument.pages.item(0))}); 
	var myNewStory = myTextFrame.parentStory; 
	for (var i = 0; i < myDocument.pages.length; i++) {
		myPage = myDocument.pages.item(i);
		for (var t = 0; t < myPage.textFrames.length; t++){
			myStory = myPage.textFrames[t].parentStory;
			if (!IsInArray(myStory.id, myExportedStories)) {
				//Export the story as tagged text. 
				myStory.exportFile(ExportFormat.taggedText, myTempFile);
				myExportedStories.push(myStory.id);
				//Import (place) the file at the end of the temporary story. 
				myNewStory.insertionPoints.item(-1).place(myTempFile); 
				//If the imported text did not end with a return, enter a return 
				//to keep the stories from running together. 
				if(i != myDocument.stories.length -1){ 
					if(myNewStory.characters.item(-1).contents != "\r"){ 
						myNewStory.insertionPoints.item(-1).contents = "\r"; 
					} 
					if(myAddSeparator == true){ 
						myNewStory.insertionPoints.item(-1).contents = "----------------------------------------\r"; 
					} 
				}
			} // if not exported
		} // for text frames
	} // for pages
	switch(myExportFormat){ 
		case "Text Only": 
			myFormat = ExportFormat.textType; 
			myExtension = ".txt" 
			break; 
		case "RTF": 
			myFormat = ExportFormat.RTF; 
			myExtension = ".rtf" 
			break; 
		case "Tagged Text": 
			myFormat = ExportFormat.taggedText; 
			myExtension = ".txt" 
			break; 
	} 
	myNewStory.exportFile(myFormat, File(myFilePath)); 
	myNewDocument.close(SaveOptions.no); 
	myTempFile.remove(); 
}
//--------------------------------------------------------------------------------------------------------------
function myGetBounds(myDocument, myPage){ 
	var myPageWidth = myDocument.documentPreferences.pageWidth; 
	var myPageHeight = myDocument.documentPreferences.pageHeight 
	if(myPage.side == PageSideOptions.leftHand){ 
		var myX2 = myPage.marginPreferences.left; 
		var myX1 = myPage.marginPreferences.right; 
	} 
	else{ 
		var myX1 = myPage.marginPreferences.left; 
		var myX2 = myPage.marginPreferences.right; 
	} 
	var myY1 = myPage.marginPreferences.top; 
	var myX2 = myPageWidth - myX2; 
	var myY2 = myPageHeight - myPage.marginPreferences.bottom; 
	return [myY1, myX1, myY2, myX2]; 
}
//--------------------------------------------------------------------------------------------------------------
function IsInArray(myString, myArray) {
	for (x in myArray) {
		if (myString == myArray[x]) {
			return true;
		}
	}
	return false;
}
//--------------------------------------------------------------------------------------------------------------