//DESCRIPTION: Print selected pages
//=============================================================
//  Script by Luis Felipe Corullón
//  Contato: lf@corullon.com.br
//  Site: http://lf.corullon.com.br
//  Export functions by:  Smart Mix smartmix    |   https://smartmix.it
//=============================================================


if (!app.documents.length || (app.documents.length && !app.documents[0].visible)) {
    alert("There is no opened document(s).","Script by LFCorullón");
    }
else {
    var myPages = [];
    for (var p=0; p<app.activeDocument.pages.length; p++) {
        myPages.push(app.activeDocument.pages[p].name);
        }

    var selectPgs = new Window ("dialog", "Script by LFCorullón");
    var pgGroup = selectPgs.add("group");
    pgGroup.orientation = "column";
    pgGroup.alignChildren = "left";
    pgGroup.add("statictext", undefined, "Select pages you want to print");
    var pgsList = pgGroup.add("listbox", [0, 0, 170, 150], myPages, {multiselect: true});
    pgsList.selection = 0;

    var type = selectPgs.add("group");
    type.orientation = "row";
    var myJPG = type.add ("checkbox", undefined, "JPG");
    var myPDF = type.add ("checkbox", undefined, "PDF");
    var myPNG = type.add ("checkbox", undefined, "PNG");

    var btn = selectPgs.add("group");
    btn.orientation = "row";
    btn.alignment = ["right", "top"];
    var okBtn = btn.add ("button", undefined, "OK", {name:"OK"});
    var cancelBtn = btn.add ("button", undefined, "Cancel", {name:"Cancel"});

    var result = selectPgs.show();

    if(result == 1){
        var selectedPgs = [];
        for (var i=0; i<pgsList.selection.length; i++) {
            selectedPgs.push(pgsList.selection[i].text);
            }
//~         alert(selectedPgs);
        if (myJPG.value == true) {
            exportJPG(selectedPgs)
            }
        if (myPDF.value == true) {
            exportPDF(selectedPgs)
            }
        if (myPNG.value == true) {
            exportPNG(selectedPgs)
            }
        }
    else {
        exit();
        }
    }

//~ ***************************
//~ * EXPORTATION FUNCTIONS
//~ Export functions by:  Smart Mix smartmix    |   https://smartmix.it
//~ ***************************

function exportPDF(selectedPgs){
	
	var theFolder = Folder.selectDialog("Choose a folder for export");  
	if (theFolder == null) {
		exit();  
	}
		
	app.pdfExportPreferences.pageRange = selectedPgs.join(",");
	var curDoc = app.documents[0]; 
	var fileName = curDoc.name.replace(/.indd$/,"");
	
	try {  
		curDoc.exportFile(ExportFormat.PDF_TYPE , File(theFolder + "/" + fileName+'.pdf') , true);
		
	}catch(e) {  
		alert(e);  
	}
	
	app.pdfExportPreferences.pageRange = "";
	
}


function exportPNG(selectedPgs){
	
	var theFolder = Folder.selectDialog("Choose a folder for export");  
	if (theFolder == null) {
		exit();  
	}
    
    app.pngExportPreferences.pngExportRange = PNGExportRangeEnum.EXPORT_RANGE;
    app.pngExportPreferences.pageString =  selectedPgs.join(",");
    
	var curDoc = app.documents[0]; 
	var fileName = curDoc.name.replace(/.indd$/,"");
	
	try {  
		curDoc.exportFile(ExportFormat.PNG_FORMAT , File(theFolder+'/'+fileName+'.png') , true);
		
	}catch(e) {  
		alert(e);  
	}
	app.pngExportPreferences.pngExportRange = PNGExportRangeEnum.EXPORT_ALL;
}


function exportJPG(selectedPgs){
	
	var theFolder = Folder.selectDialog("Choose a folder for export");  
	if (theFolder == null) {
		exit();  
	}
    
    app.jpegExportPreferences.jpegExportRange = ExportRangeOrAllPages.EXPORT_RANGE;
    app.jpegExportPreferences.pageString =  selectedPgs.join(",");
    
	var curDoc = app.documents[0]; 
	var fileName = curDoc.name.replace(/.indd$/,"");
	
	try {  
		curDoc.exportFile(ExportFormat.JPG , File(theFolder+'/'+fileName+'.jpg') , true);
		
	}catch(e) {  
		alert(e);  
	}
	app.jpegExportPreferences.jpegExportRange = ExportRangeOrAllPages.EXPORT_ALL;
}