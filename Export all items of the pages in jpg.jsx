#target InDesign 
 
//set properties for export to your needs
 with(app.jpegExportPreferences){ 
    antiAlias = true; 
embedColorProfile = false; 
exportResolution = 300; 
jpegColorSpace = JpegColorSpaceEnum.RGB; //JpegColorSpaceEnum.CMYK, JpegColorSpaceEnum.GRAY     r/w    One of RGB, CMYK or Gray 
jpegQuality = JPEGOptionsQuality.HIGH; //JPEGOptionsQuality.LOW, JPEGOptionsQuality.MEDIUM, JPEGOptionsQuality.HIGH, JPEGOptionsQuality.MAXIMUM     r/w    The compression quality. 
jpegRenderingStyle = JPEGOptionsFormat.BASELINE_ENCODING; // JPEGOptionsFormat.PROGRESSIVE_ENCODING     r/w    The rendering style. 
simulateOverprint = true; 
} 
 
 //doc has to be saved once
var theDoc = app.activeDocument; 
var docName = theDoc.name; 
var docShortName = docName.replace(/.indd/, '') 
var docPath = '' + theDoc.fullName; 
var docContainerPath = docPath.replace(docName, '') 
var destPath = docContainerPath + '/' + docShortName + '_jpgExport/' 
if(Folder(destPath).create() != true){alert('Could not create targetfolder.'); exit();} 
 
var pageItems = theDoc.pageItems.everyItem().getElements(); 
 
l = pageItems.length; 
counter = 0;
for(var i = 0; i < l; i++){
    counter = counter + 1;
    var singlePageItem = pageItems[i];
    currParentPage = singlePageItem.parentPage;
if(currParentPage == null){parentPageNumber = 'pasteboard'}else{parentPageNumber = singlePageItem.parentPage.name; }
 
newFile =new File(destPath + 'page_' +  parentPageNumber + '_' + 'item_' + counter + '.jpg'); 
 
if(singlePageItem.exportFile(ExportFormat.JPG,  newFile) === false){alert(newFile + ' could not write jpg-File.')}  
        }