//DESCRIPTION Removes all empty pages in the current document
// (c) Harbs www.in-tools.com
var appVersion = parseFloat(app.version);
if(appVersion<6){main();}
else{app.doScript (main,undefined,undefined,UndoModes.FAST_ENTIRE_SCRIPT,"Remove Empty Pages")}

function main(){
	var d=app.dialogs.add({name:"Define Empty Pages"});
	var radioBtns = d.dialogColumns.add().radiobuttonGroups.add();
	radioBtns.radiobuttonControls.add({staticLabel:"No Objects",checkedState:true});
	radioBtns.radiobuttonControls.add({staticLabel:"No Text"});
	if(!d.show()){d.destroy();return}
	var emptyOption = radioBtns.selectedButton;
	d.destroy();
	var pages = app.documents[0].pages.everyItem().getElements();
	for(var i = pages.length-1;i>=0;i--){
		var removePage = true;
		if(pages[i].pageItems.length>0){
	 		var items = pages[i].pageItems.everyItem().getElements();
	 		if(emptyOption==0){
	 			if(items.length>0){removePage=false}
	 		} else {
				for(var j=0;j<items.length;j++){
					if(!(items[j] instanceof TextFrame)){removePage=false;break}
					if(items[j].contents!=""){removePage=false;break}
				}
			}
		}
		if(i==0 && app.documents[0].pages.length==1){removePage = false}
		if(removePage){pages[i].remove()}
	}
	//beep();
	alert("Done!");
}
