/**
* @@@BUILDINFO@@@ tomaxxiVARIprocessor [1.0.5].jsx !Version! Tue Aug 13 2013 22:53:37 GMT+0200
*/
/***********************************************************************************************************
        tomaxiVARIprocessor
            - Convert variable to text based on applied paragraph/character style
            - Apply Object Style to variable's parent text frame
            - Clear Overrides when applying Object Style
        Version : 1.0.5
        Type : Script
        InDesign : CS5-CC
        Author : Marijan Tompa (tomaxxi) | Subotica [Serbia]
        Date : 13/08/2013
        Contact : me (at) tomaxxi (dot) com
        Twitter: @tomaxxi
        Web : http://tomaxxi.com
***********************************************************************************************************/

var
    _u = undefined,
    appName = "tomaxxiVARIprocessor",
    appVer = "1.0.5",
    appShortName = appName + " | " + appVer,
    appFullName = appName + " | " + appVer + " | by tomaxxi™";

main ();

function main () {
    if ( app.documents.length )
        app.doScript ( "tomaxxiVARIprocessor()", _u, _u, UndoModes.ENTIRE_SCRIPT, appName );
    else
        _alert ( "No Documents Opened!", appShortName );
}

function tomaxxiVARIprocessor () {
    var
        mPar = getList ( app.activeDocument.allParagraphStyles ),
        mChr = getList ( app.activeDocument.allCharacterStyles ),
        mVar = app.activeDocument.textVariables.everyItem ().name,
        mObj = getList ( app.activeDocument.allObjectStyles );
        mPar.unshift ( "-- Any Paragraph Style --" );
        mChr.unshift ( "-- Any Character Style --" );
        mVar.shift (), mVar.shift (); mVar.unshift ( "-- Any Variable --" );
    var mD = new Window ( "dialog", appFullName ), mP = mD.add ( "panel" ),
            mG = mD.add ( "group" ), mG1 = mP.add ( "group" ), mG2 = mP.add ( "group" ), mG2a = mP.add ( "group" ),
            mG3 = mP.add ( "panel" ), mG4 = mP.add ( "panel" ); 
            mG1.alignChildren = [ "fill", "left" ], mG2.alignChildren = mG2a.alignChildren = mG3.alignChildren = [ "fill", "left" ];
            mG4.alignChildren = [ "fill", "center" ]; mP.orientation = "column",  mP.alignChildren = [ "fill", "left" ];
            mG4.orientation = "row";
            mG1.add ( "statictext", _u, "Select Variable :" );
            var mVr = mG1.add ( "dropdownlist", _u, mVar );
                mVr.selection = 0, mVr.minimumSize = [ 150, 20 ];
            mG2.add ( "statictext", _u, "Applied Paragraph Style :" );
            var mDr = mG2.add ( "dropdownlist", _u, mPar );
                mDr.selection = 0;
            mG2a.add ( "statictext", _u, "Applied Character Style :" );
            var mDr2 = mG2a.add ( "dropdownlist", _u, mChr );
                mDr2.selection = 0;
            
            
            
            var
                c2t = mG3.add ( "checkbox", _u, "Convert to Text" ),
                mG3_ = mG3.add ( "group" ), aOs = mG3_.add ( "checkbox", _u, "Apply Object Style :" ),
                objS = mG3_.add ( "dropdownlist", _u, mObj ),
                mG3__ = mG3.add ( "group"), cOr = mG3__.add ( "checkbox", _u, "Clear Overrides" );
                objS.enabled = false; objS.selection = 0; mG3__.alignChildren = [ "right", "right" ]; cOr.enabled = false; cOr.value = app.clearOverridesWhenApplyingStyle;
                aOs.onClick = function () { objS.enabled = cOr.enabled = this.value; mOK.enabled = ( c2t.value == true || this.value == true ); };
                c2t.onClick = function () { mOK.enabled = ( aOs.value == true || this.value == true ); };
            var uF = mG4.add ( "checkbox", _u, "Include Footnotes" ),
                uM = mG4.add ( "checkbox", _u, "Include Master Pages" );
                uF.value = app.findChangeGrepOptions.includeFootnotes;
                uM.value = false;
                uM.onClick = function () { if ( this.value == true ) _alert ( "By using this option, all Master Page items that\rcontain targeted Text Variable will be overridden to the page.\r\rText Variables inside grouped, anchored items will NOT be processed.", appFullName, true ); };
            var mOK = mG.add ( "button", _u, "OK" ); mG.add ( "button", _u, "Cancel" ); var _txt = mG.add ( "statictext", _u, "http://tomaxxi.com/" );
            _txt.onClick = function () { gotoLink ( "http://tomaxxi.com" ); };
            _txt.onDraw = function () {
                var
                    linePen = mD.graphics.newPen ( mD.graphics.PenType.SOLID_COLOR, [ 0, 0, 0 ], 1 ),
                    gx = this.graphics, sz = this.preferredSize, y = sz [ 1 ] - 1;
                    gx.drawOSControl (); gx.newPath (); gx.moveTo ( 0, y );
                    gx.lineTo ( sz [ 0 ], y ); gx.strokePath ( linePen );
            };
            mOK.enabled = false;
            mOK.onClick = function () { if ( aOs.value == true || c2t.value == true ) mD.close ( 1 ); };
    mD.center ();
    var mA = mD.show ();
    if ( mA == true ) {
        app.findGrepPreferences = app.changeGrepPreferences = NothingEnum.nothing;
        var oldPrefs = [ app.findChangeGrepOptions.includeFootnotes, app.findChangeGrepOptions.includeMasterPages ];
        app.findChangeGrepOptions.includeFootnotes = uF.value;
        app.findChangeGrepOptions.includeMasterPages = uM.value;
        app.findGrepPreferences.findWhat = "~v";
        app.findGrepPreferences.appliedParagraphStyle = mDr.selection.index != 0 ? app.activeDocument.allParagraphStyles [ mDr.selection.index - 1 ] : "";
        app.findGrepPreferences.appliedCharacterStyle = mDr2.selection.index != 0 ? app.activeDocument.allCharacterStyles [ mDr2.selection.index - 1 ] : "";
        var myF = app.activeDocument.findGrep (), count = Number ( 0 ), i = myF.length - 1, countOver = 0;
        if ( uM.value == true ) {
            for ( i ; i >= 0 ; i-- ) {
                if ( myF [ i ].textVariableInstances.length > 0 && ( mVr.selection.index == 0 || myF [ i ].textVariableInstances [ 0 ].name == String ( mVr.selection ) ) ) {
                    if ( myF [ i ].parentTextFrames [ 0 ].parent.hasOwnProperty ( "baseName" ) ) {
                        var
                            pO = getPagesMaster ( myF [ i ].parentTextFrames [ 0 ].parent ), p = 0,
                            tF = myF [ i ].parentTextFrames [ 0 ];
                        for ( p ; p < pO.length ; p++ )
                            doOverride ( app.activeDocument, pO [ p ], tF ), countOver++;
                    }
                }
            }
            var myF = app.activeDocument.findGrep (), count = Number ( 0 ), i = myF.length - 1;
        }
        for ( i ; i >= 0 ; i-- ) {
            if ( myF [ i ].textVariableInstances.length > 0 && ( mVr.selection.index == 0 || myF [ i ].textVariableInstances [ 0 ].name == String ( mVr.selection ) ) ) {
                if ( c2t.value == true )
                    myF [ i ].textVariableInstances [ 0 ].convertToText ();
                if ( aOs.value == true )
                    if ( myF [ i ].parent.overflows )
                        myF [ i ].parentStory.textContainers [ myF [ i ].parentStory.textContainers.length - 1 ].applyObjectStyle ( app.activeDocument.allObjectStyles [ objS.selection.index ], cOr.value, _u );
                    else
                        myF [ i ].parentTextFrames [ 0 ].applyObjectStyle ( app.activeDocument.allObjectStyles [ objS.selection.index ], cOr.value, _u );
                count++;
            }
        }
        count > 0 ? _alert ( "Number of Processed Variables: " + count + ( uM.value == true && countOver > 0 ? "\rSome Master Page items were overridden during the process." : "" ), appShortName ) : _alert ( "No Variables Processed.", appShortName );
        app.findGrepPreferences = app.changeGrepPreferences = NothingEnum.nothing;
        app.findChangeGrepOptions.includeFootnotes = oldPrefs [ 0 ];
        app.findChangeGrepOptions.includeMasterPages = oldPrefs [ 1 ];
    }
    function getPagesMaster ( fMaster ) {
        var
            mP = [], i = 0,
            dP = app.activeDocument.pages,
            dPl = dP.length;
        for ( i ; i < dPl ; i++ )
            if ( dP [ i ].appliedMaster == fMaster )
                mP.push ( dP [ i ].documentOffset );
        return mP;
    }
    function doOverride ( doc, page, item ) {
      var
        aI = doc.pages [ page ].appliedMaster.pageItems.everyItem ().getElements (),
        i = 0;
      for ( i ; i < aI.length ; i++ ) {
            try {
                if ( aI [ i ] == item ) aI [ i ].override ( doc.pages [ page ] ) }
            catch ( _ ) { };
        }
    }
    function getList ( obj ) {
        var
            arr = [], i = 0;
        for ( i ; i < obj.length ; i++ )
            arr.push ( obj [ i ].name );
        return arr;
    }
}

////////////////// FUNCTIONS //////////////////
function _alert ( message, title, errorIcon ) {
    if ( isMac () )
        alert ( title + "\n\n" + message );
    else
        alert ( message, title, errorIcon );
}
function isMac () {
    return ( File.fs == "Macintosh" );
}
function gotoLink ( url ) {
    var
        body, language;
    url = url || "http://tomaxxi.com";
    if ( isMac () )
        body = 'tell application "Finder"\ropen location "' + url + '"\rend tell',
        language = ScriptLanguage.APPLESCRIPT_LANGUAGE;
    else
        body = 'dim objShell\rset objShell = CreateObject("Shell.Application")\rstr = "' + url + '"\robjShell.ShellExecute str, "", "", "open", 1 ',
        language = ScriptLanguage.VISUAL_BASIC;
    app.doScript ( body, language );
}