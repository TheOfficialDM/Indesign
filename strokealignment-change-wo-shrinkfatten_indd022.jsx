/******************************************************************/
/*                                                                */
/*            Author: Frédéric ROBIN (robinfredericf)             */
/*                                                                */
/*        http://robinfredericf.free.fr                           */
/*        http://www.linkedin.com/in/robinfredericf               */
/*                                                                */
/******************************************************************/

/*
    Stroke alignment change without shrinking nor fattening
    The idea is to change the stroke alignment of an item, then change its geometrical bounds 
    (dimensions without stroke) in order to offset the equivalent of the stroke weight to restore 
    the previous visible bounds (dimensions including the stroke). Find a short (or at least not 
    too long) descriptive name for this script was a challenge in itself because it cannot be named 
    «stroke-alignment-invisible-change» unless I do misleading advertising since the appearance 
    can’t always be totally preserved depending on corner options and other stroke settings 
    (the French name of the 20 first versions was « changer-alignement-contour-sans-bouger » 
    — change-stroke-alignment-without-moving). The script is intended for the most simple InDesign 
    native items basic shapes: rectangles with or without corner effects, and ovals. It is not 
    intended to handle polygons (including triangles), lines, open or edited paths or paths pasted 
    from Illustrator, because it would require to recreate Illustrator “offset path”.
*/

#target "InDesign";
#targetengine "yolo1614193538092";


$.localize = true;
$.locale = null;
//$.locale = 'en';




/*==================================================================================================*/
/*  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf  */
/*==================================================================================================*/

if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function indexOf(member, startFrom) {
    /*
    In non-strict mode, if the `this` variable is null or undefined, then it is
    set to the window object. Otherwise, `this` is automatically converted to an
    object. In strict mode, if the `this` variable is null or undefined, a
    `TypeError` is thrown.
    */
    if (this == null) {
      throw new TypeError("Array.prototype.indexOf() - can't convert `" + this + "` to object");
    }

    var
      index = isFinite(startFrom) ? Math.floor(startFrom) : 0,
      that = this instanceof Object ? this : new Object(this),
      length = isFinite(that.length) ? Math.floor(that.length) : 0;

    if (index >= length) {
      return -1;
    }

    if (index < 0) {
      index = Math.max(length + index, 0);
    }

    if (member === undefined) {
      /*
        Since `member` is undefined, keys that don't exist will have the same
        value as `member`, and thus do need to be checked.
      */
      do {
        if (index in that && that[index] === undefined) {
          return index;
        }
      } while (++index < length);
    } else {
      do {
        if (that[index] === member) {
          return index;
        }
      } while (++index < length);
    }

    return -1;
  };
}

/*==================================================================================================*/
/*  https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Array/filtro   */
/*  As of today 2018-02-16 the english page gives a different function that does'nt work            */
/*  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter   */
/*==================================================================================================*/

if (!Array.prototype.filter) {
  Array.prototype.filter = function(fun/*, thisArg*/) {
    'use strict';

    if (this === void 0 || this === null) {
      throw new TypeError();
    }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== 'function') {
      throw new TypeError();
    }

    var res = [];
    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++) {
      if (i in t) {
        var val = t[i];

        // NOTE: Technically this should Object.defineProperty at
        //       the next index, as push can be affected by
        //       properties on Object.prototype and Array.prototype.
        //       But that method's new, and collisions should be
        //       rare, so use the more-compatible alternative.
        if (fun.call(thisArg, val, i, t)) {
          res.push(val);
        }
      }
    }

    return res;
  };
}

/*==================================================================================================*/




if (chosenStrokeAlignment === undefined) { var chosenStrokeAlignment = new Number (0); }
if (applyToOthers === undefined) { var applyToOthers = new Boolean (false); }
if (displayWarnings === undefined) { var displayWarnings = new Boolean (true); }

