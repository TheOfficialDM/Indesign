//DESCRIPTION:Imports all text, table, stroke, object, TOC styles; plus colours and master pages from an existing InDesign file
var files = "InDesign:*.indd, All files:*.*";
sourceFile = File.openDialog("select the file", files, false);
var myDoc = app.activeDocument
myDoc.loadSwatches(sourceFile)
myDoc.importStyles(ImportFormat.TEXT_STYLES_FORMAT, sourceFile, GlobalClashResolutionStrategy.DO_NOT_LOAD_THE_STYLE);
myDoc.importStyles(ImportFormat.TOC_STYLES_FORMAT, sourceFile, GlobalClashResolutionStrategy.DO_NOT_LOAD_THE_STYLE);
myDoc.importStyles(ImportFormat.OBJECT_STYLES_FORMAT, sourceFile, GlobalClashResolutionStrategy.DO_NOT_LOAD_THE_STYLE);
myDoc.importStyles(ImportFormat.STROKE_STYLES_FORMAT, sourceFile, GlobalClashResolutionStrategy.DO_NOT_LOAD_THE_STYLE);
myDoc.importStyles(ImportFormat.TABLE_AND_CELL_STYLES_FORMAT, sourceFile, GlobalClashResolutionStrategy.DO_NOT_LOAD_THE_STYLE);
myDoc.loadMasters(sourceFile, GlobalClashResolutionStrategyForMasterPage.LOAD_ALL_WITH_RENAME);
