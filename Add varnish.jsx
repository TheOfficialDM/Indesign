/* Copyright 2020, Kasyan Servetsky
May 27, 2020
Written by Kasyan Servetsky
http://www.kasyan.ho.ua
e-mail: askoldich@yahoo.com */
//======================================================================================
var scriptName = "Add varnish",
doc;

PreCheck();

//===================================== FUNCTIONS ======================================
function Main() {
	try {
		var txt,
		doc = app.activeDocument,
		n = "Varnish",
		swatch = MakeColor(n, ColorSpace.CMYK, ColorModel.SPOT, [0, 10, 40, 0]),
		layer = MakeLayer(n),
		frames = layer.textFrames,
		count = 0;
		
		for (var i = 0; i < frames.length; i++) {
			txt = frames[i].texts[0];
			
			with (txt) {
				strokeWeight = "0.25 pt";
				strokeColor = swatch;
				fillColor = swatch;
				overprintFill = true;
				overprintStroke= true;
			}
			
			count++;
		}
	
		var report = "Processed " + count + " text frame" + ((count == 1) ? "" : "s");
		alert(report, scriptName);
	}
	catch(err) {
		alert("ERROR: " + err.message + ", line: " + err.line, scriptName, true);
	}
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function MakeColor(colorName, colorSpace, colorModel, colorValue) {
	var doc = app.activeDocument;
	var color = doc.colors.item(colorName);
	if (!color.isValid) {
		color = doc.colors.add({name: colorName, space: colorSpace, model: colorModel, colorValue: colorValue});
	}
	return color;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function MakeLayer(name, layerColor) {
	var layer = doc.layers.item(name);
	if (!layer.isValid) {
		layer = doc.layers.add({name: name});
		if (layerColor != undefined) layer.layerColor = layerColor;
	}
	return layer;
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