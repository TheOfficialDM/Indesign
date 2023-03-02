/* Copyright 2013, Kasyan Servetsky
September 12, 2013
Written by Kasyan Servetsky
http://www.kasyan.ho.com.ua
e-mail: askoldich@yahoo.com */
//======================================================================================
var scriptName = "Make hyperlinks from URLs - 1.0",
set, doc, swatchOK, charStyle,
arr = [],
hypCount = 0,
errorsCount = 0;

CreateDialog();

//===================================== FUNCTIONS  ======================================
function Main() {
	var scope, item, url, text;
	if (app.documents.length == 0) ErrorExit("Please open a document and try again.", true);
	doc = app.activeDocument;
	var startTime = new Date();
	arr.push(doc.name + " - " + GetDate() + "\r");
	
	if (app.selection.length == 0 || (app.selection.length == 1 && app.selection[0].constructor.name == "InsertionPoint")) {
		var answer = confirm("Nothing is selected. The whole document will be processed. Do you want to continue?", false, scriptName);
		if (!answer) exit();
		scope = doc;
	}
	else if (app.selection.length == 1 && (app.selection[0].constructor.name == "TextFrame" || app.selection[0].hasOwnProperty("baseline"))) {
		scope = app.selection[0];
	}
	else {
		ErrorExit("Please select some text and try again, or deselect everything to process the whole document.", true);
	}

	swatchOK = MakeSwatch("===== OK =====", {
		model : ColorModel.PROCESS,
		space : ColorSpace.RGB,
		colorValue : [0, 255, 0]
		});
	
	if (set.charStyle) {
		charStyle = doc.characterStyles.item("Hyperlink");
		if (!charStyle.isValid) {
			charStyle = doc.characterStyles.add({name: "Hyperlink"});
		}
	}

	var foundItems = FindLinksText(scope);
	
	if (foundItems.length > 0) {
		//$.writeln("\r=================\rfoundItems.length = " + foundItems.length);
		for (var i = 0; i < foundItems.length; i++) {
			item = foundItems[i];
			if (item.fillColor == swatchOK) continue;
			url = (set.rbSel == 0) ? item.contents.replace(/(<|>)/g, "") : item.contents;
			//$.writeln(i + " - item = " + item.contents);
			text = GetText(item);
			if (text != null) {
				MakeHyperlink(text, url);
			}
		}
	}

	if (set.eMail) ProcessEmails(scope);

	if (errorsCount > 0) {
		WriteToFile(arr.join("\r") + "\r\r");
	}
	
	var endTime = new Date();
	var duration = GetDuration(startTime, endTime);
	
	var report = hypCount + " hyperlinks " + ((hypCount == 1) ? "was" : "were") + " created. " + ((errorsCount > 0) ? errorsCount + " errors occured." : "") + "\n(time elapsed: " + duration + ")";
	alert("Finished. " + report, scriptName);
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function CreateDialog() {
	GetDialogSettings();
	var w = new Window("dialog", scriptName);
	
	w.p = w.add("panel", undefined, "Process URLs");
	w.p.orientation = "column";
	w.p.alignment = "fill";
	w.p.alignChildren = "left";
	
	//Radio buttons
	w.p.rb0 = w.p.add("radiobutton", undefined, "with angle brackets");
	w.p.rb1 = w.p.add("radiobutton", undefined, "without angle brackets");
	
	w.p2 = w.add("panel", undefined, "After creating a hyperlink");
	w.p2.orientation = "column";
	w.p2.alignment = "fill";
	w.p2.alignChildren = "left";
	
	if (set.rbSel == 0) {
		w.p.rb0.value = true;
	}
	else if (set.rbSel == 1) {
		w.p.rb1.value = true;
	}

	// Checkboxes
	w.p2.cb = w.p2.add("checkbox", undefined, "apply temporary colors");
	w.p2.cb.alignment = "left";
	w.p2.cb.value = set.tempColors;
	
	w.p2.cb3 = w.p2.add("checkbox", undefined, "apply \"Hyperlink\" character style");
	w.p2.cb3.alignment = "left";
	w.p2.cb3.value = set.charStyle;
	
	w.p3 = w.add("panel", undefined, "");
	w.p3.orientation = "column";
	w.p3.alignment = "fill";
	w.p3.alignChildren = "left";
	
	w.p3.cb = w.p3.add("checkbox", undefined, "Process e-mail addresses");
	w.p3.cb.alignment = "left";
	w.p3.cb.value = set.eMail;
	
	// Buttons
	w.buttons = w.add("group");
	w.buttons.orientation = "row";   
	w.buttons.alignment = "center";
	w.buttons.ok = w.buttons.add("button", undefined, "OK", {name:"ok" });
	w.buttons.cancel = w.buttons.add("button", undefined, "Cancel", {name:"cancel"});
	
	var showDialog = w.show();
	
	if (showDialog == 1) {
		if (w.p.rb0.value == true) {
			set.rbSel = 0;
		}
		else if (w.p.rb1.value == true) {
			set.rbSel = 1;
		}
		
		set.tempColors = w.p2.cb.value;
		set.charStyle = w.p2.cb3.value;
		set.eMail = w.p3.cb.value;
		
		app.insertLabel("Kas_" + scriptName, set.toSource());
//~ 		app.insertLabel("Kas_" + scriptName, "");
		
		Main();
	}	
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function GetDialogSettings() {
	set = eval(app.extractLabel("Kas_" + scriptName));
	if (set == undefined) {
		set = { rbSel: 1, tempColors: true, charStyle: false, eMail: true };
	}
	return set;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function ProcessEmails(scope) {
	var item, url;
	
	app.findGrepPreferences = app.changeGrepPreferences = NothingEnum.NOTHING;
	
	if (set.rbSel == 0) {
		app.findGrepPreferences.findWhat = "(?<=<)[-\\u\\l\\d._]+@[-\\u\\l\\d_]+\\.[\\u\\l]{2,4}(?=>)";
	}
	else {
		app.findGrepPreferences.findWhat = "[-\\u\\l\\d._]+@[-\\u\\l\\d_]+\\.[\\u\\l]{2,4}";
	}

	var foundItems = scope.findGrep(true);
	
	for (var i = 0; i < foundItems.length; i++) {
		item = foundItems[i];
		url = (set.rbSel == 0) ? item.contents.replace(/(<|>)/g, "") : item.contents;
		url = "mailto:" +url;
		MakeHyperlinkEmail(item, url);
	}
	
	app.findGrepPreferences = app.changeGrepPreferences = NothingEnum.NOTHING;	
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function FindLinksText(scope) {
	app.findGrepPreferences = app.changeGrepPreferences = NothingEnum.NOTHING;
	
	if (set.rbSel == 0) {
		app.findGrepPreferences.findWhat = "(?<=<).+?(?=>)";
	}
	else {
		app.findGrepPreferences.findWhat = "(?<![@\\-])\\b(?:http://|https://|www\\.)?(?:[a-zA-Z0-9][a-zA-Z0-9._-]*\\.)*[a-zA-Z0-9][a-zA-Z0-9._-]+\\.( ?:[a-zA-Z0-9][a-zA-Z0-9._-]*\\.)*[a-zA-Z]{2,5}[^@]*?(?=(\\. |,|;|:|\\)|]| |\"|'|$))";
	}

	var foundItems = scope.findGrep(true);
	app.findGrepPreferences = app.changeGrepPreferences = NothingEnum.NOTHING;
	
	return foundItems;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function GetText(item) {
	//$.writeln("function GetText ==> " + item.contents);
	app.findGrepPreferences = app.changeGrepPreferences = NothingEnum.NOTHING;
	// URL starts with "www."
	app.findGrepPreferences.findWhat = "(.*)(www\\..+)(\\.au|\\.com|\\.org|\\.gov|\\.int|\\.uk)(.*)";
	app.changeGrepPreferences.changeTo = "$2$3";
	var changedItems = item.changeGrep();
	app.findGrepPreferences = app.changeGrepPreferences = NothingEnum.NOTHING;
	
	if (changedItems.length != 0) {
		return changedItems[0];
	}
	else { // URL starts with "http://"
		app.findGrepPreferences.findWhat = "(https?://)(.+)(\\.au|\\.com|\\.org|\\.gov|\\.int|\\.uk)(.*)";
		app.changeGrepPreferences.changeTo = "$2$3";
		var changedItems = item.changeGrep();
		app.findGrepPreferences = app.changeGrepPreferences = NothingEnum.NOTHING;
		
		if (changedItems.length != 0) {
			return changedItems[0];
		}
		else {
			return null;
		}
	}
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function MakeHyperlinkEmail(text, url) {
	var name = text.contents;
	var oriName = name;

	if (doc.hyperlinks.itemByName(name) != null) {
		var increment = 1;
		while (doc.hyperlinks.itemByName(name) != null) {
			name = oriName + " (" + increment++ + ")";
		}
	}
	
	try {
		var dest = doc.hyperlinkURLDestinations.itemByName(name);
		if (!dest.isValid) {
			dest = doc.hyperlinkURLDestinations.add(url , {hidden: true});
		}
		var source = doc.hyperlinkTextSources.add(text);
		var hyperlink = doc.hyperlinks.add(source, dest, {highlight: HyperlinkAppearanceHighlight.NONE, visible: false});
		
		try {
			hyperlink.name = name;
		}
		catch(err) {
			//$.writeln(err.message + ", line: " + err.line);
		}
		
		if (hyperlink.isValid) {
			hypCount++;
			if (set.tempColors) source.sourceText.fillColor = swatchOK;
			if (set.charStyle) source.appliedCharacterStyle = charStyle;
		}
	}
	catch(err) {
		errorsCount++;
		
		var swatchProblem = MakeSwatch("===== PROBLEM =====", {
			model : ColorModel.PROCESS,
			space : ColorSpace.RGB,
			colorValue : [255, 0, 0]
			});
		
		text.fillColor = swatchProblem;
		
		//$.writeln("Error message: " + err.message + ", Line: " + err.line + ", URL: " + url);
		arr.push("Error message: " + err.message + ", Line: " + err.line + ", URL: " + url);		
	}
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function MakeHyperlink(text, url) {
	if (url.match(/https?:\/\//) == null) {
		url = "http://" + url;
	}

	url = url.replace(/\.$/, "");
	
	var name = text.contents;
	
	var oriName = name;

	if (doc.hyperlinks.itemByName(name) != null) {
		var increment = 1;
		while (doc.hyperlinks.itemByName(name) != null) {
			name = oriName + " (" + increment++ + ")";
		}
	}
	
	try {
		var dest = doc.hyperlinkURLDestinations.itemByName(name);
		if (!dest.isValid) {
			dest = doc.hyperlinkURLDestinations.add(url , {hidden: true});
		}
		var source = doc.hyperlinkTextSources.add(text);
		var hyperlink = doc.hyperlinks.add(source, dest, {highlight: HyperlinkAppearanceHighlight.NONE, visible: false});
		
		try {
			hyperlink.name = name;
		}
		catch(err) {
			//$.writeln(err.message + ", line: " + err.line);
		}
		
		if (hyperlink.isValid) {
			hypCount++;
			if (set.tempColors) source.sourceText.fillColor = swatchOK;
			if (set.charStyle) source.appliedCharacterStyle = charStyle;
		}
	}
	catch(err) {
		errorsCount++;
		
		var swatchProblem = MakeSwatch("===== PROBLEM =====", {
			model : ColorModel.PROCESS,
			space : ColorSpace.RGB,
			colorValue : [255, 0, 0]
			});
		
		text.fillColor = swatchProblem;
		
		//$.writeln("Error message: " + err.message + ", Line: " + err.line + ", URL: " + url);
		arr.push("Error message: " + err.message + ", Line: " + err.line + ", URL: " + url);		
	}
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function WriteToFile(text) {
	var file = new File("~/Desktop/" + scriptName + " - Errors.txt");
	file.encoding = "UTF-8";
	if (file.exists) {
		file.open("e");
		file.seek(0, 2);
	}
	else {
		file.open("w");
	}
	file.write(text); 
	file.close();
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function GetDate() {
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
function GetDuration(startTime, endTime) {
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
function ErrorExit(error, icon) {
	alert(error, scriptName, icon);
	exit();
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function MakeSwatch(name, properties) {
	var swatch = doc.swatches.itemByName(name);
	if (!swatch.isValid) {
		swatch = doc.colors.add({name: name});
		if (properties != undefined) swatch.properties = properties;
	}
	return swatch;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------