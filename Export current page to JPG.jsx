/* Copyright 2013, Kasyan Servetsky
July 27, 2013
Written by Kasyan Servetsky
http://www.kasyan.ho.com.ua
e-mail: askoldich@yahoo.com */
//======================================================================================
var scriptName = "Export current page to JPG - 1.0";

Main();

//===================================== FUNCTIONS  ======================================
function Main() {
	if (app.documents.length == 0) ErrorExit("Please open a document and try again.", true);
	var doc = app.activeDocument;
	
	if (app.activeWindow.constructor.name != "LayoutWindow") ErrorExit("Unable to get page number. Quit story editor.", true);
	
	var page = app.activeWindow.activePage;
	
	with (app.jpegExportPreferences) {
		exportingSpread = false;
		jpegExportRange = ExportRangeOrAllPages.EXPORT_RANGE;
		pageString = page.name;
		exportResolution = 300; // The export resolution expressed as a real number instead of an integer. (Range: 1.0 to 2400.0)
		antiAlias = true; //  If true, use anti-aliasing for text and vectors during export
		embedColorProfile = false; // True to embed the color profile, false otherwise
		jpegColorSpace = JpegColorSpaceEnum.RGB; // One of RGB, CMYK or GRAY
		jpegQuality = JPEGOptionsQuality.HIGH; // The compression quality: LOW / MEDIUM / HIGH / MAXIMUM
		jpegRenderingStyle = JPEGOptionsFormat.BASELINE_ENCODING; // The rendering style: BASELINE_ENCODING or PROGRESSIVE_ENCODING
		simulateOverprint = false; // If true, simulates the effects of overprinting spot and process colors in the same way they would occur when printing
		useDocumentBleeds = false; // If true, uses the document's bleed settings in the exported JPEG.
	}
	
	var fileName = doc.name.replace(/\.indd$/, "") + "_" + GetDate() + ".jpg";
	var file = new File("~/Desktop/" + fileName);

	doc.exportFile(ExportFormat.JPG, file);
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
	var dateString = (date.getMonth() + 1) + "-" + date.getDate() + "-" + year + "_" + date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds();
	return dateString;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function ErrorExit(error, icon) {
	alert(error, scriptName, icon);
	exit();
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------