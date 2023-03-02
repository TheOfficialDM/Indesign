// Font Replacement Routine by Marc Autret
// The source is here: https://www.indiscripts.com/post/2011/03/indesign-scripting-forum-25-sticky-posts#hd2sb1
// A simple changeMissingFontsBy method (tested in InDesign CS4):

Document.prototype.changeMissingFontsBy = function(/*str|Font*/fontOrFontName)
{
var asFont = function(/*var*/f)
    {
    if( !f ) return null;
    if( 'string' == typeof f ) f = app.fonts.item(f);
    if( f.constructor != Font ) return null;
    return f;
    };
 
var missing = function(/*Font*/f)
    {
    return f.status != FontStatus.INSTALLED;
    };
 
var substFont = asFont(fontOrFontName);
if( (!substFont) || missing(substFont) )
    {
    alert( "["+ fontOrFontName + "] not installed!" );
    return;
    }
 
var changeMissingFont = function(obj)
    { // <obj> == any object w/ appliedFont prop
    var f = asFont(obj.appliedFont);
    if( !f || !missing(f) ) return;
 
    try{obj.appliedFont = substFont;}
    catch(_){}
    };
 
var scope = this.allCharacterStyles
    .concat(this.allParagraphStyles)
    .concat(this.stories.everyItem().
        textStyleRanges.everyItem().getElements());
 
var s;
while( s=scope.shift() ) changeMissingFont(s);
}
 
// test
app.activeDocument.changeMissingFontsBy("Times New Roman");