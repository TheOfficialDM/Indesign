var scriptName = "Change the language of all paragraph and/or character styles",
doc;

PreCheck();

//===================================== FUNCTIONS ======================================
function Main() {
	doc=app.documents[0]; 
	var theResult = DisplayDialog();
	myLanguage= theResult[0];

	// Paragraph styles
	if (theResult[1] == true)
	{
		myStyles=doc.allParagraphStyles; 
		for (oneStyle=1;oneStyle<myStyles.length;oneStyle++)
		{ 
			myStyles[oneStyle].appliedLanguage=myLanguage; 
		}
	} 

	// Character styles
	if (theResult[2] == true)
	{
		myStyles=doc.characterStyles; 
		for (oneStyle=1;oneStyle<myStyles.length;oneStyle++)
		{ 
			myStyles[oneStyle].appliedLanguage=myLanguage; 
		}
	} 
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function DisplayDialog()
{
	var theLanguages = app.languagesWithVendors.everyItem().name;

	var myDialog = app.dialogs.add({name: scriptName});
	with(myDialog.dialogColumns.add()){
		with(dialogRows.add()){ 
			with(dialogColumns.add()){ 
				staticTexts.add({staticLabel:"Language:", minWidth:120}); 
			} 
			with(dialogColumns.add()){ 
				var myLanguagesDropdown = dropdowns.add({stringList:theLanguages, selectedIndex:1}); 
			} 
		} 
		with(dialogRows.add())
		{ 
			with(dialogColumns.add())
			{ 
				staticTexts.add({staticLabel:"use on:", minWidth:120}); 
				with(dialogColumns.add())
				{
					var myParacheckbox = checkboxControls.add({staticLabel:"Paragraph styles", checkedState:true});
					var myCharcheckbox = checkboxControls.add({staticLabel:"Character styles", checkedState:false});
				}
			}
		}

	}
	var theResult = myDialog.show();
	if(theResult == true){
		var theLan = theLanguages[myLanguagesDropdown.selectedIndex] 
		var theParaSt = myParacheckbox.checkedState;
		var theCharSt = myCharcheckbox.checkedState;
		myDialog.destroy();
	}
	else{
		myDialog.destroy();
		exit();
	}
	return [theLan, theParaSt, theCharSt];
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


