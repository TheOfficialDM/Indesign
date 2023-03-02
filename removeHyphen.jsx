Application.prototype.main=function()
{
	if(this.documents.length>0)
	{
		var doc= this.activeDocument;
		//Enlever toutes césures dans le document actif
		doc.stories.everyItem().hyphenation=false;
		//Redéfinir les styles sans les césures.
		//Le style Paragraphe standard ne semble pas pouvoir être modifié via scripting
		var paraSt = doc.paragraphStyles.everyItem().getElements();
		for(var i=0; i<paraSt.length; i++)
		{
			if(paraSt[i].name.indexOf("[")==-1)
			{
				paraSt[i].hyphenation=false;
			}
		}
	}
}


app.main();