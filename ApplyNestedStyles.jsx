//DESCRIPTION: Applies nested styles as directly applied character styles.         WARNING: This script will override any character styles which are directly applied to the text with the nested styles applied, and formatting might change!
(function(){
	function IsValid (obj){
		var err;
		try{
			if(!obj){return false}
			if(kAppVersion>=6){
				return obj.isValid;
			}
			var test = obj.parent;
			return true;
		}
		catch(err){return false;}
	}
	function ResetFindPrefs(){
		if(kAppVersion<5){app.findPreferences = null;}
		else{app.findTextPreferences = null;ResetFindChangeOptions();}
	}
	function ResetFindChangeOptions(){
		app.findChangeTextOptions.properties = {
			includeLockedStoriesForFind:false,
			includeLockedLayersForFind:false,
			includeHiddenLayers:false,
			includeMasterPages:false,
			includeFootnotes:false,
			wholeWord:false,
			caseSensitive:false
		}
	}
	function GetTempColor(doc){
		for(var i=0;i<doc.swatches.length;i++){
			if(doc.swatches[i].label == 'harbsTempColor'){return doc.swatches[i]}
		}
		return doc.colors.add({label:'harbsTempColor'});
	}
	function GetAppColor(colorName){
		for(var i=0;i<app.swatches.length;i++){
			if(app.swatches[i].name==colorName){return app.swatches[i]}
		}
		return null;
	}
	if(app.documents.length==0){return}
	kAppVersion = parseFloat(app.version);
	var doc = app.documents[0];
	if(kAppVersion<5){
		var charStyles = doc.characterStyles;
	}else{
		var charStyles = doc.allCharacterStyles;
	}
	var tempDocColor = GetTempColor(doc);
	var colorName = tempDocColor.name;
	var tempAppColor = GetAppColor(colorName);
	var removeAppColor=false;
	if(!tempAppColor){
		removeAppColor=true;
		tempAppColor=app.colors.add({name:colorName})
	}
	for(var i=1;i<charStyles.length;i++){
		var savedColor = charStyles[i].underlineGapColor;
		var finds=undefined;
		var findsLength=0;
		do{
			if(finds){findsLength=finds.length}
			charStyles[i].underlineGapColor=tempDocColor;
			ResetFindPrefs();
			if(kAppVersion<5){
				app.findPreferences.underlineGapColor = tempDocColor;
				app.changePreferences.appliedCharacterStyle = charStyles[i];
				doc.search("",false,false,'');
				break;
			}else{
				if(kAppVersion<6){
					app.findTextPreferences.underlineGapColor = tempAppColor;
				}else{
					app.findTextPreferences.underlineGapColor = tempDocColor;
				}
				app.changeTextPreferences.appliedCharacterStyle = charStyles[i];
				finds = doc.changeText();
				//alert(finds.length);
			}
		}while(findsLength!=finds.length);
		charStyles[i].underlineGapColor=savedColor;
	}
	tempDocColor.remove();
	if(removeAppColor){tempAppColor.remove()}
})();