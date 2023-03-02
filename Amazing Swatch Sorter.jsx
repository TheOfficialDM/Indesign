//DESCRIPTION:Amazing Swatch Sorter
// (And You Thought It Could Not Be Done)
// A Jongware Script, 30-Sep-2010
 
allSwatchNames = app.activeDocument.swatches.everyItem().name;
allSwatchNames.splice (0,4);
 
for (order=0; order<allSwatchNames.length; order++)
     allSwatchNames[order] = [ allSwatchNames[order], app.activeDocument.swatches[order+4], 0 ];
allSwatchNames.sort();
 
for (order=0; order<allSwatchNames.length; order++)
     allSwatchNames[order][2] = allSwatchNames[order][1].duplicate();
for (order=0; order<allSwatchNames.length; order++)
     allSwatchNames[order][1].remove (allSwatchNames[order][2]);
for (order=0; order<allSwatchNames.length; order++)
     allSwatchNames[order][2].name = allSwatchNames[order][0];