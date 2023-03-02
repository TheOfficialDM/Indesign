//http://forums.adobe.com/thread/681085 (Ariel's script to select a paragraph style)
//http://forums.adobe.com/message/5888276 (jkorchok2's script to apply grep styles from a predefined paragraph style)
//This utility will copy GREP styles into styles that are nested in up to two levels of groups i.e. Main Style Group>Headings Group>Heading 1
myDoc = app.activeDocument;
myStyle = SelectParagraph();

function SelectParagraph(){
mydialog = app.dialogs.add({name:"Source Paragraph Style", canCancel:true});
myStyles = myDoc.allParagraphStyles;
var mystring = [];
for (aa = 0; aa < myStyles.length; aa ++){
mystring[aa] = myStyles[aa].name;
if (myStyles[aa].parent.constructor.name == "ParagraphStyleGroup") mystring[aa]+=" ["+myStyles[aa].parent.name+"]";
}
with (mydialog.dialogColumns.add()){
staticTexts.add({staticLabel:"Please choose:"});
}
with (mydialog.dialogColumns.add()){
mymenu = dropdowns.add({stringList:mystring, selectedIndex:0});
}
if (mydialog.show()) myresult = myStyles[mymenu.selectedIndex]
else myresult =-1;
mydialog.destroy();
return(myresult);
}


var theDoc = app.activeDocument;  
var pStyles = theDoc.allParagraphStyles;
var pStyleStringList = [];// listbox  
fillpStyleStringList();  
var getpStyleIndexinpStyles = selectpStyle(pStyleStringList);
var selectedpStylesByName = getSelectedpStyleNames(getpStyleIndexinpStyles);
l = selectedpStylesByName.length;

while(l--){setGrepStyle([selectedpStylesByName[l][0]],[selectedpStylesByName[l][1]],[selectedpStylesByName[l][2]])}

function fillpStyleStringList(){  
    for(i = 0 ; i < pStyles.length; i++){  
        if(pStyles[i].parent.parent.toString() === '[object ParagraphStyleGroup]'){
            pStyleStringList.push('Group: ' + pStyles[i].parent.parent.name + ', Subgroup: ' + pStyles[i].parent.name + ', Name: ' + pStyles[i].name);
        }else if(pStyles[i].parent.toString() === '[object ParagraphStyleGroup]'){
            pStyleStringList.push('Subgroup: ' + pStyles[i].parent.name + ', Name: ' + pStyles[i].name);
        }else{
            pStyleStringList.push('Name: ' + pStyles[i].name);
        }
    }
}

function selectpStyle (array){
    var myWindow = new Window ("dialog", "Please select the target paragraph styles.");
    var myInputGroup = myWindow.add ("group");
    var select = myInputGroup.add ("listbox", [0, 0, 300, 300], array, {scrolling: true, multiselect: true});
    var myButtonGroup = myWindow.add ("group");
    myButtonGroup.add ("button", undefined, "OK");
    myButtonGroup.add ("button", undefined, "Cancel");
    if (myWindow.show() == 1){
        var mySelection = select.selection;
        var tmpList = [];
        for(g = 0; g < mySelection.length; g++){
      tmpList.push(mySelection[g].index);
        }
        return tmpList;
        myWindow.close();
    }else{
        exit();
    }
}

function getSelectedpStyleNames(getpStylesIndexinpStyles){
  var currentTargetpStyleName;
  var SelectedNameArray = new Array();
  for(j = 0; j < getpStylesIndexinpStyles.length; j++){
    var tempArray = new Array(2);
    currentTargetpStyleName = pStyles[getpStyleIndexinpStyles[j]].name;
    currentTargetpStyleSubgroup = pStyles[getpStyleIndexinpStyles[j]].parent.name;
    currentTargetpStyleGroup = pStyles[getpStyleIndexinpStyles[j]].parent.parent.name;
    tempArray[0] = currentTargetpStyleGroup;
    tempArray[1] = currentTargetpStyleSubgroup;
    tempArray[2] = currentTargetpStyleName;
    SelectedNameArray[j] = tempArray;
    }
    return SelectedNameArray;
}

function setGrepStyle(targetGroup, targetSubgroup, targetName){
  var target
    error = "";
    basepStyle = myresult;
    if (!basepStyle.isValid) error = 'Source style does not exist';
  if(targetGroup != "" && targetGroup != theDoc.name && targetGroup != app.name){
    var temptarget = theDoc.paragraphStyleGroups.itemByName(targetGroup.toString());
    target = temptarget.paragraphStyleGroups.itemByName(targetSubgroup.toString()).paragraphStyles.itemByName(targetName.toString());
  }else if(targetSubgroup != "" && targetSubgroup != theDoc.name && targetSubgroup != app.name){
    target = theDoc.paragraphStyleGroups.itemByName(targetSubgroup.toString()).paragraphStyles.itemByName(targetName.toString());
  }else{
    target = theDoc.paragraphStyles.itemByName(targetName.toString());
  }
    if (!target.isValid) error += '\rTarget style does not exist';
    if (error != ""){alert (error); exit()}
    gs = basepStyle.nestedGrepStyles;
    for (i = 0; i < gs.length; i++){
        target.nestedGrepStyles.add (gs[i].properties);
    }
}