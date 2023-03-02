//DESCRIPTION:Selects the next hyphenated word in the current story.
// Find Hyphenations version 1.2
// (c) http://in-tools.com
// Use at your own risk!

main();
function main(){
	var sel=app.selection;
	if(!sel || sel.length!=1){alert("Please select some text!");return}
	sel=sel[0];
	if(! (sel.hasOwnProperty("baseline"))){alert("Please select some text!");return}
	var curIndex = sel.insertionPoints[-1].index;
	var story = sel.parentStory;
	if(curIndex>=story.characters.length){curIndex=-1}
	var text = story.texts.itemByRange(story.characters[curIndex],story.characters[-1]);
	for(var i=0;i<text.words.length;i++){
		if(text.words[i].lines.length>1){ShowIt(text.words[i]);return}
	}
	alert("No Hyphenated Words Found");
}

function ShowIt(theObj) {// Select object, turn to page and center it in the window
	if (arguments.length > 0) {
		app.select(theObj);
		try{
			var thePage = FindWhere(theObj);
			if(thePage){
				app.activeWindow.activePage = thePage;
			}
		}catch(e){}
	}
 // Note: if no object is passed and there is no selection the current page
 // will be centered in the window at whatever zoom is being used
	var myZoom = app.activeWindow.zoomPercentage;
	app.activeWindow.zoom(ZoomOptions.showPasteboard);
	app.activeWindow.zoomPercentage = myZoom;
	}
function FindWhere(obj, where){
	var getTextContainer = function (s){
		if(kAppVersion<5){return s.textFrames[-1]}else{return s.textContainers[s.textContainers.length-1]}
	}
	var getobj = function (fm){//returns the parent text frame, or the last one of the parnet story
		if(fm != undefined){return fm;}else{return getTextContainer(obj.parentStory);}
	}
	var getobj_ptf  = function (obj){//get the parent text frame or return the original object (necessary for Notes)
		try{ return obj.parentTextFrames[0]}catch(e){return obj}
	}
	var getobj_cell = function (fm){//returns the parent text frame, or the last one of the parnet story -- for cells
		if(fm != undefined){return fm;}else{return getTextContainer(obj.insertionPoints[0].parentStory);}
	}
	var getnote_tf = function (note){//gets the note location for both footnotes and notes in all versions...
		if(kAppVersion<5){
			if(note.hasOwnProperty("footnoteTextFrame")){var parentFrame = note.footnoteTextFrame}//no good for overset...
			else{var parentFrame = note.parentTextFrame}
			if(parentFrame){return parentFrame}
			else{return note.parent}
		}
		else{return note.storyOffset}
	}
	var e;
	if(!obj){return null}
	if(where == undefined){var where = Page;}
	if(where == Page && kAppVersion > 6 && (obj.parent instanceof Spread || obj.parent instanceof MasterSpread)){
		return obj.parentPage;
	}
//		if(where == Page && kAppVersion > 6){
//			return obj.parentPage;
//		}
	//if(where==Page){return app.callExtension(0x90B6C,10019,obj);}
	if(obj.hasOwnProperty("baseline")){obj = getobj(getobj_ptf (obj))}
	while(obj){
		if(where == Page && kAppVersion > 6 && (obj.parent instanceof Spread || obj.parent instanceof MasterSpread)){
			return obj.parentPage;
		}
		switch(obj.constructor){
			case where: return obj;
			case Story: obj = getTextContainer(obj);break;
			case Character: obj = getobj(getobj_ptf (obj));break;
			case Cell: obj = getobj_cell(getobj_ptf(obj.insertionPoints[0]));break;
			case Note:
			case Footnote: obj = getnote_tf(obj);break;
			case Application: return null;
		}
		if (!obj) return null; 
		obj = obj.parent;
	}
	return null;
}//end function findWhere
