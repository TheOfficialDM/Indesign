/******************************************************************/
/*                                                                */
/*            Author: Frédéric ROBIN (robinfredericf)             */
/*                                                                */
/*        http://robinfredericf.free.fr                           */
/*        http://www.linkedin.com/in/robinfredericf               */
/*                                                                */
/******************************************************************/

#target "InDesign";
#targetengine "yolo1630616238564";


$.localize = true;
$.locale = null;
//$.locale = 'en';


function getParentPageOrNearestPage (item) {
     /* Nearest page for item out of page */
    if ('parentPage' in item && item.parentPage !== null) { return item.parentPage; }
    
    /*
        Si un pageItem n'a pas de parentPage il est probablement en dehors d'une page sur la table de montage. 
        En remontant dans la hiérarchie de ses parents on finira par atteindre une planche (Spread/MasterSpread). 
        Dans le cas d'un objet ancré il faut remonter dans ses parents en bifurquant vers parentTextFrames[0] 
        sans quoi ses parents seront Character > Story > Document > Application 
    */
    if ('parentTextFrames' in item) { return getParentPageOrNearestPage (item.parentTextFrames[0]); }
    
    /* Cas d’un objet sur le plan de montage */
    if (/(Master)?Spread/.test(item.parent.constructor.name)) {
        var spread = item.parent;
        /*Cas ou l’objet est dans le plan de montage à gauche ou à droite des pages*/
        if (item.geometricBounds[3] < spread.pages.firstItem().bounds[1]) {
            return spread.pages.firstItem();
        }
        if (item.geometricBounds[1] > spread.pages.lastItem().bounds[3]) {
            return spread.pages.lastItem();
        }
        /*Cas ou l’objet est dans le plan de montage au dessus ou en dessous des pages*/
        for (var i=0; i<spread.pages.length; i++) {
            if (item.geometricBounds[1] < spread.pages[i].bounds[3]) {
                return spread.pages[i];
            }
        }
    }
    
    /* Fallback */
    //$.writeln (item.constructor.name);
    switch (item.constructor.name) {
        case 'Document' :     return item.pages[0];
        case 'MasterSpread' : return item.pages[0];
        case 'Spread' :       return item.pages[0];
        case 'Page' :         return item;
        default: return getParentPageOrNearestPage (item.parent);
    }
}


function getSelectionBounds() {
    /*Pour obtenir les limites d’une sélection de plusieurs objets non groupés*/
    
    var theBounds = app.transformPreferences.dimensionsIncludeStrokeWeight ? 'visibleBounds' : 'geometricBounds';
    
    var myItems = new Array;
    for (var i=0; i<app.selection.length; i++) {
        if (theBounds in app.selection[i] == false) { continue; }
        myItems.push(app.selection[i]);
    }
    if (! myItems.length) { return false; }
    
    var allMyItemsBounds = [ [],[],[],[] ];
    for (var i=0; i<myItems.length; i++) {
        allMyItemsBounds[0].push(myItems[i][theBounds][0]);
        allMyItemsBounds[1].push(myItems[i][theBounds][1]);
        allMyItemsBounds[2].push(myItems[i][theBounds][2]);
        allMyItemsBounds[3].push(myItems[i][theBounds][3]);
    }
    
    var sortNumbers = function (a, b) { return a - b; };
    allMyItemsBounds[0].sort(sortNumbers);
    allMyItemsBounds[1].sort(sortNumbers);
    allMyItemsBounds[2].sort(sortNumbers); allMyItemsBounds[2].reverse();
    allMyItemsBounds[3].sort(sortNumbers); allMyItemsBounds[3].reverse();
    
    return [
        allMyItemsBounds[0][0],
        allMyItemsBounds[1][0],
        allMyItemsBounds[2][0],
        allMyItemsBounds[3][0]
    ];
}


var prefs = File($.fileName).name.replace(/\W/g, ''); 
// préférences mémorisées sour un nom spécifique au script actif pour éviter les conflit avec les préférences d'autres scripts

if (! (prefs in $.global)) {
    $.global[prefs] = {
        bleedCB: { value: false },
        slugCB: { value: true },
        extendCB: { value: false },
        toChangeCB: {
            'TopOffset'            :  { value: true },
            'InsideOrLeftOffset'   :  { value: true },
            'BottomOffset'         :  { value: true },
            'RightOrOutsideOffset' :  { value: true },
            'OutsideOrRightOffset' :  { value: true }
        }
    };
}

