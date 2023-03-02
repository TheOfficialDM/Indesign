//DESCRIPTION: Decrease the text size incrementally of a selected text frame
// A Jongware script 23-Oct-2020

if (app.selection.length == 1 && app.selection[0] instanceof TextFrame)
{
	// set the start and end values in points
	startSize = 16;
	endSize = 4;
	// get a handle to the text frame contents
	textContents = app.selection[0].parentStory.characters;
	// grab the contents and get its length in characters
	textLength = textContents.length;
	// calculate the difference needed per character
	stepSize = (startSize-endSize)/textLength;
	// apply the new sizes to the text frame contents
	for (i=0; i<textLength; i++)
	{
		textContents[i].pointSize = startSize - stepSize*i;
	}
	// and we're done!
} else
{
	alert ("Please make sure to select a text frame first!")
}