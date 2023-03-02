//get unique Array elements
Array.prototype.unique = function (){
    var r = new Array();
    for(var i = 0, n = this.length; i < n; i++){
        for(var x = 0, y = r.length; x < y; x++){
            if(r[x]==this[i]) continue o;}
        r[r.length] = this[i];}
    return r;
}

//search inside array
Array.prototype.findIn = function(search){
    var r = Array();
    for (var i=0; i<this.length; i++)
        if (this[i].indexOf(search) != -1){
            r.push(this[i].substr(this[i].indexOf("\t") + 1, this[i].length));
        }
    return r;
}

var usedFonts = app.activeDocument.fonts;

var sysFonts = app.fonts.everyItem();
sysFontsList = sysFonts.fontFamily.unique();
sysFontsList.unshift("- Select Font Family -");

var fontsWin = new Window('dialog', 'Document Fonts');
fontsWin.alignChildren = 'center';

var allFonts = fontsWin.add('listbox', undefined, undefined, {numberOfColumns: 5, showHeaders: true, columnTitles: ['Font Name', 'Font Style', 'Font PS Name', 'Font Type', 'Chr count']});
allFonts.minimumSize = [600,150];

var myGrp = fontsWin.add('group');
myGrp.alignChildren = 'center';

var availableFonts = myGrp.add('dropdownlist',undefined,sysFontsList);
var availableStyles = myGrp.add('dropdownlist');
var okButton = myGrp.add('button',undefined,'OK');
var okButton = myGrp.add('button',undefined,'Cancel');

availableStyles.minimumSize = [180,25];
availableFonts.selection = 0;
availableFonts.onChange = function(){
    availableStyles.removeAll();
    var sysFontAvailableStyles = sysFonts.name.findIn(availableFonts.selection);
    for(var i = 0; i < sysFontAvailableStyles.length; i++)availableStyles.add('item',sysFontAvailableStyles[i]);
    availableStyles.selection = 0;
}

//// SHOW JUST MISSING FONTS //// [START]

for(var i = 0; i < usedFonts.length; i++){
    if(usedFonts[i].status != FontStatus.INSTALLED){
        allFonts.add('item',usedFonts[i].fontFamily);
        allFonts.items[allFonts.items.length-1].image = File('/l/alert_icon.png');
        allFonts.items[allFonts.items.length-1].subItems[3].text = findCharacters(usedFonts[i].name);
        allFonts.items[allFonts.items.length-1].subItems[0].text = usedFonts[i].fontStyleName;
        allFonts.items[allFonts.items.length-1].subItems[1].text = usedFonts[i].postscriptName;
        allFonts.items[allFonts.items.length-1].subItems[2].text = usedFonts[i].fontType;
    }
}

//// SHOW JUST MISSING FONTS //// [END]

allFonts.selection = 0;

fontsWin.center();

var fontAnswer = fontsWin.show();

if(fontAnswer == true && availableFonts.selection != 0){
    var sourceFont = allFonts.selection.text + "\t" + allFonts.selection.subItems[0].text;
    var destFont = availableFonts.selection.text + "\t" + availableStyles.selection.text;
    changeFont(sourceFont,destFont);
}else{
    alert('No Actions taken!');
}

function findCharacters(findFont){
    app.findGrepPreferences = NothingEnum.nothing;
    app.changeGrepPreferences = NothingEnum.nothing;
    app.findGrepPreferences.findWhat = ".";
    app.findGrepPreferences.appliedFont = findFont;
    var result = Number(app.activeDocument.findGrep().length);

    return result;
}

function changeFont(sourceFont, destinationFont){
    app.findTextPreferences = NothingEnum.nothing;
    app.changeTextPreferences = NothingEnum.nothing;
    app.findTextPreferences.appliedFont = sourceFont;
    app.changeTextPreferences.appliedFont = destinationFont;
    app.activeDocument.changeText();
}

/*
Also, if you want to see all document fonts in dialog change loop between comments with this one:
//// SHOW ALL FONTS //// [START]

for(var i = 0; i < usedFonts.length; i++){
    if(usedFonts[i].status == FontStatus.INSTALLED){
        allFonts.add('item',usedFonts[i].fontFamily);
    }else{
        allFonts.add('item',usedFonts[i].fontFamily);
        allFonts.items[i].image = File('/m/alert_icon.png');
        allFonts.items[i].subItems[3].text = findCharacters(usedFonts[i].name);
    }
    allFonts.items[i].subItems[0].text = usedFonts[i].fontStyleName;
    allFonts.items[i].subItems[1].text = usedFonts[i].postscriptName;
    allFonts.items[i].subItems[2].text = usedFonts[i].fontType;
}

//// SHOW ALL FONTS //// [END]
*/