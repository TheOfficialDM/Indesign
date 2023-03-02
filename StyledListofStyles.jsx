//DESCRIPTION: List paragraph styles in their style
(function() {
	if (app.documents.length > 0) {
		processDocument(app.documents[0]);
		}
			function processDocument(aDoc) {
			var page = aDoc.pages[0];
			var bounds = page.bounds;
			var theTF = page.textFrames.add({geometricBounds: bounds});
			var theStory = theTF.parentStory;
			theTF.move(undefined, [bounds[1] - bounds[3], 0]);
			var paraStyles = aDoc.allParagraphStyles.sort();
			for (var j = 0; paraStyles.length > j; j++) {
			theStory.insertionPoints[-1].contents = paraStyles[j].name;
			theStory.paragraphs[-1].appliedParagraphStyle = paraStyles[j];
			theStory.insertionPoints[-1].contents = "\r";
		}
	}
}())
