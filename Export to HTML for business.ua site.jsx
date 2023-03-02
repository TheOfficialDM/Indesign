var scriptName = "Export to HTML for business.ua site",
doc,
debugMode = false, // for debugging only
args = [],
calledFromBatchProcessor = (typeof arguments != "undefined" && CalledFromBatchProcessor()) ? true : false;

if (calledFromBatchProcessor) { //  // called as a 'secondary' script from the batch processor
	args = NormalizeArgs(arguments);
	doc = app.activeDocument;
	Main();
}
else { // called as a 'regular' script
	PreCheck();
}

//===================================== FUNCTIONS =======================================
function Main() {
	try {
		var p = [
					["Заголовок Статьи", "EPUB", "h1", "", ""],
					["Подраздел", "EPUB", "h4", "", ""],
					["Интервью вопрос", "EPUB", "strong", "", ""],
					["Subheader", "EPUB", "h2", "", ""]
					];
		
		var c = [
					["Bold", "EPUB", "strong", "", ""],
					["Italic", "EPUB", "em", "", ""],
					["Bold Italic", "EPUB", "boldit", "", ""],
					["Regular Italic", "EPUB", "em", "", ""],
					["Light Italic", "EPUB", "em", "", ""],
					["Medium Italic", "EPUB", "em", "", ""],
					["Black Italic", "EPUB", "boldit", "", ""],
					["Black", "EPUB", "strong", "", ""]
					];
					
		UnlinkIncopy();
		ProtectLocalStyling();
		TagStyles(p, true);
		TagStyles(c, false);
		ExportHTML();
	}
	catch(err) { // if an error occurs, catch it and write the  document's name, error message and line# where it happened into the log
		if (calledFromBatchProcessor) g.WriteToFile("ERROR: " + doc.name + " - " + err.message + ", Line: " + err.line + ", Time: " + GetTime());
		if (debugMode) $.writeln(err.message + ", line: " + err.line); // in debugMode -- write the error message and line# to ESTK console
	}
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function TagStyles(list, parStyles) {
	var style, map, item;
	var styles = (parStyles) ? doc.allParagraphStyles : doc.allCharacterStyles;

	for (var i = 0; i < list.length; i++) {
		item = list[i];
		
		for (var j = 0; j < styles.length; j++) {
			style = styles[j];
			if (style.name.match(/^\[.+\]$/) != null) continue;
			
			if (style.name == item[0]) {
				if (style.styleExportTagMaps.length == 0) {
					map = style.styleExportTagMaps.add({exportType: item[1], exportTag: item[2], exportClass: item[3], exportAttributes: item[4]});
				}			
				
				break;
			}
		}
	}
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function ProcessFile(file) {
	file.open("r"); 
	var txt = file.read();
	file.close();

	txt = txt.replace(/<\/*span>/g, "");
	txt = txt.replace(/(<boldit>)(.+?)(<\/boldit>)/g, "<em><strong>$2</strong></em>");
	txt = txt.replace(/\slang=".{2}-.{2}"/g, "");
	txt = txt.replace(/^\s+/gm, "");
	txt = txt.replace(/<br\s\/>/g, "");
	txt = txt.replace(/<img\ssrc=.+?\/>\s*/g, "");
	txt = txt.replace(/^<!DOCTYPE html>(\s.+)+\s+<body.+>\s+/m);
	txt = txt.replace(/<\/body>\s<\/html>\s+/m);
	txt = txt.replace(/<p>\.[А-Я]<\/p>\s/g, "");
	txt = txt.replace(/undefined/g, "");
	txt = txt.replace(/<a.+<\/a>/g, "");
	txt = txt.replace(/&#160;/g, " ");
	txt = txt.replace(/&#173;/g, "");
	
	file.open("w");
	file.encoding = "UTF-8";
	file.write(txt);
	file.close();
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function ExportHTML() {
	with (doc.htmlExportPreferences) {
		exportSelection = false;
		exportOrder = ExportOrder.LAYOUT_ORDER;
		generateCascadeStyleSheet = false;
		includeClassesInHTML = false;
		imageConversion = ImageConversion.AUTOMATIC;
		imageExportResolution = ImageResolution.PPI_150;
		jpegOptionsFormat = JPEGOptionsFormat.BASELINE_ENCODING;
		jpegOptionsQuality = JPEGOptionsQuality.HIGH;
		numberedListExportOption = NumberedListExportOption.ORDERED_LIST;
		preserveLayoutAppearence = true;
		viewDocumentAfterExport = false;
		preserveLocalOverride = true;
	}
	
	var path = doc.fullName.absoluteURI.replace(/indd$/, "html");
	var file = new File(path);
	doc.exportFile(ExportFormat.HTML, file);
	
	if (file.exists) {
		ProcessFile(file);
	}
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function ProtectLocalStyling() {
	var fontStyle, charStyle, foundItems, foundItem, notApplied,
	styles = ["Italic", "Bold", "Bold Italic", "Light", "Light Italic", "Book", "Regular Italic", "Medium", "Medium Italic", "Black", "Black Italic", "Semibold", "Semibold Italic"],
	noCharStyle = doc.characterStyles[0];
	
	for (var j = styles.length - 1; j >= 0; j--) {
		fontStyle = styles[j];
		charStyle = doc.characterStyles.item(fontStyle);

		app.findTextPreferences = app.changeTextPreferences = NothingEnum.NOTHING;
		app.findTextPreferences.appliedCharacterStyle = noCharStyle;
		app.findTextPreferences.fontStyle = fontStyle;
		foundItems = doc.findText();

		for (var i = 0; i < foundItems.length; i++) {
			foundItem = foundItems[i];
			notApplied = CheckParStyle(foundItem, fontStyle);
			
			if (notApplied) {
				if (!charStyle.isValid) charStyle = doc.characterStyles.add({name: fontStyle, fontStyle: fontStyle}); 
				foundItem.applyCharacterStyle(charStyle);
			}
		}
	}

	app.findTextPreferences = app.changeTextPreferences = NothingEnum.NOTHING;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function CheckParStyle(txt, fontStyle) {
	var appliedFontStyle = txt.appliedParagraphStyle.fontStyle;

	if (appliedFontStyle == fontStyle) {
		return false;
	}

	return true;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function UnlinkIncopy() {
	var link,
	links = doc.links;
	
	for (var i = links.length - 1; i >= 0; i--) {
		link = links[i];
		
		if (link.status == LinkStatus.LINK_OUT_OF_DATE) {
			link.update();
		}
		
		if (link.linkType == "InCopyMarkup") {
			link.unlink();
		}
	}
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function PreCheck() {
	if (app.documents.length == 0) ErrorExit("Please open a document and try again.", true);
	doc = app.activeDocument;
	if (doc.converted) ErrorExit("The current document has been modified by being converted from older version of InDesign. Please save the document and try again.", true);
	if (!doc.saved) ErrorExit("The current document has not been saved since it was created. Please save the document and try again.", true);
	Main();
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
function ErrorExit(error, icon) { // Something went totally wrong.
	alert(error, scriptName, icon); // Give a warning
	exit(); // and stop the script
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------