//DESCRIPTION:Variations -- a Jongware Script
// A Jongware Script 02-Jun-2012
#targetengine "Variations"

if (app.documents.length && app.selection && app.selection.length == 1 && app.selection[0].hasOwnProperty('paths'))
{
	sample = app.selection[0];
	color = sample.fillColor;
//	alert (color.reflect.properties);
	switch (color.space)
	{
		case ColorSpace.RGB: space = 'RGB'; break;
		case ColorSpace.CMYK: space = 'CMYK'; break;
		case ColorSpace.LAB: space = 'Lab'; break;
		default:
			alert ("Unknown Color Space\rPlease use CMYK, RGB, or Lab colors only");
			exit();
	}
	colorText = '';
	for (i=0; i<color.colorValue.length; i++)
		colorText += (colorText == '' ? '' : ',')+Math.round(color.colorValue[i]);

	sliders = [];

	var w = new Window ("dialog", "Variations");
	smallfont = ScriptUI.newFont ('dialog','REGULAR',w.graphics.font.size*0.75);
	w.add ("statictext", undefined, 'A Jongware Script 02-Jun-2012').graphics.font = smallfont;
	with(w.add ("group"))
	{
		add ('statictext', undefined, 'Current: '+space+'; '+colorText);
	}
	w.orientation = 'column';
	var params = ['Hue','Saturation','Brightness', 'Red','Yellow','Green','Cyan','Blue','Magenta'];
	for (i=0; i<params.length; i++)
	{
		with(w.add ("group"))
		{
			add ('statictext', undefined, params[i]).characters = 12;
			s = add ("slider", undefined, 0, -10, 10);
			s.associatedControl = add ("edittext", undefined, 0);
			s.associatedControl.associatedControl = s;
			s.associatedControl.characters = 5;
			s.associatedControl.onChange = function () {if (parseInt(this.text) != this.associatedControl.value) this.associatedControl.value = parseInt(this.text); };
			s.onChanging = function () {this.associatedControl.text = (this.value > 0 ? '+' : '')+this.value;};
			sliders.push (s);
		}
	}
	with(w.add ("group"))
	{
		add ("button", undefined, "OK");
		add ("button", undefined, "Cancel");
	}
	if (w.show() == 1)
	{
		// Make it 1% smaller so they slightly overlap -- otherwise you might
		// see an irritating white line here and there.
		width = 0.99*(sample.geometricBounds[3]-sample.geometricBounds[1]);
		// Enough space on right side?
		maxwidth = (app.layoutWindows[0].activePage.bounds[3]-sample.geometricBounds[3])/6;
		// No? Make it so!
		if (maxwidth < width) width = maxwidth;
		// Add a copy of the original at the very end
		sample.duplicate(undefined, [6*width,0]);

		for (rept=1; rept<=5; rept++)
		{
			next = sample.duplicate(undefined, [width,0]);
			c = app.activeDocument.colors.add(next.fillColor);
			c.space = ColorSpace.RGB;
			hsl = RGBtoHSL (c.colorValue);
			hsl[0] = Math.min(255,Math.max(0,hsl[0]+rept*Number(sliders[0].associatedControl.text)));
			hsl[1] = Math.min(255,Math.max(0,hsl[1]+rept*Number(sliders[1].associatedControl.text)));
			hsl[2] = Math.min(255,Math.max(0,hsl[2]+rept*Number(sliders[2].associatedControl.text)));
			rgb = HSLtoRGB(hsl);
			rgb[0] = Math.min(255,Math.max(0,rgb[0]+rept*Number(sliders[3].associatedControl.text)));
			rgb[1] = Math.min(255,Math.max(0,rgb[1]+rept*Number(sliders[5].associatedControl.text)));
			rgb[2] = Math.min(255,Math.max(0,rgb[2]+rept*Number(sliders[7].associatedControl.text)));
			try {
				c.colorValue = rgb;
			} catch(_) {};
			c.space = ColorSpace.CMYK;
			cmyk = [c.colorValue[0],c.colorValue[1],c.colorValue[2],c.colorValue[3]];
			cmyk[2] = Math.min(100,Math.max(0,cmyk[2]+rept*Number(sliders[4].associatedControl.text)));
			cmyk[0] = Math.min(100,Math.max(0,cmyk[0]+rept*Number(sliders[6].associatedControl.text)));
			cmyk[1] = Math.min(100,Math.max(0,cmyk[1]+rept*Number(sliders[8].associatedControl.text)));
			try {
				c.colorValue = cmyk;
			} catch(_) { }
			next.fillColor = c;
			sample = next;
		}
	}
} else
{
	alert ("Please select an example rectangle first!");
}

