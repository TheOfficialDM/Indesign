/* Here is a working Javascript to do the word gathering and sorting. There are straightforward ways to do this, but my script uses a couple of shortcuts that are possible with both Javascript (split arrays on a regular expression; remove duplicates by feeding the result into an object) and InDesign (using everyItem to quickly gather all possible text). So it may be kind of unclear what happens where 
A problem (as you may have already have found out by yourself) is how to determine what a 'word' is. This script replaces common punctuation and digits with a space, and then only gathers what's left between the spaces. You are sure to find some weird "words" this way, but then again so does your manual way.
After processing, the script prompts for a Save File name and then opens it in your default plain text editor. */

if (app.documents.length == 0) {
	alert("Please open a document and try again.");
	exit();
}

textList = app.activeDocument.stories.everyItem().texts.everyItem().contents.join('\r');
textList = textList.replace(/[.,:;!?()\/\d\[\]]+/g, ' ');
textList = textList.split(/\s+/);
tmpList = {};
for (i=0; i<textList.length; i++)
tmpList[textList[i]] = true;
resultList = [];
i = 0;
for (j in tmpList)
resultList[i++] = j;
resultList.sort();
defaultFile = new File (Folder.myDocuments+"/"+app.activeDocument.name.replace(/\.indd$/i, '')+".txt");
if (File.fs == "Windows")
	writeFile = defaultFile.saveDlg( 'Save list', "Plain text file:*.txt;All files:*.*" );
else
	writeFile = defaultFile.saveDlg( 'Save list');
if (writeFile != null)
{
	if (writeFile.open("w"))
	{
		writeFile.encoding = "utf8";
		writeFile.write (resultList.join("\r")+"\r");
		writeFile.close();
		writeFile.execute();
	}
}