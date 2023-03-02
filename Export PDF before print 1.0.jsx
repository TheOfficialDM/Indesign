#targetengine "Kasyan"

var eventListener = app.addEventListener("beforePrint", exportPDF, false);     

function exportPDF(event) {
	try {
		var doc = event.parent;
		var pdfFile = new File("~/Desktop/" + doc.name.replace(/indd$/, "pdf"));
		var pdfPreset = app.pdfExportPresets.itemByName("[High Quality Print]");
		doc.asynchronousExportFile(ExportFormat.PDF_TYPE, pdfFile, false, pdfPreset);
	}
	catch(err) {
		$.writeln(err.message + ", line: " + err.line);
	}
} 