// Formulas taken from http://www.easyrgb.com
function RGBtoHSL (rgb)
{
	var_R = ( rgb[0] / 255 );                     //RGB from 0 to 255
	var_G = ( rgb[1] / 255 );
	var_B = ( rgb[2] / 255 );
	
	var_Min = Math.min( var_R, var_G, var_B );    //Min. value of RGB
	var_Max = Math.max( var_R, var_G, var_B );    //Max. value of RGB
	del_Max = var_Max - var_Min;             //Delta RGB value
	
	L = ( var_Max + var_Min ) / 2;
	
	if ( del_Max == 0 )                     //This is a gray, no chroma...
	{
	   H = 0;                                //HSL results from 0 to 1
	   S = 0;
	}
	else                                    //Chromatic data...
	{
	   if ( L < 0.5 ) S = del_Max / ( var_Max + var_Min );
	   else           S = del_Max / ( 2 - var_Max - var_Min );
	
	   del_R = ( ( ( var_Max - var_R ) / 6 ) + ( del_Max / 2 ) ) / del_Max;
	   del_G = ( ( ( var_Max - var_G ) / 6 ) + ( del_Max / 2 ) ) / del_Max;
	   del_B = ( ( ( var_Max - var_B ) / 6 ) + ( del_Max / 2 ) ) / del_Max;
	
	   if      ( var_R == var_Max ) H = del_B - del_G;
	   else if ( var_G == var_Max ) H = ( 1 / 3 ) + del_R - del_B;
	   else if ( var_B == var_Max ) H = ( 2 / 3 ) + del_G - del_R;
	
	   if ( H < 0 ) H += 1;
	   if ( H > 1 ) H -= 1;
	}
	return [255*H,255*S,255*L];
}

function HSLtoRGB (hsl)
{
	hsl[0] /= 255;
	hsl[1] /= 255;
	hsl[2] /= 255;
	if ( hsl[1] == 0 )                       //HSL from 0 to 1
	{
		R = hsl[2] * 255;                      //RGB results from 0 to 255
		G = hsl[2] * 255;
		B = hsl[2] * 255;
	}
	else
	{
		if ( hsl[2] < 0.5 ) var_2 = hsl[2] * ( 1 + hsl[1] );
		else           var_2 = ( hsl[2] + hsl[1] ) - ( hsl[1] * hsl[2] );
	
		var_1 = 2 * hsl[2] - var_2;
	
		R = 255 * Hue_2_RGB( var_1, var_2, hsl[0] + ( 1/3 ) );
		G = 255 * Hue_2_RGB( var_1, var_2, hsl[0] );
		B = 255 * Hue_2_RGB( var_1, var_2, hsl[0] - ( 1/3 ) );
	}
	return [R,G,B];	
}

function Hue_2_RGB( v1, v2, vH )             //Function Hue_2_RGB
{
   if ( vH < 0 ) vH += 1;
   if ( vH > 1 ) vH -= 1;
   if ( ( 6 * vH ) < 1 ) return ( v1 + ( v2 - v1 ) * 6 * vH );
   if ( ( 2 * vH ) < 1 ) return ( v2 );
   if ( ( 3 * vH ) < 2 ) return ( v1 + ( v2 - v1 ) * ( ( 2 / 3 ) - vH ) * 6 );
   return ( v1 );
}
