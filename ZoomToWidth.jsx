﻿//DESCRIPTION: Zooms to the width of currently selected object or the current page. http://www.in-tools.comZoomToWidth();function ZoomToWidth(){	var kAppVersion=parseFloat(app.version);	try{		if(File.fs == "Macintosh"){var isMac = true}		else{var isMac = false}		if(kAppVersion>=6 && app.generalPreferences.useApplicationFrame){			var usesApplicationFrame = true;			}		else{var usesApplicationFrame = false}		var sel=app.selection[0];		var window = app.activeWindow;		if(! (window instanceof LayoutWindow) ){return}		var doc = app.documents[0];		var horizViewPrefs = doc.viewPreferences.horizontalMeasurementUnits;		doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.points;		var theWidth = doc.documentPreferences.pageWidth;		var theHeight = doc.documentPreferences.pageHeight;		var theSpread = window.activeSpread;		var pagesLength = theSpread.pages.length;		if(isMac){			var windowWidth = window.bounds[3]-window.bounds[1]-35;			if(usesApplicationFrame){				window.zoom(ZoomOptions.fitSpread);				var spreadZoom = window.zoomPercentage;				windowWidth = (spreadZoom/100)*(theWidth*pagesLength);				}			}		else{			var windowWidth = window.bounds[3]-window.bounds[1]-50;			if(usesApplicationFrame){//|| pagesLength>1 || theWidth>theHeight				window.zoom(ZoomOptions.fitSpread);				var spreadZoom = window.zoomPercentage;				windowWidth = (spreadZoom/100)*(theWidth*pagesLength);				}			}		if(sel && (sel.hasOwnProperty("parentTextFrames") || sel.hasOwnProperty("visibleBounds")) ){			if(sel.hasOwnProperty("parentTextFrames")){				var textFrame = sel.parentTextFrames[0];				var frameBounds = textFrame.visibleBounds;				app.select(sel.parentTextFrames[0]);				}			else{frameBounds = sel.visibleBounds}			theWidth = frameBounds[3]-frameBounds[1];			}		else{window.zoom(ZoomOptions.fitPage)}		window.zoomPercentage = (windowWidth/theWidth)*100;		doc.viewPreferences.horizontalMeasurementUnits = horizViewPrefs;		app.select(sel);		}	catch(e){}	}