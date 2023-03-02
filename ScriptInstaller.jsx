//DESCRIPTION: A simple script which pops up a dialog which makes it easier to install scripts in InDesign.
//(c) In-Tools.com This script is provided "as-is" and we take no responsibility whatsoever for results of its use.

InstallScript();

function InstallScript(){
	kAppVersion = parseFloat(app.version);
	if(kAppVersion<5){
		kOK="OK";
		kCancel="Cancel";
	} else {
		kOK = app.translateKeyString("$ID/OK");//kOK || 
		kCancel = app.translateKeyString("$ID/Cancel");//kCancel || 
	}
	
	var d = app.dialogs.add({name:'Script Installer'});
//	var col = d.dialogColumns.add();
	d.dialogColumns.add().staticTexts.add({staticLabel:"Select Script Type:"})
	var radioGroup = d.dialogColumns.add().radiobuttonGroups.add();
	radioGroup.radiobuttonControls.add({staticLabel:"Normal Script"});
	radioGroup.radiobuttonControls.add({staticLabel:"Startup Script"});
//	radioGroup.radiobuttonControls.add({staticLabel:"Normal Script Folder"});
//	radioGroup.radiobuttonControls.add({staticLabel:"Startup Script Folder"});
	radioGroup.selectedButton = 0;
	var res = d.show();
	if(!res){
		d.destroy();
		return;
	}
	var installOption = radioGroup.selectedButton;
	d.destroy();
/*
	var d = new Window('dialog','What type of script will you be installing?');
	d.orientation = 'row';
	var g1 = d.add('group');
	g1.orientation = 'column';
	var g2 = d.add('group');
	g2.orientation = 'column';
	g2.alignChildren = 'fill';
	g2.spacing = 0;
	var okButton = g2.add('button', undefined, kOK, {name:'ok'});
	var cancelButton =g2.add('button', undefined, kCancel, {name:'cancel'});
	var regScript = g1.add('radiobutton',undefined,"Normal Script");
	regScript.value = true;
	var strtScript = g1.add('radiobutton',undefined,"Startup Script");
	var res = d.show();
	if(!res){
		return;
	}
*/
	if(installOption < 2){
		var file  = File.openDialog("Please pick your script file to install");
	}
	else {
		var file  = Folder.selectDialog("Please pick your script folder to install");
	}
	if(!file){return}
	var scriptsFolder = GetScriptsFolder();
	if(!scriptsFolder){
		alert("We could not find your scripts folder.");
		return;
	}
	if(installOption == 0 || installOption == 2){
		scriptsFolder = Folder(scriptsFolder.absoluteURI + "/Scripts Panel");
	}
	else {
		scriptsFolder = Folder(scriptsFolder.absoluteURI + "/startup scripts");
	}
	if (!scriptsFolder.exists){
		scriptsFolder.create();
	}
	// this will not work for folders, so we disabled that option for now...
	try{file.copy(scriptsFolder.absoluteURI + "/" + file.name);}
	catch(err){
		alert("Installation failed. You might not have administrator rights to install scripts.");
	}
}
function GetScriptsFolder(){
	var scriptsFolder = null;
	do{
	//
	// On Mac this is a folder inside the app package
	//
		var appFolder = Folder.startup;
		if (! appFolder.exists){break;}
		scriptsFolder = Folder(appFolder + "/Scripts");
		while (appFolder.exists && ! scriptsFolder.exists){
			appFolder = appFolder.parent;
			scriptsFolder = Folder(appFolder + "/Scripts");
		}
		if (! scriptsFolder.exists){
			scriptsFolder = null;
			break;
		}
	}
	while (false);
	return scriptsFolder;
}
