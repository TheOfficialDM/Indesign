var scriptName = "Normalize CMYK",
doc;

PreCheck();

function PreCheck() {
	if (app.documents.length == 0) ErrorExit("Please open a document and try again.", true);
	doc = app.activeDocument;
	if (doc.converted) ErrorExit("The current document has been modified by being converted from older version of InDesign. Please save the document and try again.", true);
	if (!doc.saved) ErrorExit("The current document has not been saved since it was created. Please save the document and try again.", true);
	normalizeCMYK(doc);
}

function ErrorExit(error, icon) {
	alert(error, scriptName, icon);
	exit();
}

function normalizeCMYK(/*Document*/doc,  swa,a,r,o,t,k,i)  
// -------------------------------------  
// Remove CMYK swatch duplicates and set every name in `C= M= Y= K=` form.  
{  
	if( !doc ) return;  
  
	const __ = $.global.localize;  
	const CM_PROCESS = +ColorModel.PROCESS;  
	const CS_CMYK    = +ColorSpace.CMYK;  
  
	swa = doc.swatches;  
	a = doc.colors.everyItem().properties;  
	r = {};  
  
	// Gather CMYK swatches => { CMYK_Key => {id, name}[] }  
	// ---  
	while( o=a.shift() )  
	{  
		if( o.model != CM_PROCESS ) continue;  
		if( o.space != CS_CMYK ) continue;  
  
		t = swa.itemByName(o.name);  
		if( !t.isValid ) continue;  
  
		for( i=(k=o.colorValue).length ; i-- ; k[i]=Math.round(k[i]) );  
		k = __("C=%1 M=%2 Y=%3 K=%4",k[0],k[1],k[2],k[3]);  
		(r[k]||(r[k]=[])).push({ id:t.id, name:t.name });  
	}  
  
	// Remove dups and normalize names.  
	// ---  
	for( k in r )  
	{  
		if( !r.hasOwnProperty(k) ) continue;  
		t = swa.itemByID((o=(a=r[k])[0]).id);  
		for( i=a.length ; --i ; swa.itemByID(a[i].id).remove(t) );  
		  
		if( k == o.name ) continue; // No need to rename.  
		try{ t.name=k }catch(_){}   // Prevent read-only errors.  
	}  
  
};  