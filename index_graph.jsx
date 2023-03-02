/*
	Create a bar graph of a document's index locator distribution
	Peter Kahrel
*/

#targetengine indexgraph

var horizontal = false;
var barWidth = 2;  // The thickness of each bar
var multiply = 5;   // The length of each bar
var folioList = [];
var mostFrequent = 0;

function getDocumentList (doc) {
	if (!doc.indexes.length) return;
	var i, j, page;
	var topics = doc.indexes[0].allTopics;
	var pages = doc.pages.everyItem().getElements();
	var tLength = topics.length;
	
	// Initialise the document's page range
	for (i = 0; i < pages.length; i++) {
		folioList[pages[i].name] = 0;
	}

	for (i = tLength-1; i >= 0; i--) {
		for (j = topics[i].pageReferences.length-1; j >= 0; j--) {
			try {
				page = topics[i].pageReferences[j].sourceText.parentTextFrames[0].parentPage.name;
				folioList[page]++;
			} catch (_) {
			}
		}
	}
}


function createList () {
	if (!app.books.length) {
		getDocumentList (app.documents[0]);
	} else {
		var docs = app.books[0].bookContents.everyItem().getElements();
		for (var i = 0; i < docs.length; i++) {
			app.open (app.books[0].bookContents[i].fullName);
			getDocumentList (app.documents[0]);
		}
	}
}


function convertList () {
	var list = [];
	for (var i in folioList) {
		list.push ({folio: i, count: folioList[i]});
		mostFrequent = Math.max (mostFrequent, folioList[i]);
	}
	return list;
}


//--------------------------------------------------------------------------------------------------------------------------------------

function main () {
	app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
	var offset = barWidth/2;

	function drawBar (n /*page name*/, count, vpos) {
		with (graph.pages[0].graphicLines.add ({strokeWeight: barWidth, name: String(n) + ' ('+count+')'})) {
			paths[0].entirePath = [[0, vpos], [count*multiply, vpos]];
		}
	}

	createList();
	var folioList = convertList();
	
	if (!folioList.length) {
		alert ('No index found.', 'Index graph', true);
		exit();
	}

	var graph = app.documents.add ({
		documentPreferences: {facingPages: false, pageWidth: mostFrequent*multiply, pageHeight: barWidth*folioList.length}
	});

	graph.pages[0].marginPreferences.properties = {top: 0, left: 0, bottom: 0, right: 0};

	for (var i = folioList.length-1; i >= 0; i--) {
		drawBar (folioList[i].folio, folioList[i].count, (i+1)*barWidth-offset)
	}

	if (horizontal) {
		if (app.windows[0].transformReferencePoint !== AnchorPoint.TOP_LEFT_ANCHOR) {
			app.windows[0].transformReferencePoint = AnchorPoint.TOP_LEFT_ANCHOR;
		}
		var group = graph.pages[0].groups.add (app.documents[0].pages[0].allPageItems);
		graph.documentPreferences.properties = {pageWidth: graph.documentPreferences.pageHeight, pageHeight: graph.documentPreferences.pageWidth}
		group.move ([0, graph.documentPreferences.pageHeight]);
		group.rotationAngle = 90;
	}
}

main();
