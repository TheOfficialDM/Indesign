// Written by Kasyan Servetsky
// August 30, 2011
// http://www.kasyan.ho.com.ua
// e-mail: askoldich@yahoo.com
// List of all paragraph styles and character styles, showing the font, font size and leading.
//===============================================================
if (app.documents.length == 0) ErrorExit("Please open a document and try again.");

const gScriptName = "List paragraph and character styles"; // Name of the script
const gScriptVersion = "1.0"; // Version
var gDoc = app.activeDocument;

Main();

//======================= FUNCTIONS  ============================
function Main() {
	var ps, cs;
	var txt = "Paragraph styles:\r#;Style name;Font name;Font size;Leading\r"
	var parStyles = gDoc.allParagraphStyles;
	for (var p = 0; p < parStyles.length; p++) {
		ps = parStyles[p];
		txt = txt + (p+1) + ";" + ps.name + ";" + ps.appliedFont.postscriptName + ";" + ps.pointSize + ";" + ((ps.leading == 1635019116) ? "Auto" : ps.leading) + "\r";
	}
	var charStyles = gDoc.allCharacterStyles;
	txt = txt + "\rCharacter styles:\r#;Style name;Font name;Font style;Font size;Leading\r";
	for (var c = 0; c < charStyles.length; c++) {
		cs = charStyles[c];
		txt = txt + (c+1) + ";" + cs.name + ";" + ((cs.appliedFont == "") ? "Not set" : cs.appliedFont)  + ";" + ((cs.fontStyle ==1851876449 ) ? "Not set" : cs.fontStyle)+ ";" + ((cs.pointSize == 1851876449) ? "Not set" : cs.pointSize) + ";" + ((cs.leading == 1851876449) ? "Not set" : cs.leading) + "\r";
	}
	WriteToFile(txt);
}
//--------------------------------------------------------------------------------------------------------------
function WriteToFile(text) {
	file = new File("~/Desktop/Paragraph and character styles.csv");
	file.encoding = "UTF-8";
	file.open("w");
	file.write(text); 
	file.close();
	file.execute();
}
//--------------------------------------------------------------------------------------------------------------
function ErrorExit(error, icon) {
	alert(error, gScriptName + " - " + gScriptVersion, icon);
	exit();
}
//--------------------------------------------------------------------------------------------------------------