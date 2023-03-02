//DESCRIPTION: Merge Down Swatch Dupes 
if (app.documents.length > 0)  
{ 
	myTarg = app.activeDocument; 
}  
else  
{ 
	myTarg = app; 
} 
 
var mySwatches = myTarg.swatches; 
var myNames = mySwatches.everyItem().name; 
for (var j = myNames.length - 1; j >= 0; j--)  
{ 
	myParts = myNames[j].split(" "); 
	if (myParts.length == 1)  
	{  
		continue  
	} 
	if (Number(myParts.pop()) == Number.NaN)  
	{  
		continue  
	} 
	var mySwatch = myTarg.swatches.item(myParts.join(" ")); 
	if (mySwatch == null)  
	{  
		continue  
	} 
	mySwatches[j].remove(mySwatch); 
} 