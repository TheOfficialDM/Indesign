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
for(var i=0;i<doc.pages.length;i++){
	 var page = doc.spreads.item(i).pages.item(0);
	 if(i%2 == 1)
		page.appliedMaster = master;
}