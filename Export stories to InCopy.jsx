// Export stories to InCopy.jsx
// Exports stories in an InDesign document in InCopy Document text format.
// Script for InDesign CS3 
// Version 1.2
// Feb 13 2010
// Written by Kasyan Servetsky
// http://www.kasyan.ho.com.ua
// e-mail: askoldich@yahoo.com
//--------------------------------------------------------------------------------------------------------------
var myDoc = app.activeDocument;
var myInDesignVersion = Number(String(app.version).split(".")[0]);
// Check contitions
if (app.documents.length == 0) ErrorExit(localize({en: "No documents are open. Please open a document and try again.", ru: "Не открыт ни один документ, откройте файл и попробуйте снова."}), true);
if (!myDoc.saved) ErrorExit(localize({en: "This file has never been saved. Save it and run the script again.", ru: "Этот файл ещё ни разу не был сохранен. Сохраните его и попробуйте запустить скрипт снова."}), true);
if (myInDesignVersion < 5) ErrorExit(localize({en: "This script requiers InDesign CS3 or above.", ru: "Для работы этого скрипта необходим InDesign CS3 или выше."}), true);

var myLayer = myDoc.activeLayer;
var myDialogSel = CreateDialog();
var myStories = [];
var myCounter = 0;

switch(myDialogSel) {
	case 1:
		GetStories(myDoc.allPageItems);
		break;
	case 2:
		GetStories(myLayer.allPageItems);
		break;
	case 3:
		GetStoriesSelection(myDoc.selection);
	break;
}

var myPath = myDoc.filePath +"/InCopyStories";
var myFolder = new Folder(myPath);
if (!myFolder.exists) myFolder.create();

if (myStories.length > 0) {
	ProcessStories(myStories);
}
else {
	ErrorExit(localize({en: "No stories to be exported have been found.", ru: "Не найдено ни одного материала для экспорта."}), true);
}

Report();

