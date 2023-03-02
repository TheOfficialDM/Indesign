if(app.documents.length!=0)
{
	var doc=app.activeDocument;
	if(doc.allGraphics.length>0)
	{
		var pg = doc.pages;
		var sp = doc.masterSpreads;
		var docname = String(doc.name).split(".indd")[0];
		var ga = [];
		if(doc.saved==true)
		{
			var myFolder = File(doc.fullName).parent;
		}
		else
		{	
			var myFolder=Folder.selectDialog();
		}
		for(k=0; k<sp.length;k++)
		{
			var g=sp[k].allGraphics;
			var pgk = sp[k].name;
			for(j=0; j<g.length; j++)
			{
				ga.push("- "+g[j].itemLink.name + " [ "+g[j].itemLink.filePath +" ] "+ "(Page: "+pgk+")");
			}
		}
		for(i=0; i<pg.length;i++)
		{
			var g=pg[i].allGraphics;
			var pgi = pg[i].name;
			for(j=0; j<g.length; j++)
			{
				ga.push("- "+g[j].itemLink.name + " [ "+g[j].itemLink.filePath +" ] "+ "(Page: "+pgi+")");
			}
		}
		ga=String(ga).replace(/,/g,"\r");
		if(File(myFolder+"/ImageReport.txt").exists)
		{
			File(myFolder+"/ImageReport.txt").remove();
		}
		var x = new File(myFolder+"/"+docname+"_liens_report.txt");
		x.open("e");
		x.write(ga);
		x.close();
		alert("Si vous appréciez ce script, n'hésitez pas à m'envoyer un petit mail !"+"\r"+"             loic_aigon@yahoo.fr"+"\r"+"Retirez ce dialogue en éditant le script:"+"\r"+"Enlevez la ligne \"Si vous appréciez...\"");
		File(myFolder+"/"+docname+"_liens_report.txt").execute();
	}
	else
	{
		alert("Votre document ne contient aucune image !");
	}
}
else
{
	alert("Vous n'avez aucun document ouvert !");
}
