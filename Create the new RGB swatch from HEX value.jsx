var d = app.activeDocument;
var ns = makeSwatch(getClipboard());
ns.properties = {model:ColorModel.PROCESS, space:ColorSpace.RGB, colorValue:hexToRgb(getClipboard())}

/*
* Gets the RGB values as an array from the provided hex value 
* @ param the hex value 
* @ return array of RGB values 
*/
function hexToRgb(hx) {
    var r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hx);
    var a = [];
    var i = 3;
    while (i--) a.push(parseInt(r[i+1], 16));
    return a;
}
  
/*
* Makes a new swatch
* @ param swatch name 
* @ return the new swatch 
*/
function makeSwatch(n){
    var s;
    try {
        d.colors.add({name:n});
    }catch(e) {
        s = d.colors.itemByName(n);
    } 
    return d.colors.itemByName(n);
}

/*
* Gets the clipboard text contents
* @ return the clipboard‘s text as a string 
*/
function getClipboard(){
    var tf = app.activeDocument.pages[0].textFrames.add();
	tf.parentStory.texts[0].select();
	app.paste();
	var cb = tf.parentStory.contents.toString();
    tf.remove();
    return cb;
}