var unitsRosetta = {
    /*
        For each available unit selected in the measurement units preferences
        we list the displayed dimensions of a 127 millimeters square.
        The commented out units are supposed to exist according to 
        http://jongware.mit.edu/idcs5js/pc_ViewPreference.html
        but they can't be selected neither in the preferences dialog nor using javascript.
        For "CUSTOM" we are supposed to specify a number of points (default is 12) by unit
        but the dimensions remain displayed in points.
    */
    POINTS: 360,
    PICAS: 30,
    INCHES: 5,
    INCHES_DECIMAL: 5,
    MILLIMETERS: 127,
    CENTIMETERS: 12.7,
    CICEROS: 84.455/3, // 28.1516666666899
    CUSTOM: 360,
    AGATES: 70,
    //U
    //BAI
    //MILS
    PIXELS: 360,
    //Q
    //HA
    //AMERICAN_POINTS
};

function convertUnits (n0, u0, u1) {
    var n1 = n0 * unitsRosetta[u1] / unitsRosetta[u0];
    //$.writeln (n0 + " " + u0 + " \u2192 " + n1 + " " + u1);
    return n1;
}

function getSelectionAllPageItems() {
    // Version InDesign
    var selectionAllPageItems = [];
    for (var i=0; i<app.activeDocument.selection.length; i++) {
        selectionAllPageItems.push(app.activeDocument.selection[i]);
        selectionAllPageItems = selectionAllPageItems.concat(app.activeDocument.selection[i].allPageItems);
    }
    return selectionAllPageItems;
}


try { main(); } catch(e) { alert(e); } 