// ------------------ FUNCTIONS ------------------
function ProcessStories(myStories) {
		var myProgressWin = new Window ( "window", localize({en: "Export Stories to InCopy", ru: "Экспорт в InCopy"}));
		var myProgressBar = myProgressWin.add ("progressbar", [12, 12, 350, 24], 0, myStories.length);
		var myProgressTxt = myProgressWin.add("statictext", undefined, localize({en: "Starting", ru: "Начинаем"}));
		myProgressTxt.bounds = [0, 0, 340, 20];
		myProgressTxt.alignment = "left";
		myProgressWin.show();
		
	for (var j = 0; j < myStories.length; j++) {
		myProgressBar.value = myCounter + 1;
		myProgressTxt.text = String(localize({en: "Exporting story ", ru: "Экспортируем материал "}) + (myCounter + 1) + localize({en: " of ", ru: " из "}) + myStories.length);
		var myStory = myStories[j];
		var myFileName = GetFileNameOnly(myDoc.name) + "-" + myStory.id + ".incx";
		var myFilePath = myFolder.fsName + "/" + myFileName;
		var myFile = new File(myFilePath);
		try { // in case a srory is in anchored text frame
			myStory.exportFile(ExportFormat.INCOPY_DOCUMENT, myFile);
		}
		catch (myError) {
			$.writeln(myError);
		}
			myCounter++;
	}
	myProgressWin.close();
}
// ------------------------------------------------
function GetStories(myItems) {
	for (var i = 0; i < myItems.length; i++) {
		if (myItems[i].constructor.name == "TextFrame") {
			if (myItems[i].parentStory.itemLink == null) {
				if (!IsObjInArray(myItems[i].parentStory, myStories)) {
					myStories.push(myItems[i].parentStory);
				}
			}
		}
	}
}
// ------------------------------------------------
function GetStoriesSelection(mySelItems) {
	for (var s = 0; s < mySelItems.length; s++) {
		if (mySelItems[s].constructor.name == "TextFrame") {
			if (mySelItems[s].parentStory.itemLink == null) {
				if (!IsObjInArray(mySelItems[s].parentStory, myStories)) {
					myStories.push(mySelItems[s].parentStory);
				}
			}
		}
		else if (mySelItems[s].constructor.name == "Group") {
			var myItems = mySelItems[s].allPageItems;
			GetStories(myItems);
		}
	}
}
// ------------------------------------------------
function IsObjInArray(myObj, myArray) {
	for (x in myArray) {
		if (myObj.id == myArray[x].id) {
			return true;
		}
	}
	return false;
}
// ------------------------------------------------
function GetFileNameOnly(myFileName) {
	var myString = "";
	var myResult = myFileName.lastIndexOf(".");
	if (myResult == -1) {
		myString = myFileName;
	}
	else {
		myString = myFileName.substr(0, myResult);
	}
	return myString;
}
// ------------------------------------------------
function ErrorExit(myError, myIcon) {
	alert(myError, localize({en: "Export Stories to InCopy", ru: "Экспорт в InCopy"}), myIcon);
	exit();
}
// ------------------------------------------------
function CreateDialog() {
	var myDialog = new Window("dialog", localize({en: "Export Stories to InCopy", ru: "Экспорт в InCopy"}));
	var myPanel = myDialog.add("panel", undefined, localize({en: "Export:", ru: "Экспортировать:"}));
	myPanel.alignChildren = "left";
	var myRadioBtn1 = myPanel.add("radiobutton", undefined, localize({en: "all in the active document", ru: "всё в документе"}));
	var myRadioBtn2 = myPanel.add("radiobutton", undefined, localize({en: "all on the active layer: \"", ru: "всё на активном слое: \""}) + myLayer.name + "\"");
	var myRadioBtn3 = myPanel.add("radiobutton", undefined, localize({en: "only selection", ru: "только выделенное"}));

	if (app.extractLabel("Kas_ExportInCopy_RadioBtnSelected_1.2") != "") {
		eval("myRadioBtn" + app.extractLabel("Kas_ExportInCopy_RadioBtnSelected_1.2") + ".value= true");
	}
	else {
		myRadioBtn1.value = true;
	}

	if (app.selection.length == 0) {
		myRadioBtn3.enabled = false;
		if (myRadioBtn3.value) myRadioBtn1.value = true;
	}

	var myButtonsGrp = myDialog.add("group");
	var myOkBtn = myButtonsGrp.add("button", undefined, localize({en: "Ok", ru: "Да"}), {name:"ok"});
	var myCancelBtn = myButtonsGrp.add("button", undefined, localize({en: "Cancel", ru: "Отменить"}), {name:"cancel"});
	
	var myDialogResult = myDialog.show();
	if (myDialogResult == 1) {
		var myRadSelected;
		if (myRadioBtn1.value) {
			myRadSelected = 1;
		}
		else if(myRadioBtn2.value) {
			myRadSelected = 2;
		}
		else if(myRadioBtn3.value) {
			myRadSelected = 3;
		}
		app.insertLabel("Kas_ExportInCopy_RadioBtnSelected_1.2", myRadSelected + "");
		return myRadSelected;
	}
	else {
		exit();
	}
}
// ------------------------------------------------
function Report() {
	if (myCounter == 0) {
		alert(localize({en: "Nothing has been exported.", ru: "Ничего не было экспортировано."}), localize({en: "Export Stories to InCopy", ru: "Экспорт в InCopy"}));
		return;
	}
	else if (myCounter == 1) {
		var myEnding = localize({en: " story", ru: " материал"});
	}
	else if (myCounter >= 2 && myCounter <= 4) {
		var myEnding = localize({en: " stories", ru: " материала"});
	}
	else if (myCounter >= 5) {
		var myEnding = localize({en: " stories", ru: " материалов"});
	}
	alert(localize({en: "Exported ", ru: "Экспортировано "}) + myCounter + myEnding + ".", localize({en: "Export Stories to InCopy", ru: "Экспорт в InCopy"}));
}
// ------------------------------------------------
function GetDate() {
	var myDate = new Date();
	if ((myDate.getYear() - 100) < 10) {
		var myYear = "0" + new String((myDate.getYear() - 100));
	} else {
		var myYear = new String ((myDate.getYear() - 100));
	}
	var myDateString = (myDate.getMonth() + 1) + "/" + myDate.getDate() + "/" + myYear + " " + myDate.getHours() + ":" + myDate.getMinutes() + ":" + myDate.getSeconds();
	return myDateString;
 }