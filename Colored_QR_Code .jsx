//DESCRIPTION:Export single records to Individual Colored QR Code files.
/*
----------------------------------------------------------------------------
© Colin Flashman, Colecandoo 2016
v1.01 release - Tuesday, 26 January, 2016, 12:48 pm in UTC time 
*/
#targetengine "session";
//make sure that the user interaction level works in case the last script turned it off and didn't turn it back on
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;

/*time trial validation  
//Create date from input value
var inputDate = new Date("31 December 2015");  //expiry date of script
//Get today's date
var todaysDate = new Date();
//call setHours to take the time out of the comparison
if(todaysDate.setHours(0,0,0,0) >= inputDate.setHours(0,0,0,0))
{
    alert("The Beta trial has expired.\rGo to www.colecandoo.com for updates on this script");
    exit(0);
    }
*/

var bkp = app.marginPreferences.properties;  
  
// Change the margin prefs to allow small document size  
// ---  
app.marginPreferences.properties = {  
     top:0, left:0, bottom:0, right:0,  
     columnGutter:0, columnCount:1  
     };  
  
// Create a 'minimal' document  
var myDoc = app.documents.add(true, undefined,  
     {documentPreferences: {pageWidth:'5mm', pageHeight:'5mm', facingPages: false}}  
     );  
  
// Restore the default app margin prefs  
// ---  
app.marginPreferences.properties = bkp;  

var myOldXUnits = app.documents.item(0).viewPreferences.horizontalMeasurementUnits;
var myOldYUnits = app.documents.item(0).viewPreferences.verticalMeasurementUnits;

//hide this dialog while testing

app.panels.itemByName("$ID/Swatches").visible = true;    
var pal = new Window ("palette","Colored QR Code Maker v1.01");
pal.txtPanel = pal.add("group");
pal.txtPanel.alignment = "left";
var convertText = pal.txtPanel.add ("statictext", undefined, "Check the swatches panel to make sure the desired color is available.");
pal.txtPanel2 = pal.add("group");
pal.txtPanel2.alignment = "left";
var convertText2 = pal.txtPanel2.add ("statictext", undefined, "If yes, click Next, if no, click New Swatch...");
var convert_button = pal.add ("button", undefined, "New Swatch...");
pal.btnPanel = pal.add("group");
pal.btnPanel.alignment = "right";
var OKbutton = pal.btnPanel.add ("button", undefined, "Next >");
var Cancelbutton = pal.btnPanel.add ("button", undefined, "Cancel");
convert_button.onClick = function () {app.menuActions.itemByID(16386).invoke();}
OKbutton.onClick = function () {pal.close();swatchSelect();}
Cancelbutton.onClick = function () {pal.close();}

pal.show ();

//swatchSelect(); // hide this line when everything is good
function swatchSelect(){
   with(myDialog = app.dialogs.add({name:"Colored QR Code Maker v1.01"})){
      myDialogColumn = dialogColumns.add();
      with(myDialogColumn){
         with(borderPanels.add()){
         staticTexts.add({staticLabel:"QR Code Color "});
         mySwatches = app.activeDocument.swatches;
            myDropdown = dropdowns.add();
            myDropdown.stringList = mySwatches.everyItem().name;
            myDropdown.selectedIndex = 0;
         }
      }
      myReturn = myDialog.show();
      if (myReturn == true){
         mySwatchesResult = myDropdown.selectedIndex;
         main();   // the User Interface and main workings of the script start here.
        myDialog.destroy;
         return mySwatchesResult;

      } else {
         myDialog.destroy();
      }
   }
}