function main() {

    if (!app.documents.length) { 
        alert({
            en: "No document open!", 
            fr: "Aucun document ouvert !"
        }); 
        return false; 
    }
    var d = app.activeDocument;
    //app.select (d.selection[0], SelectionOptions.REPLACE_WITH);
    var b = getSelectionBounds();
    if (!b) { 
        alert({
            en: "No page item selected!", 
            fr: "Aucun bloc sélectionné !"
        }); 
        return false; 
    }
    var box = {
        'TopOffset'            :  - d.zeroPoint[1] - b[0],
        'InsideOrLeftOffset'   :  - d.zeroPoint[0] - b[1],
        'BottomOffset'         :  + d.zeroPoint[1] + b[2] - d.documentPreferences.pageHeight,
        'RightOrOutsideOffset' :  + d.zeroPoint[0] + b[3] - d.documentPreferences.pageWidth 
    };
    if (
        d.documentPreferences.facingPages &&
        getParentPageOrNearestPage(app.selection[0]).side == PageSideOptions.LEFT_HAND
    ) {
        var mirror = {
            'InsideOrLeftOffset'   : box['RightOrOutsideOffset'],
            'RightOrOutsideOffset' : box['InsideOrLeftOffset']
        };
        box['RightOrOutsideOffset'] = mirror['RightOrOutsideOffset'];
        box['InsideOrLeftOffset']   = mirror['InsideOrLeftOffset'];
    }
    box ['OutsideOrRightOffset'] = box['RightOrOutsideOffset'];
    //alert (box.toSource());
    var w = new Window ('dialog', File($.fileName).name);
    with (w.add (
        'panel', 
        undefined, 
        {
            en: "Fit to selected items:", 
            fr: "Adapter aux éléments sélectionnés :"
        }, 
        undefined
    )) {
        orientation = 'row';
        alignChildren = 'center';
        var bleedCB = add (
            'checkbox', 
            undefined, 
            {
                en: "document bleed", 
                fr: "la zone de fond perdu"
            }
        );
        bleedCB.value = $.global[prefs].bleedCB.value;
        var slugCB = add (
            'checkbox', 
            undefined, 
            {
                en: "slug area", 
                fr: "la zone de ligne-bloc"
            }
        );
        slugCB.value = $.global[prefs].slugCB.value;
    }
    with (w.add ('panel')) {
        orientation = 'column';
        alignChildren = 'left';
        var toChangeCB = { 
            'TopOffset'            :  add (
                'checkbox', 
                undefined, 
                { en: "Top:", fr: "De tête :" } + " " + box['TopOffset']
            ),
            'InsideOrLeftOffset'   :  add (
                'checkbox', 
                undefined, 
                (
                    d.documentPreferences.facingPages ?
                        { en: "Inside:", fr: "Petit fond :" } :
                        { en: "Left:", fr: "Gauche :" }
                ) + " " + box['InsideOrLeftOffset']
            ),
            'BottomOffset'         :  add (
                'checkbox', 
                undefined, 
                { en: "Bottom:", fr: "De pied :" } + " " + box['BottomOffset']
            ),
            'RightOrOutsideOffset' :  add (
                'checkbox', 
                undefined, 
                (
                    d.documentPreferences.facingPages ?
                        { en: "Outside:", fr: "Grand fond :" } :
                        { en: "Right:", fr: "Droite :" }
                ) + " " + box['RightOrOutsideOffset']
            )
        };
        toChangeCB['OutsideOrRightOffset'] = toChangeCB['RightOrOutsideOffset'];
        for (var p in toChangeCB) {
            toChangeCB[p].value = $.global[prefs].toChangeCB[p].value;
            if (box[p] < 0) { toChangeCB[p].value = false; toChangeCB[p].enabled = false; }
        }
        var extendCB = add (
            'checkbox', 
            undefined, 
            {
                en: "Extend only",
                fr: "Agrandir uniquement"
            }
        );
        extendCB.helpTip = {
            en: "Don’t shrink the existing document bleed & slug area "
            + "(among above values don’t apply those that would be lower than existing values)",
            fr: "Ne pas réduire les zones de fond perdu & ligne-bloc existantes "
            + "(parmi les valeurs ci-dessus ne pas appliquer celles qui seraient inférieures aux valeurs existantes)"
        };
        extendCB.value = $.global[prefs].extendCB.value;
    }
    with (w.add ('group',undefined,undefined,{orientation:'row'})) {add('button',undefined,'Cancel');add('button',undefined,'OK');}

    if (w.show() === 1) {
        //try { 
            app.doScript(
                function() { fitPageBoxesToSelection (d.selection[0]); },
                ScriptLanguage.JAVASCRIPT,
                undefined,
                UndoModes.ENTIRE_SCRIPT,
                File($.fileName).name
            );
        //} catch(e) { alert(e); }
    }

    function fitPageBoxesToSelection() {
        
        $.global[prefs].slugCB.value = slugCB.value;
        $.global[prefs].bleedCB.value = bleedCB.value;
        $.global[prefs].extendCB.value = extendCB.value;
        for (var p in toChangeCB) {
            if (! toChangeCB[p].enabled) { continue; }
            $.global[prefs].toChangeCB[p].value = toChangeCB[p].value; 
        }
        d.documentPreferences.documentSlugUniformSize  = ! slugCB.value;
        d.documentPreferences.documentBleedUniformSize = ! bleedCB.value;
       for (var p in box) {
            if (box[p] < 0) { continue; }
            if (!toChangeCB[p].value) { continue; }
            if (
                slugCB.value && 
                'slug'+p in d.documentPreferences &&
                (box[p] > d.documentPreferences['slug'+p] || extendCB.value == false)
            )  { d.documentPreferences['slug'+p] = box[p]; }
            if (
                bleedCB.value && 
                'documentBleed'+p in d.documentPreferences &&
                (box[p] > d.documentPreferences['documentBleed'+p] || extendCB.value == false)
            ) { d.documentPreferences['documentBleed'+p] = box[p]; }
        }
    }
}

main();