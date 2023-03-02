var doc = app.documents[0];
var masterNames = doc.masterSpreads.everyItem().name;
var d = app.dialogs.add({name:"pick a master spread"});
d.dialogColumns.add().staticTexts.add({staticLabel:"Master Pages:"});
var dd = d.dialogColumns.add().dropdowns.add({stringList:masterNames});
if(d.show()){
     var index = dd.selectedIndex;
     d.destroy();
} else {
     d.destroy();exit();
}
var master = doc.masterSpreads.item(index);
for(var i=doc.pages.length-1;i>=0;i--){
     doc.pages.add(LocationOptions.AFTER,doc.pages[i],{appliedMaster:master});
}