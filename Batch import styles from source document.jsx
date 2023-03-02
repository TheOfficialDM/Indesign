var MyFolderWithFiles = Folder.selectDialog ("Choose a folder");
var sourceFile = File.openDialog("Choose the styles source");
var myFiles = MyFolderWithFiles.getFiles("*.indd");

for(i = 0; i < myFiles.length; i++) {
	theFile = myFiles[i];
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
	var targetDoc = app.open(theFile, true);
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALL;
	targetDoc.importStyles(ImportFormat.CHARACTER_STYLES_FORMAT, sourceFile, GlobalClashResolutionStrategy.LOAD_ALL_WITH_OVERWRITE);
	targetDoc.importStyles(ImportFormat.PARAGRAPH_STYLES_FORMAT, sourceFile, GlobalClashResolutionStrategy.LOAD_ALL_WITH_OVERWRITE);
	targetDoc.close(SaveOptions.YES);
}

// The following will let you choose a folder of files, open each of the files in it and import the styles from source document.
// Thomas B. Nielsen