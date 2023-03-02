/******************************************************************/
/*                                                                */
/*            Author: Frédéric ROBIN (robinfredericf)             */
/*                                                                */
/*        http://robinfredericf.free.fr                           */
/*        http://www.linkedin.com/in/robinfredericf/en            */
/*        http://fr.viadeo.com/fr/profile/robinfredericf          */
/*        http://plus.google.com/u/0/112815740483397412444        */
/*                                                                */
/*                    robinfredericfҨgmaїl·cѳm                    */
/*                                                                */
/******************************************************************/

#target "InDesign"

$.localize = true;
$.locale = null;
//$.locale = "en";


var centVingtSeptMillimetres = {
    /*
        pour chaque unité sélectionnée dans les préférences d'unité de mesure d'InDesign
        on répertorie les dimensions affichées d'un carré de 127 mm.
        Les unités désactivées sont supposées exister d'après
        http://jongware.mit.edu/idcs5js/pc_ViewPreference.html
        mais ne peuvent être sélectionnées ni par la
        fenêtre des préférences ni par javascript.
        Pour CUSTOM « Personnalisées » on est supposé spécifier un nombre de points
        (12 par défaut) mais l'affichage des dimensions est toujours en points.
    */
    POINTS: 360,
    PICAS: 30,
    INCHES: 5,
    INCHES_DECIMAL: 5,
    MILLIMETERS: 127,
    CENTIMETERS: 12.7,
    CICEROS: 84.455/3, //soit 28.1516666666899
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
    var n1 = n0 * centVingtSeptMillimetres[u1] / centVingtSeptMillimetres[u0];
    //$.writeln (n0 + " " + u0 + " \u2192 " + n1 + " " + u1);
    return n1;
}


/*  Soit un bloc image de largeur a et de hauteur b où on importe un graphique (image ou vectoriel) de largeur c et de hauteur d
    Calcul de l'échelle x (à multiplier par 100 si on veut l'exprimer en pourcentage) qu'il faut appliquer au graphique 
    pour avoir un blanc tournant d'épaisseur constante dans le bloc autour du graphique
*/

var maSelection = app.activeDocument.selection;
if (maSelection.length !== 1) { 
    alert (
        {
            fr:"Sélectionner un (seul) bloc image contenant un graphique (image liée ou autre).",
            en:"Select a graphic frame (only one) containing a graphic (linked image or other)."}, 
        {fr:"Erreur",en:"Error"}, 
        "errorIcon"
    );
}
else { 
    try {
        var leBloc = maSelection[0];
        var leGraphique = leBloc.pageItems[0];
    }
    catch (e) {
        var leGraphique = maSelection[0];
        var leBloc = leGraphique.parent;
    }
}
if (leBloc && leGraphique) {
    try { 
        app.doScript(
            function() { echellePourBlancTournant(leBloc, leGraphique); },
            ScriptLanguage.JAVASCRIPT,
            undefined,
            UndoModes.ENTIRE_SCRIPT,
            File($.fileName).name
        );
    } catch(e) { alert(e); }
}

