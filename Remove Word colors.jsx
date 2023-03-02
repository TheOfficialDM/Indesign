main();

function main() {
	var swatch,
	doc = app.activeDocument,
	count = 0,
	nonCMYK = [],
	swatches = doc.swatches;

	for (var i = swatches.length - 1; i >= 0; i--) {
		swatch = swatches[i];
		//$.writeln(i + " - " + swatch.name);

		if (swatch.name.match(/^Word/i) != null && swatch.space == ColorSpace.RGB) {
			swatch.remove(doc.swatches.itemByName("Black"));
			count++;
		}
		else if (swatch.hasOwnProperty("space") && swatch.space != ColorSpace.CMYK) {
			nonCMYK.push(swatch.name);
		}
	}
	
	if (count > 0) alert("Removed " + count + " word colors", "Remove Word colors", false);
	if (nonCMYK.length > 0) alert("Found " + nonCMYK.length + " non CMYK colors:\r" + nonCMYK.join("\r"), "Remove Word colors", false);
	
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
/*

*/
