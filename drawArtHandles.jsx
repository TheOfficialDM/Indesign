//DESCRIPTION:Draw Visible Art Handles
// A Jongware Script, 30-Sep-2010

if (app.documents.length > 0 && app.selection.length > 0)
{
	// Ladies & Gentlemen, we Have a valid selection!
	// (cheers, applause etc.)
	blue = new RGBColor();
	blue.red = 79;
	blue.green = 128;
	blue.blue = 255;
	white = new GrayColor();
	white.gray = 0;

	try {
		layer = app.activeDocument.layers.getByName ("Visible Art");
	} catch (_)
	{
		layer = app.activeDocument.layers.add();
		layer.name = "Visible Art";
	}
	activeLayer = layer;

	// Go over each path in the selection
	for (my_path=0; my_path < app.selection.length; my_path++)
		drawPathsFor (app.selection[my_path]);

	// Gather a bounding box for everything
	bbox = null;
	for (my_path=0; my_path < app.selection.length; my_path++)
		bbox = getBoundingBox (bbox, app.selection[my_path]);

	// Draw the bounding box
	r = app.activeDocument.pathItems.rectangle (bbox[1], bbox[0], bbox[2]-bbox[0], bbox[1]-bbox[3]);
	r.fillColor = NoColor;
	r.strokeWidth = 1;
	r.strokeColor = blue;

	// Draw each of the bounding box white boxes
	boundingBoxAt (bbox[0], bbox[1]);
	boundingBoxAt (bbox[0], bbox[3]);
	boundingBoxAt (bbox[2], bbox[1]);
	boundingBoxAt (bbox[2], bbox[3]);

	boundingBoxAt ((bbox[0]+bbox[2])/2, bbox[1]);
	boundingBoxAt ((bbox[0]+bbox[2])/2, bbox[3]);
	boundingBoxAt (bbox[0], (bbox[1]+bbox[3])/2);
	boundingBoxAt (bbox[2], (bbox[1]+bbox[3])/2);
} else
{
		alert ("Invalid selection... Better luck next time!");
}

function getBoundingBox (bb, obj)
{
	var cp, gp;
	switch (obj.constructor.name)
	{
		case "PathItem": bb = updateBoundingBox (bb, obj.visibleBounds); break;
		case "CompoundPathItem":
			for (cp=0; cp<obj.pathItems.length; cp++)
				bb = updateBoundingBox (bb, obj.pathItems[cp].visibleBounds);
			break;
		case "GroupItem":
			for (gp=0; gp<obj.pageItems.length; gp++)
				bb = getBoundingBox (bb, obj.pageItems[gp]);
			break;
		case "TextFrame":
			cp = obj.duplicate();
			gp = cp.createOutline ();
			bb = updateBoundingBox (bb, gp.visibleBounds);
			gp.remove();
			break;
	}
	return bb;
}

function updateBoundingBox (bbox, bounds)
{
	if (bbox == null)
		return [ bounds[0], bounds[1], bounds[2], bounds[3] ];
	if (bounds[0] < bbox[0])
		bbox[0] = bounds[0];
	if (bounds[1] > bbox[1])
		bbox[1] = bounds[1];
	if (bounds[2] > bbox[2])
		bbox[2] = bounds[2];
	if (bounds[3] < bbox[3])
		bbox[3] = bounds[3];
	return bbox;
}

function drawPathsFor (obj)
{
	var cp,gp;
	switch (obj.constructor.name)
	{
		case "PathItem": drawPathPoints (obj); break;
		case "CompoundPathItem":
			for (cp=0; cp<obj.pathItems.length; cp++)
				drawPathPoints (obj.pathItems[cp]);
			break;
		case "GroupItem":
			for (gp=0; gp<obj.pageItems.length; gp++)
				drawPathsFor (obj.pageItems[gp]);
			break;
		case "TextFrame":
			cp = obj.duplicate();
			gp = cp.createOutline ();
			drawPathsFor (gp);
			gp.remove();
			break;
	}
}

function drawPathPoints (obj)
{
	var r, a_path, pts;
	// Check out each separate path point
	a_path = obj.pathPoints;
	for (pts=0; pts<a_path.length; pts++)
	{
		r = app.activeDocument.pathItems.rectangle (a_path[pts].anchor[1]+2, a_path[pts].anchor[0]-2,4,4);
		r.strokeWidth = 0;
		r.fillColor = blue;
		if (a_path[pts].leftDirection[0] != a_path[pts].anchor[0] || a_path[pts].leftDirection[1] != a_path[pts].anchor[1])
		{
			r = app.activeDocument.pathItems.add();
			r.setEntirePath ( [ a_path[pts].leftDirection, a_path[pts].anchor ] );
			r.strokeWidth = 1;
			r.strokeColor = blue;
			r = app.activeDocument.pathItems.ellipse (a_path[pts].leftDirection[1]+2, a_path[pts].leftDirection[0]-2,4,4);
			r.strokeWidth = 0;
			r.fillColor = blue;
		}
		if (a_path[pts].rightDirection[0] != a_path[pts].anchor[0] || a_path[pts].rightDirection[1] != a_path[pts].anchor[1])
		{
			r = app.activeDocument.pathItems.add();
			r.setEntirePath ( [ a_path[pts].rightDirection, a_path[pts].anchor ] );
			r.strokeWidth = 1;
			r.strokeColor = blue;
			r = app.activeDocument.pathItems.ellipse (a_path[pts].rightDirection[1]+2, a_path[pts].rightDirection[0]-2,4,4);
			r.strokeWidth = 0;
			r.fillColor = blue;
		}
	}
}

function boundingBoxAt (cx,cy)
{
	var r;

	r = app.activeDocument.pathItems.rectangle (cy+2, cx-2, 4,4);
	r.strokeWidth = 1;
	r.strokeColor = blue;
	r.fillColor = white;
}