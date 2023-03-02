//DESCRIPTION: Create and edit placeholders in text frames
//Version 2.1
//AUTHOR: Mario Fritsche || moin@elbe-satz.de
//DATE: 22.08.2019 

#targetengine "sessionPlaceholderText";

// preventively activate the display of dialogs
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;

// Check if a document is open
if (app.documents.length == 0) {
    alert("There is no document open.", "Attention");
    exit();
}

var _dok = app.activeDocument;
_tfName = 'Placeholder text'; // Name of the text frame (layer palette)

var dialog = new Window("palette");
dialog.text = "PlaceholderText Light v2";
dialog.preferredSize.width = 324;
dialog.orientation = "column";
dialog.alignChildren = ["left", "top"];
dialog.spacing = 12;
dialog.margins = 16;

var statictext1 = dialog.add("group");
statictext1.orientation = "column";
statictext1.alignChildren = ["left", "center"];
statictext1.spacing = 4;
statictext1.alignment = ["left", "top"];
statictext1.add("statictext", undefined, "Update selected text frame");

var _load = dialog.add("button");
_load.text = "Update";
_load.justify = "left";
_load.alignment = ["left", "top"];

var divider1 = dialog.add("panel");
divider1.alignment = "fill";

var statictext2 = dialog.add("group");
statictext2.orientation = "column";
statictext2.alignChildren = ["left", "center"];
statictext2.spacing = 0;
statictext2.alignment = ["left", "top"];
statictext2.add("statictext", undefined, "Create new text frame with placeholder text");

var _new = dialog.add("button");
_new.text = "New text frame";
_new.justify = "center";
_new.alignment = ["left", "top"];

var _close = dialog.add("button", undefined, undefined, { name: "Ok" });
_close.text = "Close";
_close.justify = "center";
_close.alignment = ["right", "top"];

dialog.show();

// Close dialogue
_close.onClick = function () {
    dialog.close();
}

// Update dialog
_load.onClick = function () {
    _check()
    _reload()
    _placeholderText();
}

// New text frame dialog box
_new.onClick = function () {
    _newTf();
}

// Check if an object is selected
function _check() {

    if (
        app.selection.length == 0
    ) {
        alert('No text frame was selected');
        exit()
    }

    if (app.selection[0] instanceof TextFrame) {
        var _story = app.selection[0].parentStory;
    }
    if (
        app.documents.length > 0 &&
        app.selection.length == 1 &&
        app.selection[0] instanceof InsertionPoint ||
        app.selection[0] instanceof Word ||
        app.selection[0] instanceof Text ||
        app.selection[0] instanceof TextStyleRange ||
        app.selection[0] instanceof Paragraph ||
        app.selection[0] instanceof TextColumn ||
        app.selection[0] instanceof Line
        
        ){
            app.menuActions.itemByID(119681).invoke();  
            exit()
        } 

    else if (app.selection[0] instanceof Rectangle) {
        alert('A rectangle frame was selected!\rPlease select a text frame');
        exit()
    }
    
}

// Delete overset
function _placeholderText() {
    var _Story = app.selection[0].parentStory;
    var _placeholderTextStart = _Story.textContainers[_Story.textContainers.length - 1].characters.lastItem().index + 1;
    var _placeholderTextEnd = _Story.characters.length - 1;
    var _placeholderText = _Story.characters.itemByRange(_placeholderTextStart, _placeholderTextEnd);
    var _auswahl = app.selection;
    _auswahl[0].name = _tfName;
    _placeholderText.remove();

}

// Fill text frame with text
function _reload() {
    app.selection[0].contents = TextFrameContents.placeholderText;
}

// Create a new text frame
function _newTf() {
    var _y1 = _dok.marginPreferences.top;
    var _x1 = _dok.marginPreferences.left;
    var _pos1 = [0, 0];         // y1, x1  Left upper corner
    var _hoehe = 20;           // Height of the text frame
    var _breite = 100;          // Width of the text frame
    var _page = app.layoutWindows[0].activePage;
    var _tf = _page.textFrames.add();
    _tf.geometricBounds = [_pos1[0], _pos1[1], _pos1[0] + _hoehe, _pos1[1] + _breite];
    _tf.name = _tfName;
    _tf.contents = TextFrameContents.placeholderText;
}