function main () {

    var precision  = 1e-7;
    /*
        required to avoid weird issues encountered such as
        « r_tgt[corner] = 13.5 » and « r_tgt_max = 13.5 » 
        but « (r_tgt[corner] > r_tgt_max) = true »
        because « r_tgt[corner] - r_tgt_max = 1.77635683940025e-15 »
        Better not bother the user asking him to choose this precision value
    */

    var alignmentLocale = {
        INSIDE_ALIGNMENT:  { fr:"intérieur", en:"inside" }, 
        CENTER_ALIGNMENT:  { fr:"centré",    en:"center" }, 
        OUTSIDE_ALIGNMENT: { fr:"extérieur", en:"outside" } 
    };

    var alignmentList = [
        StrokeAlignment.INSIDE_ALIGNMENT, 
        StrokeAlignment.CENTER_ALIGNMENT, 
        StrokeAlignment.OUTSIDE_ALIGNMENT, 
    ];

    var cornerLocale = {
        topLeftCorner:     { fr:"coin supérieur gauche", en:"top left corner"     }, 
        topRightCorner:    { fr:"coin supérieur droit",  en:"top right corner"    }, 
        bottomLeftCorner:  { fr:"coin inférieur gauche", en:"bottom left corner"  }, 
        bottomRightCorner: { fr:"coin inférieur droit",  en:"bottom right corner" } 
    };

    function switchShape(o) {
        if ((!o.paths) || (!o.paths.length)) { return 2; }
        for (var i=0; i<o.paths.length; i++) {
            if (o.paths[i].pathType == PathType.OPEN_PATH) { return 2; }
        }
        if (
            (o.paths.length !== 1) ||
            (o.paths[0].pathPoints.length !== 4)
            /*
                During tests a 7-pointed star with 14 pathPoints 
                listed as "Polygon" in the layer panel 
                turned out to have a constructor "Rectangle"
            */
        ) { return 0; }
        var a = ['Rectangle', 'Oval'];
        if (o.constructor.name === 'TextFrame') { 
            var docTmp = app.documents.add(/*showingWindow:*/false);
            var myDup = o.duplicate (docTmp.pages[0]);
            // Assign empty string as contents:  
            myDup.insertionPoints[0].parentStory.texts[0].contents = '';  
            myDup.contentType = ContentType.GRAPHIC_TYPE;
            // Bug: InDesign keeps on saying that myDup.constructor.name is "TextFrame"
            myDup = docTmp.allPageItems[0];
            var b = (a.indexOf(myDup.constructor.name) !== -1);
            docTmp.close(SaveOptions.NO);
            return Number(b);
        }
        return Number(a.indexOf(o.constructor.name) !== -1);
    }

    function getParentDoc (item) {
        switch (item.constructor.name) {
            case 'Document':    return item;
            case 'Application': return false;
            default: return getParentDoc (item.parent);
        }
    }

    function setUniformTextWrapOffset (item, offset){
        var d = getParentDoc (item);
        // The function expects the user to always provide his desired offset value using the  vertical measurement unit
        // of the document since it is the unit used by the InDesign interface when textWrapOffset is a single number
        item.textWrapPreferences.textWrapOffset = 
            (item.textWrapPreferences.textWrapOffset.length != undefined)?
                [
                    offset,
                    convertUnits (
                        offset, 
                        d.viewPreferences.verticalMeasurementUnits,
                        d.viewPreferences.horizontalMeasurementUnits 
                    ),
                    offset,
                    convertUnits (
                        offset, 
                        d.viewPreferences.verticalMeasurementUnits,
                        d.viewPreferences.horizontalMeasurementUnits 
                    )
                ]:
                offset;
    }

    var d = app.activeDocument;
    var mySelection = d.selection;
    var myItems = 
        getSelectionAllPageItems()
        .filter (function (page_item) { 
            return page_item.hasOwnProperty('paths') &&  page_item.strokeWeight > precision; 
        });
    try { run(); } catch(err) { alert(err && err.message ? err.message : errMsg); }
    d.select (mySelection, SelectionOptions.REPLACE_WITH);

    function run() {
        
        if (! myItems.length) { throw new Error (errMsg = {fr:"Aucun élément comportant un contour n’est sélectionné.",en:"No stroked item selected."}); }

        for (var i=0; i<myItems.length; i++) {

            d.select (myItems[i], SelectionOptions.REPLACE_WITH);

            var w = new Window ('dialog', File($.fileName).name);
            w.alignChildren = 'center';
            var wst1 = w.add (
                'statictext', 
                undefined, 
                {fr:"L’alignement du contour est actuellement ",en:"Current stroke alignment is "} 
                + alignmentLocale[myItems[i].strokeAlignment]
            );
            with (w.add ('group', undefined, undefined, {orientation:'row'})) {
                var wst2 = add ('statictext', undefined , {fr:"Changer le contour en ",en:"Change stroke to "});
                var wadd = add (
                    'dropdownlist', 
                    undefined, 
                    [
                        alignmentLocale['INSIDE_ALIGNMENT'], 
                        alignmentLocale['CENTER_ALIGNMENT'], 
                        alignmentLocale['OUTSIDE_ALIGNMENT']
                    ]
                );
                wadd.selection = parseInt(chosenStrokeAlignment, 10);
            }

            with (w.add ('group')) {
                var others = myItems.length - i - 1;
                var multiple_cb = add(
                    'checkbox', 
                    undefined, 
                    {
                        fr:"Appliquer aux "+others+" autres éléments sélectionnés",
                        en:"Apply to "+others+" other selected elements"
                    }
                );
                multiple_cb.value = applyToOthers.valueOf();
                if (! others) { multiple_cb.hide(); }

                var skip_warnings_cb = add(
                    'checkbox', 
                    undefined, 
                    {
                        fr:"Ignorer les avertissements",
                        en:"Skip warnings"
                    }
                );
                skip_warnings_cb.value = !displayWarnings.valueOf();
                orientation = 'column';
                alignChildren = 'left';
            }

            with (w.add ('group',undefined,undefined,{orientation:'row'})) {
                add('button',undefined,'Cancel');
                add('button',undefined,'OK');
                alignment='right';
            }


            if (w.show() !== 1) { return false; }
            chosenStrokeAlignment = wadd.selection.index;
            applyToOthers = Boolean (multiple_cb.value);
            displayWarnings = Boolean (!skip_warnings_cb.value);


            app.doScript(
                function() { 
                        applyToOthers.valueOf() ? multiple_f () :
                        strokealignmentChangeWoShrinkfatten (myItems[i]); 
                },
                ScriptLanguage.JAVASCRIPT,
                undefined,
                UndoModes.ENTIRE_SCRIPT,
                wst2.text + wadd.selection.text + ((multiple_cb.value) ? " [+ "+multiple_cb.text+"]" : '')
            );

            function multiple_f () {
                while (i<myItems.length) {
                    strokealignmentChangeWoShrinkfatten (myItems[i]);
                    i++;
                }
            } 

            function strokealignmentChangeWoShrinkfatten (myItem) {

                d.select (myItem, SelectionOptions.REPLACE_WITH);
                if (! myItem.strokeWeight) { return; }
                var sa_src = myItem.strokeAlignment;
                var sa_tgt = alignmentList[chosenStrokeAlignment];
                var coef = (alignmentList.indexOf(sa_src) - alignmentList.indexOf(sa_tgt)) / 2;
                if (coef === 0) { return; }

                var warnings = ''; 

                var oddShape = false;
                switch (switchShape(myItem)) {
                    case 0:
                        oddShape = true;
                        warnings += {
                            fr:"• L’élément n’est pas une des formes correctement gérées. \r\n"
                            +"Ce script gère de façon réversible les formes natives de base d’InDesign suivantes : rectangles avec ou sans effets de coins, et ellipses. "
                            +"Il utilise une méthode alternative destructive et moins fiable pour les polygones (triangles compris), formes libres, tracés édités, "
                            +"ou les tracés collés à partir d’Illustrator, tant qu’il s’agit de tracés fermés. \r\n",
                            en:"• The item is not one of the correctly handled shapes. \r\n"
                            +"This script handles reversibly the following InDesign native items basic shapes: rectangles with or without corner effects, and ovals. "
                            +"It uses an alternate destructive and less reliable method for polygons (including triangles), free shapes, edited paths, "
                            +"or paths pasted from Illustrator, as long as they are closed paths. \r\n"
                        };
                        break;
                    case 2:
                        warnings += {
                            fr:"• L’élément n’est pas une des formes gérées. \r\n"
                            +"Ce script est prévu principalement pour les formes natives de base d’InDesign suivantes : rectangles avec ou sans effets de coins, et ellipses. "
                            +"Il n’est pas prévu pour gérer les lignes ou autres tracés ouverts. \r\n",
                            en:"• The item is not one of the handled shapes. \r\n"
                            +"This script is intended mostly for the following InDesign native items basic shapes: rectangles with or without corner effects, and ovals. "
                            +"It is not intended to handle lines or other open paths. \r\n"
                        };
                        if (displayWarnings.valueOf()) { alert (warnings); }
                        return false;
                }

                var co = {};
                for (var corner in cornerLocale) {
                    co[corner] = myItem[corner+'Option'];
                    //if (oddShape) { myItem[corner+'Option'] = CornerOptions.NONE; }
                    /* 
                        Attempt to cancel (then restore in the end) the corner options to avoid the generated text wrap path to include the rounded corners.
                        Turns out useless since the generated text wrap path will quite always have some rounded anchor points even if the original pathItem has 
                        only sharp anchor points and none corner options, and the corner options can't be restored on the resulting final path since they can’t 
                        be applied to rounded anchor points.
                    */
                }

                var sw = [
                    convertUnits (myItem.strokeWeight, d.viewPreferences.strokeMeasurementUnits, d.viewPreferences.horizontalMeasurementUnits),
                    convertUnits (myItem.strokeWeight, d.viewPreferences.strokeMeasurementUnits, d.viewPreferences.verticalMeasurementUnits)
                ];
                var sc = [
                    Math.abs (myItem.horizontalScale) / 100, 
                    Math.abs (myItem.verticalScale)   / 100
                ];

                var trp = app.activeWindow.transformReferencePoint;

                var roa = myItem.rotationAngle;
                var rad = roa * Math.PI / 180;
                if (Math.abs (Math.sin (rad)) === 1) { 
                    // Items with 90° -90° 270° rotation angle
                    // can be handled as is
                    sc.reverse(); }
                if (
                    Math.abs (Math.sin (rad)) !== 1 && 
                    Math.abs (Math.cos (rad)) !== 1
                ) { 
                    // Items with non-orthogonal rotation angle
                    // can't be handled without canceling temporary this transformation
                    app.activeWindow.transformReferencePoint = AnchorPoint.CENTER_ANCHOR;
                    myItem.rotationAngle = 0;
                } else {
                    roa = 0;
                }

                var sha = myItem.shearAngle;
                if (sha !== 0) {
                    // can't be handled without canceling temporary this transformation
                    app.activeWindow.transformReferencePoint = AnchorPoint.CENTER_ANCHOR;
                    myItem.shearAngle = 0;
                }

                if (oddShape) {
                    /* 
                        In InDesign we can notice that whenever a polygon object is affected by a Scale X and/or Y percentage,
                        the visible text wrap path (with textWrapOffset initially to zero) 
                        no longer correctly matches the object outlines in the concerned direction, 
                        and the script result will show the same default unless we add the following:
                        
                    */
                    sc2 = [myItem.horizontalScale, myItem.verticalScale];
                    app.activeWindow.transformReferencePoint = AnchorPoint.CENTER_ANCHOR;
                    myItem.horizontalScale = 100;  
                    myItem.verticalScale = 100;
                    sc = [1, 1];
                }

                var vb = myItem.visibleBounds;
                var gb_src = myItem.geometricBounds;

                myItem.strokeAlignment = sa_tgt;
                /* Problem of stroke alignment visually inverted in some particular cases (rectangle with more than one fancy corners) */
                if ((vb[2] - myItem.visibleBounds[2]) * coef < 0) { coef *= -1; }
                var gb_tgt = [
                    gb_src[0] - sw[1] * coef * sc[1],
                    gb_src[1] - sw[0] * coef * sc[0],
                    gb_src[2] + sw[1] * coef * sc[1],
                    gb_src[3] + sw[0] * coef * sc[0]
                ];
                
                if (!oddShape) {
                    myItem.geometricBounds = gb_tgt;
                    /*
                        Simply backup the visibleBounds and reapply them after the strokeAlignment modification gives less accurate results than my 
                        complicated geometricBounds method (difference from the 5th or 6th decimal visible in 13-decimal values displayed using javascript)
                    */
                } else {
                    /*
                        Trick from Olav Martin Kvern: 
                        Using the path generated when you apply a Contour-type text wrap to an object
                        to recreate a substitute for Illustrator’s “Offset Path” command
                        https://creativepro.com/indesign-cad-tool/
                        Unfortunately you often end up with rounded corners instead of sharp
                    */
                    var myDup = myItem.duplicate();
                    myDup.strokeWeight = 0;
                    myDup.textWrapPreferences.textWrapMode = TextWrapModes.CONTOUR;
                    setUniformTextWrapOffset (myDup, sw[1] * coef * sc[1]); // The measurement unit used for textWrapOffset appears to be the vertical one
                    var myPaths = myDup.textWrapPreferences.paths;
                    for (var i=0; i<myItem.paths.length; i++) {
                        if (myPaths.length - 1 < i) { break; }
                        myItem.paths[i].pathType = myPaths[i].pathType;
                        myItem.paths[i].entirePath = myPaths[i].entirePath;
                    }
                    myDup.remove();
                    for (var corner in cornerLocale) {
                        //myItem[corner+'Option'] = co[corner];
                        myItem[corner+'Option'] = CornerOptions.NONE;
                    }

                }
                
                // Section attempting whenever possible to cover some corner radii issues
                // The measurement unit used for each radius appears to be the horizontal one
                var warnc  = {}; 
                var r_src = {}, r_tgt = {};
                var width_src  = Math.abs ((gb_src[3] - gb_src[1]) / sc[0]);
                var height_src = Math.abs ((gb_src[2] - gb_src[0]) / sc[1]);
                height_src = convertUnits (height_src, d.viewPreferences.verticalMeasurementUnits, d.viewPreferences.horizontalMeasurementUnits);
                var width_tgt  = Math.abs ((gb_tgt[3] - gb_tgt[1]) / sc[0]);
                var height_tgt = Math.abs ((gb_tgt[2] - gb_tgt[0]) / sc[1]);
                height_tgt = convertUnits (height_tgt, d.viewPreferences.verticalMeasurementUnits, d.viewPreferences.horizontalMeasurementUnits);
                var r_src_max  = Math.min (width_src, height_src) / 2;
                var r_tgt_max  = Math.min (width_tgt, height_tgt) / 2;
                var is_square  = (Math.abs (width_src - height_src) < precision);

                for (var corner in cornerLocale) {

                    r_src[corner] = myItem[corner+'Radius']; 
                    warnc[corner] = '';

                    if (r_src[corner] > r_src_max + precision)  {
                        /*
                            In this situation 
                            for a rectangle with rounded corner the actual radius will be limited the half of the smallest dimension (width or height) 
                            if the rectangle is a square the radius will be evenly limited to the half of the dimension whatever is the corner shape
                        */
                        r_src[corner] = r_src_max;
                        /*
                            for a rectangle with inset, inverse rounded, fancy or bevel you get an odd radius that can extend up to the half of each dimension
                            impossible to reproduce with different dimensions 
                        */
                        if (! is_square) {
                            warnc[corner] += {
                                fr:"• le rayon d’arrondi excédait la moitié de la plus petite dimension de l’élément (avant modification) \r\n",
                                en:"• the corner radius used to exceed the half of the item’s smallest dimension (before modification) \r\n"
                            };
                        }
                    }

                    switch (myItem[corner+'Option']) {
                        case CornerOptions.NONE :
                            // Nothing to do, we can also forget the radius warning
                            r_tgt[corner] = r_src[corner];
                            warnc[corner] = '';
                            break;
                        case CornerOptions.INSET_CORNER :
                            // Nothing to do
                            r_tgt[corner] = r_src[corner];
                            break;
                        case CornerOptions.ROUNDED_CORNER :
                            // Forget about the radius warning, it has been fixed above
                            warnc[corner] = '';
                            // Valid only for convex rounded corner but the result won't be strictly identical probably because
                            // InDesign rounded corners are only bezier-approximated circular shapes (less accurately than QuarkXPress)
                            r_tgt[corner] = r_src[corner] + sw[0] * coef;
                            break;
                        case CornerOptions.INVERSE_ROUNDED_CORNER :
                            // No formula will give a visually identical result, the lesser evil is to do nothing
                            r_tgt[corner] = r_src[corner];
                            warnc[corner] += {fr:"• coin arrondi inversé \r\n",en:"• inverse rounded corner \r\n" }; 
                            break;
                        case CornerOptions.FANCY_CORNER :
                            // No formula will give a visually identical result, the lesser evil is to do nothing
                            r_tgt[corner] = r_src[corner];
                            warnc[corner] += {fr:"• coin fantaisie \r\n",en:"• fancy corner \r\n" }; 
                            break;
                        case CornerOptions.BEVEL_CORNER :
                            // Eurêka
                            r_tgt[corner] = r_src[corner] + sw[0] * (1 - Math.tan (Math.PI / 8)) * coef; 
                            break;
                    }
                    myItem[corner+'Radius'] = r_tgt[corner];
                    if (r_tgt[corner] > r_tgt_max + precision && myItem[corner+'Option'] !== CornerOptions.NONE)  {
                        warnc[corner] += {
                            fr:"• le rayon d’arrondi excède la moitié de la plus petite dimension de l’élément (après modification) \r\n",
                            en:"• the corner radius exceeds the half of the item’s smallest dimension (after modification) \r\n"
                        };
                    }
                    if (warnc[corner].length) { warnings += "\r\n" + cornerLocale[corner] + "\r\n" + warnc[corner]; }
                }
                // Restoring the temporary canceled transformations
                if (oddShape) { 
                    myItem.horizontalScale = sc2[0];
                    myItem.verticalScale   = sc2[1];
                    /* myItem sometimes moves unexpectedly */
                }
                if (sha !== 0) { myItem.shearAngle = sha; }
                if (roa !== 0) { myItem.rotationAngle = roa; }
                app.activeWindow.transformReferencePoint = trp;
                if (
                    warnings.length && displayWarnings.valueOf()
                    && !confirm(
                        {
                            fr:"Avertissement : le résultat ne peut pas être tout à fait identique dans les cas suivants : \r\n",
                            en:"Warning: the result can't be quite identical in the following cases: \r\n"
                        } 
                        + warnings + "\r\n"
                        + {
                            fr:"Continuer quand même ? \r\n (vérifier ensuite le résultat avec “Annuler”/“Rétablir”)",
                            en:"Continue anyway? \r\n (check the result then using “Undo”/“Redo”)"
                        }
                    )
                ) { throw new Error (errMsg = {fr:"Script annulé",en:"Script cancelled"}); }
            }
        }
    }
}

