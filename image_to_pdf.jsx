Array.prototype.inArray = function(obj) {
    var arrMax = this.length - 1;
    for (var i = arrMax; i >= 0; i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

var csvParser = (function() {
    var csvFile;
    return {
        create: function(fo) {
            csvFile = File(fo + "/" + fo.name + ".csv");
        },
        write: function(csvContent) {
            csvFile.open('w');
            csvFile.encoding = "UTF-8";
            csvFile.write(csvContent);
            csvFile.close();
        },
        execute: function() {
            csvFile.execute();
        },
        getCSV: function() {
            return csvFile;
        }
    }
})();

function imagesToCSV(fo) {
    var doc,
        fis,
        fiMax,
        fi,
        fiName,
        fiPath,
        imgFormats = ["jpg", "png", "jpeg"],
        imgFormatMax = imgFormats.length - 1,
        imgOk = [],
        csvContent = [],
        ext,
        csvLine = [],
        csvSep = ",";

    fis = fo.getFiles();
    fiMax = fis.length;

    for (var i = 0; i < fiMax; i++) {

        fi = fis[i];
        ext = fi.name.match(/\.([a-z]+)$/i);
        if (ext == null) continue;
        ext = ext[1].toLowerCase();
        if (!imgFormats.inArray(ext)) continue;
        fiName = decodeURI(fi.name);
        fiName = fiName.substring(0, fiName.lastIndexOf('.'));
        fiPath = decodeURI(fi.fsName);
        csvContent.push(fiName + csvSep + fiPath);
    }

    csvContent = "Name" + csvSep + "@images\r" + csvContent.join("\r");
    csvParser.create(fo);
    csvParser.write(csvContent);

}

function get_field(captionString, doc) {
    var fields = doc.dataMergeProperties.dataMergeFields;
    for (var f = 0, l = fields.length; f < l; f++) {
        if (fields[f].fieldName == captionString) {
            return fields[f];
        }
    }
    alert('Error: did not find any fields with name ' + captionString);
}

function createAndMerge(doc) {
    var masterPageItems,
        leftDetailsFrame,
        rightDetailstFrame,
        leftTextFrame,
        rightTextFrame,
        imageFrame,
        fileExtensionDelimiter,
        orderNumber,
        orderDetails,
        myDataSource
    overflow = false;

    masterPageItems = doc.masterSpreads.item("A-Master").allPageItems;
    for (var i = 0; i < masterPageItems.length; i++) {
        if (masterPageItems[i].label.match("leftDetailsFrame")) {
            leftDetailsFrame = masterPageItems[i];
        } else if (masterPageItems[i].label.match("rightDetailstFrame")) {
            rightDetailstFrame = masterPageItems[i];
        } else if (masterPageItems[i].label.match("leftTextFrame")) {
            leftTextFrame = masterPageItems[i];
        } else if (masterPageItems[i].label.match("rightTextFrame")) {
            rightTextFrame = masterPageItems[i];
        } else if (masterPageItems[i].label.match("imageFrame")) {
            imageFrame = masterPageItems[i];
        }
    }

    fileExtensionDelimiter = doc.name.lastIndexOf('.');
    orderNumber = doc.name.substring(0, fileExtensionDelimiter);
    myDataSource = File(csvParser.getCSV());
    fileExtensionDelimiter = myDataSource.name.lastIndexOf('.');
    orderDetails = myDataSource.name.substring(0, fileExtensionDelimiter).replace(/%20/g, " ");
    leftDetailsFrame.contents = orderNumber + " " + orderDetails + " L";
    leftDetailsFrame.parentStory.insertionPoints.item(-1).contents = SpecialCharacters.autoPageNumber;
    rightDetailstFrame.contents = orderNumber + " " + orderDetails + " R";
    rightDetailstFrame.parentStory.insertionPoints.item(-1).contents = SpecialCharacters.autoPageNumber;

    if (myDataSource != null)
        doc.dataMergeProperties.selectDataSource(myDataSource);
    var myDataMergeProperties = doc.dataMergeProperties;
    if (leftTextFrame != null && rightTextFrame != null) {
        doc.dataMergeTextPlaceholders.add(leftTextFrame.parentStory, leftTextFrame.parentStory.insertionPoints[-1], get_field("Name", doc));
        doc.dataMergeTextPlaceholders.add(rightTextFrame.parentStory, rightTextFrame.parentStory.insertionPoints[-1], get_field("Name", doc));
    } else {
        alert("Merging document without names !");
    }
    doc.dataMergeImagePlaceholders.add(imageFrame, get_field("images", doc));
    doc.dataMergeProperties.mergeRecords();

    if (leftDetailsFrame.overflows)
        overflow = true;
    return overflow;

}

function deleteDuplicateImages(doc) {
    var allPages = doc.pages;
    for (i = 0; i < allPages.length; i++) {
        var pageItems = allPages[i].allPageItems;
        var imageArray = new Array;
        for (var j = 0; j < pageItems.length; j++) {
            if (pageItems[j].label.match("imageFrame")) {
                imageArray.push(pageItems[j]);
            }
        }
        if (imageArray.length == 2) {
            imageArray[0].remove();
        }
    }
}

function checkImageSizes(doc) {
    var count = 0,
        check = true,
        graphics = doc.allGraphics,
		fY = graphics[0].parent.geometricBounds[0],
		fX = graphics[0].parent.geometricBounds[1],
		fH = graphics[0].parent.geometricBounds[2] - fY,
		fW = graphics[0].parent.geometricBounds[3] - fX;
		
    for (i = 0; i < graphics.length; i++) {
        var iY = graphics[i].geometricBounds[0];
        var iX = graphics[i].geometricBounds[1];
        var iH = graphics[i].geometricBounds[2] - iY;
        var iW = graphics[i].geometricBounds[3] - iX;
        if (i != 0 && i != graphics.length - 1) {
            if (parseInt(fH) != parseInt(iH) || parseInt(fW) != parseInt(iW)) {
                check = false;
                graphics[i].label = "TODO";
                count++;
            }
        } else {
            if (parseInt(fH) != parseInt(iH) || parseInt(fW) != parseInt(iW * 2)) {
                alert("Please check first/last sheets size.");
                check = false;
                graphics[i].label = "TODO";
                count++;
            }
        }
    }
    doc.pages[0].allGraphics[0].move([fX + (fW / 2), 0]);
    doc.pages[doc.pages.length - 2].allGraphics[0].move([fX, 0]);
    return count;
}

function getSpecialMediaDetails(doc) {
    var specialMedia = "";
    var allPages = doc.pages;
    for (i = 1; i < allPages.length - 1; i++) {
        var textFramesInPage = allPages[i].textFrames;
        for (j = 0; j < textFramesInPage.length; j++) {
            var thisTextFrame = textFramesInPage[j];
            var content = thisTextFrame.contents.toLowerCase();
            if (content.indexOf("right") > -1 && content.indexOf("left") > -1) {
                specialMedia = specialMedia + thisTextFrame.parentPage.name + "\t" + content + "\n";
                continue;
            }
            if ((thisTextFrame.label.match("leftTextFrame") && content.indexOf("right") > -1) || (thisTextFrame.label.match("rightTextFrame") && content.indexOf("left") > -1))
					content = content.replace((new RegExp(/\D+/g)),"");
            thisTextFrame.contents = content;
            if (content.length > 5)
                specialMedia = specialMedia + thisTextFrame.parentPage.name + "\t" + content + "\n";
        }
    }
    return specialMedia + "\n\n";
}

function exportPDF(doc) {
    var customPreset = app.pdfExportPresets.itemByName("HQ sRGB");
    with(app.pdfExportPreferences) {
        //pageRange can be either PageRange.allPages or a page range string
        pageRange = "01-0" + (doc.pages.length - 2);
    }
    var pdfDoc = new File(doc.filePath + encodeURI("/" + doc.name.slice(0, -5) + ".pdf"));
    doc.asynchronousExportFile(ExportFormat.pdfType, pdfDoc, false, customPreset);
}

function main() {
    var doc,
        mergedDoc,
        fo,
        overflow,
        count,
        report;

    if (app.documents.length == 0) {
        alert("No documents open !");
        return
    }

    doc = app.activeDocument;
    fo = Folder(doc.filePath).selectDlg("PDF folder:");
    if (!fo) return

    imagesToCSV(fo);
    overflow = createAndMerge(doc);
    mergedDoc = app.activeDocument;

    deleteDuplicateImages(mergedDoc);
    count = checkImageSizes(mergedDoc);

    // creating new section for printable pages
    var pageRef = mergedDoc.pages[1];
    var refSection = mergedDoc.sections.add(pageRef);
    refSection.continueNumbering = false;
    refSection.sectionPrefix = "0";
    refSection.pageNumberStart = 1;

    report = "PDF Export Report\n\n\n";
    report = report + getSpecialMediaDetails(mergedDoc);
    if (count > 0)
        report = report + "* * * Number of wrong size images is " + count + " * * *\n\n";
    if (overflow)
        report = report + "* * * Text overflow please check order details * * *\n\n";
		
    if (count == 0 && !overflow) {
		mergedDoc.save();
		exportPDF(mergedDoc);
		report = report + "Exported PDF successfully :)\n";
	}

    var textDoc = new File(doc.filePath + encodeURI("/" + doc.name.slice(0, -5) + ".txt"));
	textDoc.encoding = 'UTF-8';
	textDoc.open('w');
	textDoc.write(report);
	textDoc.close();
	
    alert(report);

}

main();