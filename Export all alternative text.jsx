// DESCRIPTION: Export all alternative text into a single txt -file on your desktop.
var scriptName = "Export all alternative text",
doc, images;

PreCheck();

//===================================== FUNCTIONS ======================================
function Main() {
	var arr = [];

	for (var i = 0; i < images.length; i++) {
		arr.push(images[i].itemLink.name + "\n" + images[i].parent.objectExportOptions.customAltText + "\n\n");
	}
	
	var str = arr.join("\r");
	WriteToFile(str);
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function WriteToFile(text) {
	file = new File("~/Desktop/AltText.txt");
	file.encoding = "UTF-8";
	file.open("w");
	file.write(text); 
	file.close();
	file.execute();
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function PreCheck() {
	if (app.documents.length == 0) ErrorExit("Please open a document and try again.", true);
	doc = app.activeDocument;
	if (doc.converted) ErrorExit("The current document has been modified by being converted from older version of InDesign. Please save the document and try again.", true);
	if (!doc.saved) ErrorExit("The current document has not been saved since it was created. Please save the document and try again.", true);
	images = doc.allGraphics;
	if (images.length == 0) ErrorExit("No images in this file.", true);
	Main();
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function ErrorExit(error, icon) {
	alert(error, scriptName, icon);
	exit();
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------