Main();

function Main() {
	// The platform-specific full path name for the xlsx-file -- fsName
	// If you pass it as a string, make sure to double the backslashes in the path like in the line below
	var excelFilePath = "Macintosh HD:My Folder:SampleBook.xlsx";
	
	// [Optional] the character to use for splitting the rows in the spreadsheed.
	// If it isn't set, pipe (|) will be used by default	
	var splitCharRows = "|";
	
	// [Optional] the character to use for splitting the columns in the spreadsheed: e.g. semicolon (;) or tab (\t)
	// If it isn't set, semicolon will be used by default
	var splitCharColumns = ";";
	
	// [Optional] the worksheet number: either string or number. If it isn't set, the first worksheet will be used by default
	var sheetNumber = "1";
	
	 // Returns an array in case of success; null -- if something went wrong: e.g. called on PC, too old version of InDesign.
	var data = GetDataFromExcelMac(excelFilePath, splitCharRows, splitCharColumns, sheetNumber);
}

function GetDataFromExcelMac(excelFilePath, splitCharRows, splitCharColumns, sheetNumber) {
	if (File.fs != "Macintosh") return null;
	if (typeof splitCharRows === "undefined") var splitCharRows = "|";
	if (typeof splitCharColumns === "undefined") var splitCharColumns = ";";
	if (typeof sheetNumber === "undefined") var sheetNumber = "1";

	var appVersion,
	appVersionNum = Number(String(app.version).split(".")[0]);
	
	switch (appVersionNum) {
		case 17:
			appVersion = "2022";
			break;		
		case 16:
			appVersion = "2021";
			break;		
		case 15:
			appVersion = "2020";
			break;
		case 14:
			appVersion = "CC 2019";
			break;
		case 13:
			appVersion = "CC 2018";
			break;
		case 12:
			appVersion = "CC 2017";
			break;
		case 11:
			appVersion = "CC 2015";
			break;
		case 10:
			appVersion = "CC 2014";
			break;			
		case 9:
			appVersion = "CC";
			break;		
		case 8:
			appVersion = "CS 6";
			break;
		case 7:
			if (app.version.match(/^7\.5/) != null) {
				appVersion = "CS 5.5";
			}
			else {
				appVersion = "CS 5";
			}
			break;
		case 6:
			appVersion = "CS 4";
			break;
		case 5:
			appVersion = "CS 3";
			break;
		case 4:
			appVersion = "CS 2";
			break;
		case 3:
			appVersion = "CS";
			break;			
		default:
		return null;
	}

	var as = 'tell application "Microsoft Excel"\r';
	as += 'open file \"' + excelFilePath + '\"\r';
	as += 'set theWorkbook to active workbook\r';
	as += 'set theSheet to sheet ' + sheetNumber + ' of theWorkbook\r';
	as += 'set theMatrix to value of used range of theSheet\r';
	as += 'set theRowCount to count theMatrix\r';
	as += 'set str to ""\r';
	as += 'set oldDelimiters to AppleScript\'s text item delimiters\r';
	as += 'repeat with countRows from 1 to theRowCount\r';
	as += 'set theRow to item countRows of theMatrix\r';
	as += 'set AppleScript\'s text item delimiters to \"' + splitCharColumns + '\"\r';
	as += 'set str to str & (theRow as string) & \"' + splitCharRows + '\"\r';
	as += 'end repeat\r';
	as += 'set AppleScript\'s text item delimiters to oldDelimiters\r';
	as += 'close theWorkbook saving no\r';
	as += 'end tell\r';
	as += 'tell application "Adobe InDesign ' + appVersion + '\"\r';
	as += 'tell script args\r';
	as += 'set value name "excelData" value str\r';
	as += 'end tell\r';
	as += 'end tell';
	
	if (appVersionNum > 5) { // CS4 and above
		app.doScript(as, ScriptLanguage.APPLESCRIPT_LANGUAGE, undefined, UndoModes.ENTIRE_SCRIPT);
	}
	else { // CS3 and below
		app.doScript(as, ScriptLanguage.APPLESCRIPT_LANGUAGE);
	}

	var str = app.scriptArgs.getValue("excelData");
	app.scriptArgs.clear();
	
	var tempArrLine, line,
	data = [],
	tempArrData = str.split(splitCharRows);
	
	for (var i = 0; i < tempArrData.length; i++) {
		line = tempArrData[i];
		if (line == "") continue;
		tempArrLine = line.split(splitCharColumns);
		data.push(tempArrLine);
	}
	
	return data;
}