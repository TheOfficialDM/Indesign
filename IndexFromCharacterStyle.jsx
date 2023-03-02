/* The original script was found here:
http://indesign.hilfdirselbst.ch/text/indexeintrage-auf-der-basis-von-zeichenformaten.html

The script looks for text with a specific character style applied, and creates index entries.
*/
var myErr = mySucc = 0;    
var myList = "";    
var doc = app.activeDocument      
var myCharacterStyle = myDisplayDialog(doc);    
app.changeTextPreferences = NothingEnum.nothing;    
app.findTextPreferences = NothingEnum.nothing;    
    
    
app.findTextPreferences.appliedCharacterStyle = myCharacterStyle;       
var _index = ( doc.indexes.length == 0 )     
    ? doc.indexes.add()  
    : doc.indexes.firstItem();  
f = doc.findText()      
for( oneEntry = f.length-1; oneEntry > -1; oneEntry-- ) {     
    var _topic = null;  
    _topic = _index.topics.itemByName( f[oneEntry].contents );   
    if (_topic == null) {  
        try {  
            _topic = _index.topics.add( f[oneEntry].contents );      
        }   
        catch(e) {   
            selectIt(f[oneEntry]);   
        }   
    }  
    try {    
        _topic.pageReferences.add( f[oneEntry], PageReferenceType.currentPage ) ;     
        mySucc++;    
    }    
    catch(e) {    
        myList +=  f[oneEntry].contents + "\r" ;    
        myErr++;    
    }    
}    
    
alert( "The result:\r" + mySucc + " x successfully\r" + myErr + " x failed:\r-----------\r" + myList );    
    
    
function myDisplayDialog(doc){     
    var myFieldWidth = 120;     
     
    var myCharStyles = doc.characterStyles.everyItem().name;     
     
    var myDialog = app.dialogs.add({name:"Index from character style"});     
    with(myDialog.dialogColumns.add()){     
        with(dialogRows.add()){     
            with(dialogColumns.add()){     
                staticTexts.add({staticLabel:"Character style:", minWidth:myFieldWidth});     
            }     
            with(dialogColumns.add()){     
                var mySourceDropdown = dropdowns.add({stringList:myCharStyles, selectedIndex:myCharStyles.length-1});     
            }     
        }     
    }     
    var myResult = myDialog.show();     
    if(myResult == true){     
        var theCharStyle =myCharStyles[mySourceDropdown.selectedIndex];     
        myDialog.destroy();     
    }     
    else{     
        myDialog.destroy()     
        exit();     
    }     
    return theCharStyle;     
}    
   
function selectIt( theObj )     
{       
    var myZoom = 400;  
    app.select(theObj,SelectionOptions.replaceWith);    
    app.activeWindow.zoomPercentage = myZoom;    
    
    // Option to terminate if called within a loop    
    var myChoice = confirm ("The reference is buggy!\rMore?");     
    if (myChoice == false)     
        exit();     
    return app.selection[0];   
} 