//DESCRIPTION:Test InDesign file for version
// A Jongware Script 27-Jun-2013

iddFile = File.openDialog("Select an InDesign file", "InDesign file:*.indd;*.indt", true);
if (iddFile == null) exit(0);
f = File(iddFile);
filename = f.displayName;
if (f.open("r") == false) alert ("Unable to open this file!"); else {
f.encoding = "binary";

g = f.read (16); h = f.read(8);
j = f.read(1).charCodeAt(0);
k = f.read(4);
l = gl (f, j); l_m = gl (f, j);
m = f.length; f.seek (280); i = gl (f, 0)*4096;
f.close();

if (g != "\x06\x06\xED\xF5\xD8\x1D\x46\xe5\xBD\x31\xEF\xE7\xFE\x74\xB7\x1D")
{
	alert ("This is not a valid InDesign document");
} else
{
	if (l >= 3)
	{
		if (l == 3)
			l2 = "CS";
		else if (l > 8)
		{
			l2 = "CC";
			while (l-- > 9) l2 += '.next';
		} else
			l2 = "CS"+(l-2);
	}
	if (l_m != 0)
		l2 = l2+"."+l_m;

	if (m < i)
		alert (	"File: "+filename+"\r"+
				"Reported type: "+h+"\r"+
				"Reported version: "+l2+"\r\r"+
				"Length of this file is less than expected -- it may be damaged!"
			+	"\r\r(A Jongware Script 27-Jun-2013)"
				);
	else
	{
		if (parseFloat(app.version) < l)
		{
			if (parseFloat(app.version) < 4)
				alert (	'You cannot open "'+filename+'" because it was saved with a newer version of Adobe InDesign ('+l2+').\r'+
						'You must use that version or later to open the file. To then enable it to be opened in this version, export to IDML, then use InDesign CS4 to export to INX.\r'+
						'\r\r(A Jongware Script 8-Dec-2011)'
						);
			else
				alert (	'You cannot open "'+filename+'" because it was saved with a newer version of Adobe InDesign ('+l2+').\r'+
						'You must use that version or later to open the file. To then enable it to be opened in this version, export to IDML.\r'+
						'\r\r(A Jongware Script 27-Jun-2013)'
						);
		} else
			alert (	'You can open "'+filename+'" with this version; it has been saved as Adobe InDesign ('+l2+').\r'+
					'\r\r(A Jongware Script 27-Jun-2013)'
					);
	}
} }

function gl (a,b)
{
	var c = a.read(4);
	if (b == 2) return (c.charCodeAt(3)) + (c.charCodeAt(2)<<8) + (c.charCodeAt(1)<<16) + (c.charCodeAt(0)<<24);
	return (c.charCodeAt(0)) + (c.charCodeAt(1)<<8) + (c.charCodeAt(2)<<16) + (c.charCodeAt(3)<<24);
}