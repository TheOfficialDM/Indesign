if(app.documents.length>0)
{
	var ad = app.activeDocument;
	var tf = ad.textFrames;
	var tflg = tf.length;
	if(tflg>0)
	{
		var wcount = 0;
		var chcount = 0;
		var pcount=0;

		for(i=0; i<tflg; i++)
		{	
			var p = tf[i].paragraphs;
			for(l=0; l<p.length; l++)
			{
				pcount+=1;
				wcount += p[l].words.length;
				chcount += p[l].characters.length;
			}
		}

		alert("Your document has:"+"\r"
        	+ "- "+tflg+ " text frames" + "\r"
			+ "- "+pcount + " paragraphs" + "\r"
			+ "- " +wcount + " words" + "\r"  
			+ "- "+chcount + " characters (including spaces)" + "\r" 
			+ "- "+(chcount-spaced()) + " characters (not including spaces)", "Text Counter Script");
	}
}

function spaced()
{
	app.findGrepPreferences = app.changeGrepPreferences = null;
	app.findGrepPreferences.findWhat="\s";
	return app.activeDocument.findGrep().length;
}