/* Copyright 2019, Kasyan Servetsky
November 5, 2019,
Written by Kasyan Servetsky
http://www.kasyan.ho.com.ua
e-mail: askoldich@yahoo.com */
//======================================================================================
var scriptName = "Package book for print",
activeBook;

PreCheck();

//===================================== FUNCTIONS ======================================
function Main() {
	try { // if something goes wrong in the try-catch block, the batch processor won't stop here. It will log the error message and continue further
		var bookBasicName = activeBook.name.replace(/\.indb$/, ""), // remove the extension from the document's name
		archiveFolderPath = activeBook.filePath.absoluteURI, // the path to the folder where the active document is located
		packageFolderPath = archiveFolderPath + "/" + bookBasicName, // the path to the package folder
		packageFolder = new Folder(packageFolderPath); // the reference to the package folder
		if (!packageFolder.exists) packageFolder.create(); // create if it doesn't exist yet
			
		var result = activeBook.packageForPrint(
						packageFolder, // to - File - The folder, alias, or path in which to place the packaged files.
						true, // copyingFonts - Boolean - If true, copies fonts used in the document to the package folder.
						true, // copyingLinkedGraphics - Boolean - If true, copies linked graphics files to the package folder. 
						false, // copyingProfiles - Boolean - If true, copies color profiles to the package folder. 
						true, // updatingGraphics - Boolean - If true, updates graphics links to the package folder. 
						true, // includingHiddenLayers - Boolean - If true, copies fonts and links from hidden layers to the package. 
						true, // ignorePreflightErrors - Boolean - If true, ignores preflight errors and proceeds with the packaging. If false, cancels the packaging when errors exist. 
						false, // creatingReport - Boolean - If true, creates a package report that includes printing instructions, print settings, lists of fonts, links and required inks, and other information. 
						true, // includeIdml - Boolean - If true, generates and includes IDML in the package folder. (Optional)
						true, // includePdf - Boolean - If true, generates and includes PDF in the package folder. (Optional)
						"[High Quality Print]", // pdfStyle - String - If specified and PDF is to be included, use this style for PDF export if it is valid, otherwise use the last used PDF preset. (Optional)
						false, // useDocumentHyphenationExceptionsOnly - Boolean - If this option is selected, InDesign flags this document so that it does not reflow when someone else opens or edits it on a computer that has different hyphenation and dictionary settings. (Optional)
						undefined, // versionComments - String - The comments for the version. (Optional) 
						undefined // forceSave - Boolean - If true, forcibly saves a version. (Optional) (default: false) 
					);
			
		if (result) {
			alert("The book was successfully packaged. ", scriptName, false);
		}
		else {
			alert("Something went wrong: the book was not packaged.", scriptName, true);
		}
	}
	catch(err) {
		alert(err.message + ", line: " + err.line, scriptName, true);
	}
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function CheckBook() {
	var bookContent;
	var missingDocs = [];
	
	for (var i = 0; i < activeBook.bookContents.length; i++) {
		bookContent = activeBook.bookContents[i];
		if (bookContent.status == BookContentStatus.MISSING_DOCUMENT) {
			missingDocs.push(bookContent.name);
		}
	}
	
	if (missingDocs != 0) ErrorExit("The active book contains " + missingDocs.length + " missing document" + ((missingDocs.length === 1) ? ": " : "s: ") + missingDocs.join(", "), true);	
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function PreCheck() {
	if (app.books.length.length == 0) ErrorExit("Please open a book and try again.", true);
	activeBook = app.activeBook;
	CheckBook();
	Main();
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function ErrorExit(error, icon) {
	alert(error, scriptName, icon);
	exit();
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------