function echellePourBlancTournant(leBloc, leGraphique) {
    
    var a = leBloc.geometricBounds[3] - leBloc.geometricBounds[1]; // largeur de leBloc
    var b = leBloc.geometricBounds[2] - leBloc.geometricBounds[0]; // hauteur de leBloc
    b = convertUnits(
            b,
            app.activeDocument.viewPreferences.verticalMeasurementUnits,
            app.activeDocument.viewPreferences.horizontalMeasurementUnits
    );
    var c = leGraphique.geometricBounds[3] - leGraphique.geometricBounds[1]; // largeur de leGraphique
    var d = leGraphique.geometricBounds[2] - leGraphique.geometricBounds[0]; // hauteur de leGraphique
    d = convertUnits(
            d,
            app.activeDocument.viewPreferences.verticalMeasurementUnits,
            app.activeDocument.viewPreferences.horizontalMeasurementUnits
    );
    /*
        les valeurs a,b,c,d conviennent pour le calcul du blanc tournant sur 4 côtés avec leGraphique centré dans leBloc
        ainsi que pour leGraphique dans l'un des quatre coins de leBloc avec blanc tournant sur 2 côtés
        Par contre il faut modifier les valeurs pour leGraphique au milieu d'un des 4 côtés de leBloc avec blanc tournant sur 3 côtés
    */
    var coeffs = {
        TOP_LEFT_ANCHOR : [1,1],
        TOP_CENTER_ANCHOR : [1,2],
        TOP_RIGHT_ANCHOR : [1,1],
        LEFT_CENTER_ANCHOR : [2,1],
        CENTER_ANCHOR : [1,1],
        RIGHT_CENTER_ANCHOR : [2,1],
        BOTTOM_LEFT_ANCHOR : [1,1],
        BOTTOM_CENTER_ANCHOR : [1,2],
        BOTTOM_RIGHT_ANCHOR : [1,1],
    };
    a *= coeffs[app.activeWindow.transformReferencePoint][0];
    b *= coeffs[app.activeWindow.transformReferencePoint][1];
    c *= coeffs[app.activeWindow.transformReferencePoint][0];
    d *= coeffs[app.activeWindow.transformReferencePoint][1];
    
    var x = (b-a)/(d-c); // échelle à appliquer
    var blancTournant = (a - c * x) / 2;
    //$.writeln (100*x + " %");
    //$.writeln("blanc tournant = " + blancTournant);

    if (Math.abs (x) < 1e-4 || Math.abs (x) > 1e4) { 
        alert({
            fr:"Le bloc et le graphique ne sont pas de proportions compatibles, "
            +"impossible d'adapter un graphique dans un bloc si l'un des deux est carré et pas l'autre.\r\n"
            +"(Le calcul donne une échelle fantaisiste de " +  100*x + " %)",
            en:"The graphic frame and its content have incompatible proportions "
            +"impossible to fit a graphic in a frame if one of them is square and not the other.\r\n"
            +"(The calculation returns an oddball scale value of " +  100*x + "%)"
        });
    } else if (x < 0) {
        alert({
            fr:"Le bloc et le graphique ne sont pas de proportions compatibles, "
            +"impossible d'adapter un graphique au format portrait dans un bloc au format paysage ou le contraire.\r\n"
            +"(Le calcul donnerait une échelle fantaisiste de " +  100*x + " %)",
            en:"The graphic frame and its content have incompatible proportions "
            +"impossible to fit a portrait-format graphic in a landscape-format frame or the contrary.\r\n"
            +"(The calculation returns an oddball scale value of " +  100*x + "%)"
        });
    } else if (
        blancTournant < 0 && 
        ! confirm({ 
            fr:"Le calcul donne un blanc tournant négatif (autrement dit un \"rognage tournant\")"
            +( (app.activeWindow.transformReferencePoint === AnchorPoint.CENTER_ANCHOR) ?
            ", du fait que le bloc a une forme plus allongée (en largeur ou en hauteur) que son contenu.\r\n":".\r\n")
            +"Voir le résultat quand même :",
            en:"The calculation returns a negative rounded white (that is a \"rounded cropping\")"
            +( (app.activeWindow.transformReferencePoint === AnchorPoint.CENTER_ANCHOR) ?
            ", for the graphic frame shape is more elongated (in width or height) than its content.\r\n":".\r\n")
            +"See the result anyway:"
        })
    ) { return false; }
    else {
        leBloc.frameFittingOptions.fittingAlignment = app.activeWindow.transformReferencePoint;
        var maMatriceEchelle = app.transformationMatrices.add({ horizontalScaleFactor: x, verticalScaleFactor: x });
        leGraphique.transform(CoordinateSpaces.pasteboardCoordinates, AnchorPoint.centerAnchor, maMatriceEchelle);
        leBloc.frameFittingOptions.topCrop = 0;
        leBloc.frameFittingOptions.leftCrop = 0;
        leBloc.frameFittingOptions.bottomCrop = 0;
        leBloc.frameFittingOptions.rightCrop = 0;
        leBloc.frameFittingOptions.fittingOnEmptyFrame = EmptyFrameFittingOptions.NONE;
        leBloc.fit(FitOptions.APPLY_FRAME_FITTING_OPTIONS);
    }
}