function main() 
	{
	var csvFile = File.openDialog('Please select the original data file'); // the next 7 lines attempt to enforce that only a tab delimited or comma separated files are opened
    if (csvFile == null){
    alert ("No text file was chosen. Quitting...");
    exit(0);
    }
var path = Folder(csvFile.parent.fsName);
var check, check2, ext;
		{
		check = decodeURI(csvFile.name);
		check2 = check.replace(/.[^.]+$/,'');
		ext = check.substring(check.lastIndexOf(".")+1,check.length);
		if ( ext == "txt" || ext == "TXT"|| ext == "csv"|| ext == "CSV") 
			{
			var CSV = csvFile && csvFile.open('r') && csvFile.read().split(/[\r\n]+/); // get the lines  
			if( CSV ) csvFile.close(); else throw "No input file";  
            }
			csvFile.open('r'); 
			var maxRange = csvFile.read().split(/\n/).length - 1;  //total length of actual records (not including the header)
			csvFile.close(); 
}            
String.prototype.splitCSV = function(sep) {
if ( ext == "txt" || ext == "TXT") 
{
    var foo = this.split(sep = sep || "\t");
    }
if (ext == "csv"|| ext == "CSV")
{
    var foo = this.split(sep = sep || ",");
    }
for (var x = foo.length - 1, tl; x >= 0; x--) {
    if (foo[x].replace(/"\s+$/, '"').charAt(foo[x].length - 1) == '"') {
      if ((tl = foo[x].replace(/^\s+"/, '"')).length > 1 && tl.charAt(0) == '"') {
        foo[x] = foo[x].replace(/^\s*"|"\s*$/g, '').replace(/""/g, '"');
      } else if (x) {
        foo.splice(x - 1, 2, [foo[x - 1], foo[x]].join(sep));
      } else foo = foo.shift().split(sep).concat(foo);
    } else foo[x].replace(/""/g, '"');
  } return foo;
};            
           
			var headers = CSV[0].splitCSV(), nh = headers.length;  
			var data = [],  
			n = CSV.length,  
			i, t, a, j;  
			for( i=0 ; i < n ; ++i )  
				{  
				t = (data[i]={});       // new empty item.  
				a = CSV[i].splitCSV();   // array of values.  
				a.length = nh;            // make sure `a` has `nh` placeholders.  Thank you to Marc Autret for 
				for( j=-1 ; ++j < nh ; t[headers[j]]=a[j] );  
				a.length = 0;             // cleanup.  
				}             
			csvFile.open('r'); 
			var maxRange = csvFile.read().split(/\n/).length - 1;  //total length of actual records (not including the header)
			csvFile.close(); 
            var finished = ""
			var myPresets = app.pdfExportPresets.everyItem().name;  //used for the PDF dropdown options
			myPresets.unshift("Select a Preset");
			var win = new Window("dialog", "Colored QR Code Maker v1.01", undefined, {resizeable: true});
			with(win)
				{
				win.gr1 = add( "group",undefined, undefined);
				win.gr1.alignment = ['left', 'top'];
				with(win.gr1)
					{
					win.gr1.saveFilesText = add( "statictext", undefined, 'Save files to:' );
					win.gr1.saveFilesBtn = add( "button", undefined, 'Browse...' );
					win.gr1.saveFilesBtn.onClick = function()
						{
						finished = Folder.selectDialog('Destination Folder for finished files').fsName + '/' ;
						if (finished != null)win.gr1.saveFilesField.text = finished;
                       }
					win.gr1.saveFilesField = add( "edittext", undefined, undefined, );
					win.gr1.saveFilesField.characters = 30;
					win.gr1.saveFilesField.enabled = false;
					}
				win.gr2 = add( "group", undefined, undefined );
				win.gr2.alignment = ['left', 'center'];
				with(win.gr2)
					{
					win.gr2.exportToText = add( "statictext", undefined, 'Export to:' );
					win.gr2.exportToBtn = win.gr2.add('group');
                     win.gr2.PDF = exportToBtn.add( "radiobutton", undefined, 'PDF' );
					win.gr2.PDF.onClick = myPDFAlert;
					win.gr2.EPSexport = exportToBtn.add( "radiobutton", undefined, 'EPS' );
					win.gr2.EPSexport.onClick = myEPSAlert;
					win.gr2.PNGexport = exportToBtn.add( "radiobutton", undefined, 'PNG' );
					win.gr2.PNGexport.value = true
					win.gr2.PNGexport.onClick = myPNGAlert;
					win.gr2.JPGexport = exportToBtn.add( "radiobutton", undefined, 'JPG' );
					win.gr2.JPGexport.onClick = myJPGAlert;
                    function myPDFAlert() {
                    win.gre.resolutiontext.visible = false;
                    win.gre.resolution.visible = false;
                    win.gre.transparent.visible = false;
                    win.gr2.colorfield.visible = false;
                    win.gre.myPDFExport.visible = true;
                    }
                    function myEPSAlert() {
                    win.gre.resolutiontext.visible = false;
                    win.gre.resolution.visible = false;
                    win.gre.transparent.visible = false;
                    win.gre.myPDFExport.visible = false;
                    win.gr2.colorfield.visible = true;
                    }
                    function myPNGAlert() {
                    win.gre.resolutiontext.visible = true;
                    win.gre.resolution.visible = true;
                    win.gre.transparent.visible = true;
                    win.gre.myPDFExport.visible = false;
                    win.gr2.colorfield.visible = true;
                    }
                    function myJPGAlert() {
                    win.gre.resolutiontext.visible = true;
                    win.gre.resolution.visible = true;
                    win.gre.transparent.visible = false;
                    win.gre.myPDFExport.visible = false;
                    win.gr2.colorfield.visible = true;
                    }
                     var colorkinds = ["RGB", "Gray", "CMYK (except PNG)"];  
                     win.gr2.colorfield = add( "dropdownlist", undefined, colorkinds );
					win.gr2.colorfield.selection = 0;

                    }
				win.gre = add( "group", undefined, undefined );
				with(win.gre)
					{
                     var myStartNumberVariable2 = 300;
					win.gre.resolutiontext = add( "statictext", undefined, "DPI:" );
					win.gre.resolutiontext.visible = true;
					win.gre.resolution = add( "edittext", undefined, myStartNumberVariable2 );
					win.gre.resolution.visible = true;
                     win.gre.resolution.characters = 5;
                     win.gre.resolution.onChange = onInputNumberChange2;
                         function onInputNumberChange2() 
                            {
                            var startResult2 = parseInt(this.text, 10);
                            if (isNaN(startResult2) || startResult2 < 1 || startResult2 > 2400) 
                                {          // if not a number or outside a range you might choose
                                this.text = myStartNumberVariable2;          // revert back to the previous setting.
                                }                       
                            else 
                                {
                                myStartNumberVariable2 = startResult2;
                                this.text = startResult2; // set the text box to the result of the parseInt which may be different, for example it will strip any leading zeros or decimals.
                                }
                            }

                     win.gre.transparent = add("checkbox", undefined, "Transparent Background");
					win.gre.transparent.value = true;
                     win.gre.myPDFExport = add( "dropdownlist", undefined, undefined,{items:myPresets} );
					win.gre.myPDFExport.selection = 0;
					win.gre.myPDFExport.visible = false;
					}
				win.gr9 = add( "group", undefined, undefined );
				win.gr9.alignment = ['left', 'center'];
				with(win.gr9)
					{
					var myStartNumberVariable3 = 25;
					win.gr9.sizetext = add( "statictext", undefined, "Size (Width and Height):" );
					win.gr9.codesize = add( "edittext", undefined, myStartNumberVariable3 );
                     win.gr9.codesize.characters = 5;
                     win.gr9.codesize.onChange = onInputNumberChange3;
                         function onInputNumberChange3() 
                            {
                            var startResult3 = this.text;
                            if (isNaN(startResult3) || startResult3 < 0 || startResult3 > 2400) 
                                {          // if not a number or outside a range you might choose
                                this.text = myStartNumberVariable3;          // revert back to the previous setting.
                                }                       
                            else 
                                {
                                myStartNumberVariable3 = startResult3;
                                this.text = startResult3; // set the text box to the result of the parseInt which may be different, for example it will strip any leading zeros or decimals.
                                }
                            }
                        var measurementUnitsEnglish = ["Please Select a Measurement", "Millimetres", "Centimetres", "Inches", "Points", "Pixels"];  
                        var measurementUnitsEnums = ["Please Select a Measurement", MeasurementUnits.MILLIMETERS, MeasurementUnits.CENTIMETERS, MeasurementUnits.INCHES, MeasurementUnits.POINTS, MeasurementUnits.PIXELS];  

                     win.gr9.dmu = add( "dropdownlist", undefined, measurementUnitsEnglish );
					win.gr9.dmu.selection = 0;

                       }
				win.gr4 = add( "group", undefined, undefined );
				with(win.gr4)
					{
					win.gr4.sText = add( "statictext", undefined, 'Select ONE field that contains the QR code' );
					}
				win.gr5 = add( "group", undefined, undefined );
				win.gr5.alignment = ['left', 'center'];
				with(win.gr5)
					{
					win.gr5.gra = add( "group", undefined, undefined );
					win.gr5.gra.alignment = ['left', 'center'];
					with(win.gr5.gra)
						{
						win.gr5.gra.lHeaders = add( "listbox",[0,0,170,200], headers, {multiselect: true, numberOfColumns: 1, columnWidths:200, showHeaders: true, columnTitles: ["Fields in Database"]});
						}
					win.gr5.grc = add( "group", undefined, undefined );
					win.gr5.grc.orientation = "column";
					win.gr5.grc.alignment = ['left', 'center'];
					with(win.gr5.grc)
						{
						win.gr5.grc.bAdd = add( "button", undefined, 'add' );
						win.gr5.grc.bAdd.onClick = function()
							{
							addFieldHandler;
							for (var i = 0; i < win.gr5.gra.lHeaders.selection.length; i++)
							win.gr5.grb.lFields.add("item",win.gr5.gra.lHeaders.selection[i]);
							}
						win.gr5.grc.del = add( "button", undefined, 'remove' );
						win.gr5.grc.del.onClick = function ()
							{
							// remember which line is selected
							var sel = win.gr5.grb.lFields.selection[0].index;
							for (var i = win.gr5.grb.lFields.selection.length-1; i > -1; i--)
							win.gr5.grb.lFields.remove (win.gr5.grb.lFields.selection[i]);
							// select a line after deleting one or more items 
							if (sel > win.gr5.grb.lFields.items.length-1)
							win.gr5.grb.lFields.selection = win.gr5.grb.lFields.items.length-1;
							else
							win.gr5.grb.lFields.selection = sel;
							}
						win.gr5.grc.up = add( "button", undefined, 'up' );
						win.gr5.grc.down = add( "button", undefined, 'down' );
						win.gr5.grc.up.onClick = function ()
							{
							var first = win.gr5.grb.lFields.selection[0].index;
							if (first == 0 || !contiguous (win.gr5.grb.lFields.selection)) return; 
							var last = first+win.gr5.grb.lFields.selection.length;
							for (var i = first; i < last; i++)
							swap (win.gr5.grb.lFields.items [i-1], win.gr5.grb.lFields.items [i]);
							win.gr5.grb.lFields.selection = null;
							for (var i = first-1; i < last-1; i++)
							win.gr5.grb.lFields.selection = i;
							}
						win.gr5.grc.down.onClick = function ()
							{
							var last = win.gr5.grb.lFields.selection.pop().index;
							if (last == win.gr5.grb.lFields.items.length-1 || !contiguous (win.gr5.grb.lFields.selection)) return;
							var first = win.gr5.grb.lFields.selection[0].index;
							for (var i = last; i >= first; i--)
							swap (win.gr5.grb.lFields.items [i+1], win.gr5.grb.lFields.items [i]);
							win.gr5.grb.lFields.selection = null;
							for (var i = first+1; i <= last+1; i++)
							win.gr5.grb.lFields.selection = i;
							}
						function contiguous (sel)
							{
							return sel.length == (sel[sel.length-1].index - sel[0].index + 1);
							}
						function swap (x, y)
							{
							var temp = x.text;
							x.text = y.text;
							y.text = temp; 
							}
						}
					win.gr5.grb = add( "group", undefined, undefined );
					win.gr5.grb.alignment = ['left', 'center'];
					with(win.gr5.grb)
						{
						win.gr5.grb.lFields = add( "listbox",[0,0,170,200], [], {multiselect: true, numberOfColumns: 1, columnWidths:200, showHeaders: true, columnTitles: ["Use for QR Code"]});
						}
					var addFieldHandler = function EH_ADD_FIELD()  
						{  
						var t = win.gr5.gra.lHeaders.selection;  
						if( !t ) return;  
						win.gr5.grb.lFields.add('item',t.text);  
						};  
					}
				win.gr7 = add( "group", undefined, undefined );
				win.gr7.orientation = "row";
				win.gr7.alignment = 'center';
				with(win.gr7)
					{
					win.gr7.gra = add( "group", undefined, undefined );
					win.gr7.gra.orientation = "row";
					with(win.gr7.gra)
						{
						win.gr7.gra.startText = add( "statictext", undefined, 'Range:' );
						var myStartNumberVariable = 1;
                        win.gr7.gra.startNo = add( "edittext", undefined, myStartNumberVariable );
                        win.gr7.gra.startNo.onChange = onInputNumberChange;
                         function onInputNumberChange() 
                            {
                            var startResult = parseInt(this.text, 10);
                            if (isNaN(startResult) || startResult < 1 || startResult > myEndNumberVariable) 
                                {          // if not a number or outside a range you might choose
                                this.text = myStartNumberVariable;          // revert back to the previous setting.
                                }                       
                            else 
                                {
                                myStartNumberVariable = startResult;
                                this.text = startResult; // set the text box to the result of the parseInt which may be different, for example it will strip any leading zeros or decimals.
                                }
                            }
                        win.gr7.gra.startNo.characters = 5;
						var myEndNumberVariable = maxRange;
                        win.gr7.gra.endText = add( "statictext", undefined, 'to' );
						win.gr7.gra.endNo = add( "edittext", undefined, myEndNumberVariable );
                        win.gr7.gra.endNo.onChange = onOutputNumberChange;
                        function onOutputNumberChange() 
                            {
                            var endResult = parseInt(this.text, 10);
                            if (isNaN(endResult) || endResult < myStartNumberVariable || endResult > maxRange) 
                                {          // if not a number or outside a range you might choose
                                this.text = myEndNumberVariable;          // revert back to the previous setting.
                                }                       
                            else 
                                {
                                myEndNumberVariable = endResult;
                                this.text = endResult; // set the text box to the result of the parseInt which may be different, for example it will strip any leading zeros or decimals.
                                }
                            }
                        win.gr7.gra.endNo.characters = 5;
						}
					win.gr7.grb = add( "group", undefined, undefined );
					win.gr7.grb.orientation = "row";
					with(win.gr7.grb)
						{
						var Exit = 0;
                            win.gr7.grb.OK = add( "button", undefined, "OK" );
						win.gr7.grb.Cancel = add( "button", undefined, "Cancel");   
						win.gr7.grb.Cancel.onClick = function()
                        {
                win.close();
                Exit = 1;                           }
                        }
					}
				win.gr8 = add( "group", undefined, undefined );
				with(win.gr8)
					{
					win.gr8.lastline = add( "statictext", undefined, '© Colecandoo 2016. www.colecandoo.com' );
					}
				}
				win.onResizing = function(){ this.layout.resize() 
			}
    win.onShow = function()
			{
			this.layout.layout(); this.minimumSize = this.preferredSize
			}
        
	win.center();
    
   
	var importDlg = win.show();
    if(Exit ==1)
{
        this.exit();
    }
    if (win.gre.myPDFExport.selection.index == 0 && win.gr2.PDF.value == true) 
		{
		alert ('A PDF Export Option has to be chosen. Quitting...');
        app.activeDocument.close(SaveOptions.NO);
		exit(0);
		}
   if (finished == "") 
		{
		alert ('An output folder has to be chosen. Quitting...');
        app.activeDocument.close(SaveOptions.NO);
		exit(0);
		}
    if (win.gr9.dmu.selection.index == 0) 
		{
		alert ('A measurement has to be chosen. Quitting...');
        app.activeDocument.close(SaveOptions.NO);
		exit(0);
		}
var newHorizontal = app.documents.item(0).viewPreferences.horizontalMeasurementUnits = measurementUnitsEnums[win.gr9.dmu.selection.index]; 
var newVertical = app.documents.item(0).viewPreferences.verticalMeasurementUnits = measurementUnitsEnums[win.gr9.dmu.selection.index]; 

    var newSize = new UnitValue((win.gr9.codesize.text),newVertical);
    newSize = parseFloat(newSize);
    var res = parseInt(win.gre.resolution.text);
	var maxRange2 = parseInt(win.gr7.gra.endNo.text);
	var start = parseInt(win.gr7.gra.startNo.text);
	var end = parseInt(win.gr7.gra.endNo.text);
	var myTotal = maxRange2 - parseInt(win.gr7.gra.startNo.text)+1;
    var colortype = win.gr2.colorfield.selection.index;
    var myPreset = app.pdfExportPresets.item(String(win.gre.myPDFExport.selection));

    var delimiter = "";
if ( ext == "txt" || ext == "TXT"){
    delimiter = "\t";
    }
if ( ext == "csv" || ext == "CSV"){
    delimiter = ",";
    }
var textArray = [];
var text = CSV[0] + delimiter + "@QRCode";
textArray.push(text);

//this function is for getting the field names from the selected text options. Many thanks to Marc Autret of Indiscripts for this help.
var fields = function(r,items,i)  
		{  
		i = items.length; 
            if (items.length == 0) 
		{
		alert ("You didn't select any field names. Quitting...");
        app.activeDocument.close(SaveOptions.NO);
		exit(0);
		}

		while( i-- ) r[i] = items[i].text;  
		return r;  
		}
	([],win.gr5.grb.lFields.items);  
	const SEPARATOR = " ";  
	var results = [],  
	nf = fields.length;  
	for( i=0, n=data.length ; nf && i < n ; ++i )  
		{  
		t = data[i];  
		for( j= -1,a=[] ; ++j < nf ; a[j]=t[fields[j]] );  
		results[i] = a.join(SEPARATOR);  
         //results[i] = results[i].replace(/[!$%^&*@#()+|~=`{}\[\]:";'<>?,.\/\\]/g, "_"); //removes illegal characters from filenames and replaces with an underscore.
        } 
//warning of duplicates has been removed. 
var resultsFolder = finished + "QR Codes/";  //this makes a duplicates folder, ONLY IF there are duplicates detected by the unique function above
    if (Folder(resultsFolder).exists)
    {
        alert ("A \"Results\" folder is already present.\rPlease choose a different directory.");
        app.activeDocument.close(SaveOptions.NO);
        exit(0);
        }
    var resultsFolderCreate = new Folder(resultsFolder);  
    resultsFolderCreate.create();
var w = new Window ('palette','Processing, please wait');
w.pbar = w.add ('progressbar', undefined, 0, myTotal);
w.pbar.preferredSize.width = 300;
w.show();
var maketrans = win.gre.transparent.value;
var myPages = myDoc.pages;
var myPage = app.activeDocument.pages.item(0);
myDoc.documentPreferences.pageHeight = newSize; //needs to be fixed
myDoc.documentPreferences.pageWidth = newSize; 

for(var  i = 0; i < myTotal; i++)  
		{w.pbar.value = i+1;
$.sleep(20);

//var myPage = app.activeDocument.pages.item(0);
var myPageItem = myPage.rectangles.add();
myPageItem.geometricBounds = myPage.bounds;
//NEWCODE
myColorResult = app.activeDocument.swatches[mySwatchesResult];
myPageItem.fillColor = app.activeDocument.swatches.item("None");
myPageItem.strokeColor = app.activeDocument.swatches.item("None");  
myPageItem.createPlainTextQRCode(results[i+start], myColorResult);
app.select(app.activeWindow.activePage.allPageItems); 
if (win.gr2.PDF.value == true){
var suffix = ".pdf";
//PDF export preferences
app.pdfExportPreferences.viewPDF = false;
app.activeDocument.selection[0].exportFile(ExportFormat.PDF_TYPE, File(resultsFolder + [i+start] + suffix), false, myPreset);
}if (win.gr2.PNGexport.value == true){
var suffix = ".png";
//PNG export preferences
app.pngExportPreferences.exportResolution = res;
if (win.gr2.PNGexport.value == true && colortype == 1) {
app.pngExportPreferences.pngColorSpace = PNGColorSpaceEnum.GRAY;}
if (win.gr2.PNGexport.value == true && colortype != 1) {
app.pngExportPreferences.pngColorSpace = PNGColorSpaceEnum.RGB;}
app.pngExportPreferences.pngQuality = PNGQualityEnum.HIGH;
app.pngExportPreferences.transparentBackground = maketrans;
app.pngExportPreferences.antiAlias = false;
app.activeDocument.selection[0].exportFile(ExportFormat.PNG_FORMAT, File(resultsFolder + [i+start] + suffix), false);
}
if (win.gr2.EPSexport.value == true){
var suffix = ".eps";
//EPS export preferences
if (win.gr2.EPSexport.value == true && colortype == 0) {
app.epsExportPreferences.epsColor = EPSColorSpace.RGB;}
if (win.gr2.EPSexport.value == true && colortype == 1) {
app.epsExportPreferences.epsColor = EPSColorSpace.GRAY;}
if (win.gr2.EPSexport.value == true && colortype == 2) {
app.epsExportPreferences.epsColor = EPSColorSpace.CMYK;}
app.epsExportPreferences.preview = PreviewTypes.TIFF_PREVIEW;
app.epsExportPreferences.postscriptLevel = PostScriptLevels.LEVEL_3;
app.epsExportPreferences.dataFormat = DataFormat.BINARY;
app.activeDocument.selection[0].exportFile(ExportFormat.EPS_TYPE, File(resultsFolder + [i+start] + suffix), false);
}
if (win.gr2.JPGexport.value == true){
var suffix = ".jpg";
//JPG export preferences
if (win.gr2.JPGexport.value == true && colortype == 0) {
app.jpegExportPreferences.jpegColorSpace = JpegColorSpaceEnum.RGB;}
if (win.gr2.JPGexport.value == true && colortype == 1) {
app.jpegExportPreferences.jpegColorSpace = JpegColorSpaceEnum.GRAY;}
if (win.gr2.JPGexport.value == true && colortype == 2) {
app.jpegExportPreferences.jpegColorSpace = JpegColorSpaceEnum.CMYK;}
app.jpegExportPreferences.exportResolution = res;
app.jpegExportPreferences.jpegQuality = JPEGOptionsQuality.MAXIMUM;
app.jpegExportPreferences.antiAlias = false;
app.activeDocument.selection[0].exportFile(ExportFormat.JPG, File(resultsFolder + [i+start] + suffix), false);
}
myPageItem.remove();
text = CSV[i+start] + delimiter + File(resultsFolder + [i+start] + suffix).fullName;
textArray.push(text);
};
app.documents.item(0).viewPreferences.horizontalMeasurementUnits = myOldXUnits;
app.documents.item(0).viewPreferences.verticalMeasurementUnits = myOldYUnits;

            app.activeDocument.close(SaveOptions.NO);
            textArray = textArray.join("\r");
var resultsCSVContent = textArray;
var resultsCSV = new File(resultsFolder+"/"+check2+"-QRCodes." + ext);
if (resultsCSV.exists)
           {
            var userResponse = confirm ("This file already exists. Overwrite?");
            if (userResponse == true){
           } else {
	exit(0);
	}}
	resultsCSV.open('w');
	resultsCSV.write(resultsCSVContent);
	resultsCSV.close();
//revert back to old measurements
	alert("Finished.\r\rA new database containing the links to the QR codes can be found here:\r\r" + resultsCSV.fsName);
    w.close();}