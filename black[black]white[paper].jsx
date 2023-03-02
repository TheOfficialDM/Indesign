//DESCRIPTION:Makes any swatch with 100% Black value the [Black] and any swatch that is white as [Paper]
//https://forums.adobe.com/message/2908764#2908764
#target indesign 
if (parseFloat(app.version) < 6)
doReplace();
else
app.doScript(doReplace, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, "[Black] and [Paper] converter");
function doReplace ()
{
var myDoc = app.activeDocument;
var myColors = myDoc.colors;
var myBlack = myDoc.swatches.itemByName("Black");
var myWhite = myDoc.swatches.itemByName("Paper");

 

for (i = myColors.length-1; i >= 0; i--) {
    var myColor = myColors[i];
    if (myColor.colorValue == "0,0,0,100" && myColor.name != "Black" && myColor.model===ColorModel.PROCESS) {
        myColor.remove(myBlack);
        }
}
for (i = myColors.length-1; i >= 0; i--) {
    var myColor = myColors[i];
    if (myColor.colorValue == "0,0,0,0" && myColor.name != "Paper") {
        myColor.remove(myWhite);
        }
}
}
