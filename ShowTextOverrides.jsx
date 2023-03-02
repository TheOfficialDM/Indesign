#targetengine "InTools"
install();
function install(){
	ShowFormattingController = {};
	var actionname = "Hide Text Overrides";
	var action = app.scriptMenuActions.item(actionname);
	if(action == null) {
		var actionname = "Show Text Overrides";
		var action = app.scriptMenuActions.item(actionname);
		if(action == null) {
			var action = app.scriptMenuActions.add(actionname);
		}
	}
	action.checked = false;
	action.enabled = true;
	action.addEventListener("beforeDisplay", enableDisable);
	action.addEventListener("onInvoke", toggleShowTextFormatting);
	ShowFormattingController.action = action;
	
	var typeMenu = app.menus.item('$ID/Main').submenus.item('$ID/&Type');
	typeMenu.menuItems.add(action);
}
function enableDisable(){
	if(app.documents.length == 0){
		if(app.textPreferences.enableStylePreviewMode){
			ShowFormattingController.action.title = "Hide Text Overrides";
		} else {
			ShowFormattingController.action.title = "Show Text Overrides";
		}
	} else {
		if(app.activeDocument.textPreferences.enableStylePreviewMode){
			ShowFormattingController.action.title = "Hide Text Overrides";
		} else {
			ShowFormattingController.action.title = "Show Text Overrides";
		}
	}
}
function toggleShowTextFormatting(){
	if(app.documents.length == 0){
		app.textPreferences.enableStylePreviewMode^= 1;
	} else {
		app.activeDocument.textPreferences.enableStylePreviewMode^= 1;
	}
}