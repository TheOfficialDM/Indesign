var template = File.openDialog ("Select template","Templates:*.indt",false);
var myDocument = app.open(template);
myDocument.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.POINTS;
myDocument.viewPreferences.verticalMeasurementUnits = MeasurementUnits.POINTS;

function addPageWithTextbox() {
	var myNewPage = myDocument.pages.add();
	var myMargin = myNewPage.marginPreferences;
	var myPageWidth = myDocument.documentPreferences.pageWidth;
	var myPageHeight = myDocument.documentPreferences.pageHeight
	
	// TLBR
	var myBoxBounds1 = [
		myMargin.top,
		myMargin.left,
		myPageHeight - myMargin.bottom,
		myPageWidth/2
	];
	var myBoxBounds2 = [
		myMargin.top,
		myPageWidth/2,
		myPageHeight - myMargin.bottom,
		myPageWidth - myMargin.right
	];
	
	var myOldRuler = myDocument.viewPreferences.rulerOrigin;
	myDocument.viewPreferences.rulerOrigin = RulerOrigin.pageOrigin;
	
	var myLeftFrame = myDocument.pages[-1].textFrames.add();
	var myRightFrame = myDocument.pages[-1].textFrames.add();
	
	with(myLeftFrame) {
		geometricBounds = myBoxBounds1;
		previousTextFrame = myDocument.pages[-2].textFrames[0];
	}
	with(myRightFrame) {
		geometricBounds = myBoxBounds2;
		previousTextFrame = myLeftFrame;
	}

	myDocument.viewPreferences.rulerOrigin = myOldRuler;
	return myRightFrame;
}

var myPages = myDocument.pages;
while (myPages.length > 1) {
	myPages[-1].remove();
}

addPageWithTextbox();
myPages[1].remove();

var file = File.openDialog ("Select content markdown" , "Markdown:*.md", false );
file.encoding = "UTF-8";

var myFirstTextframe = myDocument.pages[0].textFrames[0];
myFirstTextframe.place(file, true);

function addThreadedPage() {
	var myNewTextFrame = addPageWithTextbox();
	return myNewTextFrame;
}

function addressOverflow(lastFrame) {
    if (lastFrame.overflows === true) {
		var myNewTextFrame = addThreadedPage();
		return addressOverflow(myNewTextFrame);
    } else {
		return lastFrame;
	}
}

var lastFrame = addressOverflow(myFirstTextframe);

function myProcessMarkdown(frame) {
	frame.select();
	var myFile = new File (app.activeScript.parent.fsName + '/markdownID.jsx');
	app.doScript(myFile);
}

myProcessMarkdown(lastFrame);
addressOverflow(lastFrame);
addPageWithTextbox ();

var myBounds = [0, -100, 100, -10]; // TLBR
var myNewTextFrame = myDocument.pages[-1].textFrames.add();
with(myNewTextFrame) {
	geometricBounds = myBounds;
}

var myNewText = "#markdown\nh1 = H1 Catalog";
myNewTextFrame.parentStory.insertionPoints.item(-1).contents = myNewText;

function getWidth(/*PageItem*/obj, /*bool*/visible)
// return the [width,height] of <obj>
// according to its (geometric|visible)Bounds
{
var boundsProperty = ((visible)?'visible':'geometric')+'Bounds';
var b = obj[boundsProperty];
// width=right-left
return b[3]-b[1];
}

function adjustTableWidths(relWidths) {
	for(var T=0; T < myDocument.textFrames.length; T++){
		var frameWidth = getWidth(myDocument.textFrames[T], true);
		for(var i=0; i < myDocument.textFrames[T].tables.length; i++){
			if(myDocument.textFrames[T].tables[i].columns.length == relWidths.length) {
				for(var j=0; j < relWidths.length; j++){
					var colWidth = frameWidth * (relWidths[j] / 100);
					myDocument.textFrames[T].tables[i].columns[j].width = colWidth;
				}
			}
		}
	}
}

adjustTableWidths([50,50]);

adjustTableWidths([26,54,20]);