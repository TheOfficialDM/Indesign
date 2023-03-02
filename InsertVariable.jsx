﻿#targetengine "Harbs";//Header(function(){var err;var HarbsUI = {}HarbsUI.StandardButtonGroup = function (container,okayButton,cancelButton,spacer,newButton,editButton,deleteButton,size,orientation,alignChildren){	if(!container){alert("You Must Provide a Container for the Button Group!");return;}	//if(!alignChildren){alignChildren='fill';}	//if(!orientation){orientation='column'}	var group = container.add('group');	group.orientation = orientation || 'column';	group.alignChildren = alignChildren || 'fill';	group.spacing = 0;	if(size){		if(group.orientation=='column'){			group.preferredSize.width = size;			}		else if(group.orientation=='row'){			group.preferredSize.height = size;			}		}	if(okayButton || (okayButton == undefined && group.window.type == 'dialog')){		if(!okayButton){okayButton="OK"}		group.okayButton = group.add('button', undefined, okayButton, {name:'ok'});		}	if(cancelButton|| (cancelButton == undefined && group.window.type == 'dialog')){		if(!cancelButton){cancelButton='Cancel'}		group.cancelButton =group.add('button', undefined, cancelButton, {name:'cancel'});		}	group.cancelButton.onClick = function(){		group.window.close();		}	if(spacer){		group.spacer = group.add('group');		if(group.orientation=='row'){			group.spacer.preferredSize.width=spacer;			}		else{			group.spacer.preferredSize.height=spacer;			}		}	if(newButton){		group.newButton =group.add('button', undefined, newButton);		}	if(editButton){		group.editButton =group.add('button', undefined, editButton);		}	if(deleteButton){		group.deleteButton =group.add('button', undefined, deleteButton);		}	return group;	}//HarbsUI.DropdownGroup = function(container,dropdownLabel,dropdownList,selectedIndex,labelWidth,ddWidth,height){	var group = container.add('group');	group.orientation = 'row';	group.alignChildren = 'top';	if(height){group.maximumSize.height = height}	group.group = group.add('group');	group.group.orientation = 'column';	group.group.alignChildren = 'right';	group.group.margins = 0;	if(labelWidth){group.group.preferredSize.width = labelWidth}	group.label = group.group.add('statictext',undefined,dropdownLabel);	group.dropdown = group.add('dropdownlist',undefined,undefined,{items:dropdownList});	group.dropdown.selection = selectedIndex;	if(ddWidth){group.dropdown.preferredSize.width = ddWidth;}	group.dropdown.name = group.label;	return group.dropdown;	}//HarbsUI.DropDownDialog = function (title,dropdownLabel,dropdownList,selectedIndex){	var w = new Window ('dialog', title);	w.orientation = 'row';w.alignChildren = 'top';	w.dropdown = new HarbsUI.DropdownGroup(w,dropdownLabel,dropdownList,selectedIndex);	w.buttons = new HarbsUI.StandardButtonGroup(w);	w.buttons.cancelButton.active = true;	return w;	}//try{	var doc = app.documents[0];	var variables = doc.textVariables;	var variableNames = variables.everyItem().name;	var d = HarbsUI.DropDownDialog("Pick a Variable","Variables",variableNames,0);	d.dropdown.active=true;	if(d.show()){		var variableIndex = d.dropdown.selection.index;		var selectedVariable = variables[variableIndex];		app.selection[0].textVariableInstances.add({associatedTextVariable:selectedVariable});		}	}catch (err){}//Trailer})();