//colorValueDupesRemove.jsx 
//DESCRIPTION: Deletes duplicates of defined basic colors (myBaseC)
 
var myBaseC = ["Black", "Paper", "Registration"];
var myColors = app.documents[0].colors; 
var theDelColors = new Array; 
for (oneBase = 0; oneBase < myBaseC.length; oneBase++) 
{ 
	try 
	{ 
		app.documents[0].colors.item(myBaseC[oneBase]).name; 
		for (oneCol = myColors.length-1; oneCol >= 0; oneCol--) 
		{ 
			if ( 
				(myColors[oneCol].colorValue.join("-") == app.documents[0].colors.item(myBaseC[oneBase]).colorValue.join("-")) &&  
				(myColors[oneCol].name != app.documents[0].colors.item(myBaseC[oneBase]).name) && 
				(myColors[oneCol].name != "Registration") && 
				(myColors[oneCol].name != "Black") && 
				(myColors[oneCol].name != "Paper")  
			) 
			{ 
				if (myColors[oneCol].name != "") theDelColors.push("\"" + myColors[oneCol].name + "\""); // Collect color name for  display at the end 
				myColors[oneCol].remove(app.documents[0].swatches.item(myBaseC[oneBase])); // Delete / replace color by basic color 
			} 
		} 
	} 
	catch(error) 
	{alert(error + "\r" + myBaseC[oneBase])} 
} 
if (theDelColors.length > 0)  
	alert("Deleted colors:\r" + theDelColors.join("\r"))  
	else alert("Finished."); 