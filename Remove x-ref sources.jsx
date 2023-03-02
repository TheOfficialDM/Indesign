Main();

function Main() {
	var xRefSource, i,
	count = 0,
	doc = app.activeDocument;

	for (i = doc.crossReferenceSources.length-1; i >= 0; i--) {
		xRefSource = doc.crossReferenceSources[i];
		xRefSource.remove();
		count++;
	}

	alert(count + " x-ref sources were removed.\r" + doc.crossReferenceSources.length + " x-ref sources left.", "Remove x-ref sources");
}