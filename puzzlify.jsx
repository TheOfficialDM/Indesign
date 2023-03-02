//DESCRIPTION:Puzzlify
// A Jongware Script, 8-Oct-2010

myDlg = new Window('dialog', 'Puzzlify');
myDlg.orientation = 'column';
myDlg.alignment = 'right';
myDlg.add('statictext', undefined, "A Jongware Script 7-Oct-2010");

with (myDlg.add('group'))
{
	orientation = 'row';
	add('statictext', undefined, "Columns");
	colTxt = add('edittext', undefined, "5");
	colTxt.characters = 6;
}
with (myDlg.add('group'))
{
	orientation = 'row';
	add('statictext', undefined, "Rows");
	rowTxt = add('edittext', undefined, "5");
	rowTxt.characters = 6;
}
with (myDlg.add('group'))
{
	orientation = 'row';
	traditionalRadio = add('radiobutton', undefined, "Traditional");
	traditionalRadio.value = true;
	randomRadio = add('radiobutton', undefined, "Random");
	randomRadio.value = false;
}
with (myDlg.add('group'))
{
	orientation = 'row';
	scatterBox = add('checkbox', undefined, "Explode");
	scatterBox.value = false;
	deleteBox = add('checkbox', undefined, "Delete original");
	deleteBox.value = true;
}
with (myDlg.add('group'))
{
	orientation = 'row';
	add('button', undefined, "OK");
	add('button', undefined, "Cancel");
}

if (app.documents.length > 0 && app.selection.length == 1 && myDlg.show() == 1 && (colTxt.text || rowTxt.text))
{
	sel = app.selection[0];
	
	cols = Math.round(Number(colTxt.text));
	rows = Math.round(Number(rowTxt.text));

	if ((cols >= 1 && rows >= 1) || (cols == 0 && rows >= 1) || (cols >= 1 && rows == 0))
	{
		sel.selected = false;

		if (cols == 0)
		{
			ratio = Math.abs((sel.geometricBounds[2]-sel.geometricBounds[0])/(sel.geometricBounds[3]-sel.geometricBounds[1]));
			cols = Math.round(ratio*rows);
		}
		if (rows == 0)
		{
			ratio = Math.abs((sel.geometricBounds[3]-sel.geometricBounds[1])/(sel.geometricBounds[2]-sel.geometricBounds[0]));
			rows = Math.round(ratio*cols);
		}
	
		posx = sel.geometricBounds[0];
		posy = sel.geometricBounds[3];
		
		width = (sel.geometricBounds[2]-sel.geometricBounds[0])/cols;
		height = (sel.geometricBounds[3]-sel.geometricBounds[1])/rows;
		
		// Constants for vertical nubs
		oneThirdWide = width/3;
		oneQuarterHigh = height/4;
		
		// Constants for horizontal nubs
		oneThirdHigh = height/3;
		oneQuarterWide = width/4;
		
		nubdir = new Array (rows);
		if (randomRadio.value)
		{
			for (y=0; y<rows; y++)
			{
				nubdir[y] = new Array (cols);
				for (x=0; x<cols; x++)
				{
					nubdir[y][x] = new Array(4);
					// Top Y nub direction; true = up, false = down
					nubdir[y][x][0] = (Math.random() < 0.5);
					// Right X nub direction; true = right, false = left
					nubdir[y][x][1] = (Math.random() < 0.5);
					// Jitter value
					nubdir[y][x][2] = height*(Math.random()-0.5)/10;
					nubdir[y][x][3] = width*(Math.random()-0.5)/10;
				}
			}
		} else
		{
			// Traditional:
			for (y=0; y<rows; y++)
			{
				nubdir[y] = new Array (cols);
				for (x=0; x<cols; x++)
				{
					nubdir[y][x] = new Array(4);
					// Top Y nub direction; true = up, false = down
					nubdir[y][x][0] = (x & 1) ^ (y & 1);
					// Right X nub direction; true = right, false = left
					nubdir[y][x][1] = !((x & 1) ^ (y & 1));
					// Jitter value
					nubdir[y][x][2] = height*(Math.random()-0.5)/10;
					nubdir[y][x][3] = width*(Math.random()-0.5)/10;
				}
			}
		}
	
		for (y=0; y<rows; y++)
		{
			for (x=0; x<cols; x++)
			{
			//	Make a new group
				g = app.activeDocument.groupItems.add();

			//	Duplicate the selected object (and deselect it, while we have a handle)
				sel.duplicate(g).selected = false;

			//	Create a path to make the clipping path
				r = g.pathItems.add();
		
				// Add top left point
				addPoint (r,  posx+x*width, posy-(y+1)*height);
		
				if (y < rows-1)
				{
					if (nubdir[y+1][x][0])
					{
						// Add four points to get nub up on top side
						var curvept = r.pathPoints.add();
						curvept.anchor = [ posx+x*width+oneThirdWide, posy-(y+1)*height-nubdir[y+1][x][2] ];
						curvept.leftDirection = [ posx+x*width+0.67*oneThirdWide, posy-(y+1)*height+0.33*oneQuarterHigh-nubdir[y+1][x][2] ];
						curvept.rightDirection = [ posx+x*width+1.33*oneThirdWide, posy-(y+1)*height-0.33*oneQuarterHigh-nubdir[y+1][x][2] ];
						curvept.pointType = PointType.SMOOTH;
			
						var curvept = r.pathPoints.add();
						curvept.anchor = [ posx+x*width+oneThirdWide, posy-(y+1)*height-oneQuarterHigh-nubdir[y+1][x][2] ];
						curvept.rightDirection = [ posx+x*width+1.33*oneThirdWide, posy-(y+1)*height-oneQuarterHigh-0.33*oneQuarterHigh-nubdir[y+1][x][2] ];
						curvept.leftDirection = [ posx+x*width+0.67*oneThirdWide, posy-(y+1)*height-oneQuarterHigh+0.33*oneQuarterHigh-nubdir[y+1][x][2] ];
						curvept.pointType = PointType.SMOOTH;
				
						var curvept = r.pathPoints.add();
						curvept.anchor = [ posx+x*width+2*oneThirdWide, posy-(y+1)*height-oneQuarterHigh-nubdir[y+1][x][2] ];
						curvept.rightDirection = [ posx+x*width+2.33*oneThirdWide, posy-(y+1)*height-oneQuarterHigh+0.33*oneQuarterHigh-nubdir[y+1][x][2] ];
						curvept.leftDirection = [ posx+x*width+1.67*oneThirdWide, posy-(y+1)*height-oneQuarterHigh-0.33*oneQuarterHigh-nubdir[y+1][x][2] ];
						curvept.pointType = PointType.SMOOTH;
				
						var curvept = r.pathPoints.add();
						curvept.anchor = [ posx+x*width+2*oneThirdWide, posy-(y+1)*height-nubdir[y+1][x][2] ];
						curvept.rightDirection = [ posx+x*width+2.33*oneThirdWide, posy-(y+1)*height+0.33*oneQuarterHigh-nubdir[y+1][x][2] ];
						curvept.leftDirection = [ posx+x*width+1.67*oneThirdWide, posy-(y+1)*height-0.33*oneQuarterHigh-nubdir[y+1][x][2] ];
						curvept.pointType = PointType.SMOOTH;
					} else
					{
						// Add four points to get nub down on top side
						var curvept = r.pathPoints.add();
						curvept.anchor = [ posx+x*width+oneThirdWide, posy-(y+1)*height-nubdir[y+1][x][2] ];
						curvept.leftDirection = [ posx+x*width+0.67*oneThirdWide, posy-(y+1)*height-0.33*oneQuarterHigh-nubdir[y+1][x][2] ];
						curvept.rightDirection = [ posx+x*width+1.33*oneThirdWide, posy-(y+1)*height+0.33*oneQuarterHigh-nubdir[y+1][x][2] ];
						curvept.pointType = PointType.SMOOTH;
			
						var curvept = r.pathPoints.add();
						curvept.anchor = [ posx+x*width+oneThirdWide, posy-y*height-3*oneQuarterHigh-nubdir[y+1][x][2] ];
						curvept.rightDirection = [ posx+x*width+1.33*oneThirdWide, posy-y*height-2.5*oneQuarterHigh-nubdir[y+1][x][2] ];
						curvept.leftDirection = [ posx+x*width+0.67*oneThirdWide, posy-y*height-3.5*oneQuarterHigh-nubdir[y+1][x][2] ];
						curvept.pointType = PointType.SMOOTH;
				
						var curvept = r.pathPoints.add();
						curvept.anchor = [ posx+x*width+2*oneThirdWide, posy-y*height-3*oneQuarterHigh-nubdir[y+1][x][2] ];
						curvept.rightDirection = [ posx+x*width+2.33*oneThirdWide, posy-y*height-3.5*oneQuarterHigh-nubdir[y+1][x][2] ];
						curvept.leftDirection = [ posx+x*width+1.67*oneThirdWide, posy-y*height-2.5*oneQuarterHigh-nubdir[y+1][x][2] ];
						curvept.pointType = PointType.SMOOTH;
				
						var curvept = r.pathPoints.add();
						curvept.anchor = [ posx+x*width+2*oneThirdWide, posy-(y+1)*height-nubdir[y+1][x][2] ];
						curvept.rightDirection = [ posx+x*width+2.33*oneThirdWide, posy-(y+1)*height-0.33*oneQuarterHigh-nubdir[y+1][x][2] ];
						curvept.leftDirection = [ posx+x*width+1.67*oneThirdWide, posy-(y+1)*height+0.33*oneQuarterHigh-nubdir[y+1][x][2] ];
						curvept.pointType = PointType.SMOOTH;
					}
				}
		
				// Add top right point
				addPoint (r,  posx+(x+1)*width, posy-(y+1)*height);
				
				if (x < cols-1)
				{
					if (nubdir[y][x+1][1])
					{
						// Add four points to get nub right on right side
						var curvept = r.pathPoints.add();
						curvept.anchor = [ posx+x*width+4*oneQuarterWide-nubdir[y][x+1][3], posy-y*height-2*oneThirdHigh ];
						curvept.leftDirection = [ posx+x*width+3.5*oneQuarterWide-nubdir[y][x+1][3], posy-y*height-2.33*oneThirdHigh ];
						curvept.rightDirection = [ posx+x*width+4.5*oneQuarterWide-nubdir[y][x+1][3], posy-y*height-1.67*oneThirdHigh ];
						curvept.pointType = PointType.SMOOTH;
				
						var curvept = r.pathPoints.add();
						curvept.anchor = [ posx+x*width+5*oneQuarterWide-nubdir[y][x+1][3], posy-y*height-2*oneThirdHigh ];
						curvept.leftDirection = [ posx+x*width+4.5*oneQuarterWide-nubdir[y][x+1][3], posy-y*height-2.33*oneThirdHigh ];
						curvept.rightDirection = [ posx+x*width+5.5*oneQuarterWide-nubdir[y][x+1][3], posy-y*height-1.67*oneThirdHigh ];
						curvept.pointType = PointType.SMOOTH;
				
						var curvept = r.pathPoints.add();
						curvept.anchor = [ posx+x*width+5*oneQuarterWide-nubdir[y][x+1][3], posy-y*height-1*oneThirdHigh ];
						curvept.leftDirection = [ posx+x*width+5.5*oneQuarterWide-nubdir[y][x+1][3], posy-y*height-1.33*oneThirdHigh ];
						curvept.rightDirection = [ posx+x*width+4.5*oneQuarterWide-nubdir[y][x+1][3], posy-y*height-0.67*oneThirdHigh ];
						curvept.pointType = PointType.SMOOTH;
				
						var curvept = r.pathPoints.add();
						curvept.anchor = [ posx+x*width+4*oneQuarterWide-nubdir[y][x+1][3], posy-y*height-oneThirdHigh ];
						curvept.leftDirection = [ posx+x*width+4.5*oneQuarterWide-nubdir[y][x+1][3], posy-y*height-1.33*oneThirdHigh ];
						curvept.rightDirection = [ posx+x*width+3.5*oneQuarterWide-nubdir[y][x+1][3], posy-y*height-0.67*oneThirdHigh ];
						curvept.pointType = PointType.SMOOTH;
					} else
					{
						// Add four points to get nub left on right side
						var curvept = r.pathPoints.add();
						curvept.anchor = [ posx+x*width+4*oneQuarterWide-nubdir[y][x+1][3], posy-y*height-2*oneThirdHigh ];
						curvept.rightDirection = [ posx+x*width+3.5*oneQuarterWide-nubdir[y][x+1][3], posy-y*height-1.67*oneThirdHigh ];
						curvept.leftDirection = [ posx+x*width+4.5*oneQuarterWide-nubdir[y][x+1][3], posy-y*height-2.33*oneThirdHigh ];
						curvept.pointType = PointType.SMOOTH;
				
						var curvept = r.pathPoints.add();
						curvept.anchor = [ posx+x*width+3*oneQuarterWide-nubdir[y][x+1][3], posy-y*height-2*oneThirdHigh ];
						curvept.rightDirection = [ posx+x*width+2.5*oneQuarterWide-nubdir[y][x+1][3], posy-y*height-1.67*oneThirdHigh ];
						curvept.leftDirection = [ posx+x*width+3.5*oneQuarterWide-nubdir[y][x+1][3], posy-y*height-2.33*oneThirdHigh ];
						curvept.pointType = PointType.SMOOTH;
				
						var curvept = r.pathPoints.add();
						curvept.anchor = [ posx+x*width+3*oneQuarterWide-nubdir[y][x+1][3], posy-y*height-1*oneThirdHigh ];
						curvept.leftDirection = [ posx+x*width+2.5*oneQuarterWide-nubdir[y][x+1][3], posy-y*height-1.33*oneThirdHigh ];
						curvept.rightDirection = [ posx+x*width+3.5*oneQuarterWide-nubdir[y][x+1][3], posy-y*height-0.67*oneThirdHigh ];
						curvept.pointType = PointType.SMOOTH;
	
						var curvept = r.pathPoints.add();
						curvept.anchor = [ posx+x*width+4*oneQuarterWide-nubdir[y][x+1][3], posy-y*height-oneThirdHigh ];
						curvept.rightDirection = [ posx+x*width+4.5*oneQuarterWide-nubdir[y][x+1][3], posy-y*height-0.67*oneThirdHigh ];
						curvept.leftDirection = [ posx+x*width+3.5*oneQuarterWide-nubdir[y][x+1][3], posy-y*height-1.33*oneThirdHigh ];
						curvept.pointType = PointType.SMOOTH;
					}
				}
				
				// Add bottom right point
				addPoint (r,  posx+(x+1)*width, posy-y*height);
		
				if (y > 0)
				{
					// Add four points to get nub up on bottom side
					if (nubdir[y][x][0])
					{
						var curvept = r.pathPoints.add();
						curvept.anchor = [ posx+x*width+2*oneThirdWide, posy-y*height-nubdir[y][x][2] ];
						curvept.leftDirection = [ posx+x*width+2.33*oneThirdWide, posy-y*height+0.33*oneQuarterHigh-nubdir[y][x][2] ];
						curvept.rightDirection = [ posx+x*width+1.67*oneThirdWide, posy-y*height-0.33*oneQuarterHigh-nubdir[y][x][2] ];
						curvept.pointType = PointType.SMOOTH;
				
						var curvept = r.pathPoints.add();
						curvept.anchor = [ posx+x*width+2*oneThirdWide, posy-y*height-oneQuarterHigh-nubdir[y][x][2] ];
						curvept.leftDirection = [ posx+x*width+2.33*oneThirdWide, posy-y*height-oneQuarterHigh+0.33*oneQuarterHigh-nubdir[y][x][2] ];
						curvept.rightDirection = [ posx+x*width+1.67*oneThirdWide, posy-y*height-oneQuarterHigh-0.33*oneQuarterHigh-nubdir[y][x][2] ];
						curvept.pointType = PointType.SMOOTH;
				
						var curvept = r.pathPoints.add();
						curvept.anchor = [ posx+x*width+oneThirdWide, posy-y*height-oneQuarterHigh-nubdir[y][x][2] ];
						curvept.leftDirection = [ posx+x*width+1.33*oneThirdWide, posy-y*height-oneQuarterHigh-0.33*oneQuarterHigh-nubdir[y][x][2] ];
						curvept.rightDirection = [ posx+x*width+0.67*oneThirdWide, posy-y*height-oneQuarterHigh+0.33*oneQuarterHigh-nubdir[y][x][2] ];
						curvept.pointType = PointType.SMOOTH;
				
						var curvept = r.pathPoints.add();
						curvept.anchor = [ posx+x*width+oneThirdWide, posy-y*height-nubdir[y][x][2] ];
						curvept.rightDirection = [ posx+x*width+0.67*oneThirdWide, posy-y*height+0.33*oneQuarterHigh-nubdir[y][x][2] ];
						curvept.leftDirection = [ posx+x*width+1.33*oneThirdWide, posy-y*height-0.33*oneQuarterHigh-nubdir[y][x][2] ];
						curvept.pointType = PointType.SMOOTH;
					} else
					{
						// Add four points to get nub down on top side
						var curvept = r.pathPoints.add();
						curvept.anchor = [ posx+x*width+2*oneThirdWide, posy-y*height-nubdir[y][x][2] ];
						curvept.leftDirection = [ posx+x*width+2.33*oneThirdWide, posy-y*height-0.33*oneQuarterHigh-nubdir[y][x][2] ];
						curvept.rightDirection = [ posx+x*width+1.67*oneThirdWide, posy-y*height+0.33*oneQuarterHigh-nubdir[y][x][2] ];
						curvept.pointType = PointType.SMOOTH;
			
						var curvept = r.pathPoints.add();
						curvept.anchor = [ posx+x*width+2*oneThirdWide, posy-y*height+oneQuarterHigh-nubdir[y][x][2] ];
						curvept.rightDirection = [ posx+x*width+1.67*oneThirdWide, posy-y*height+1.5*oneQuarterHigh-nubdir[y][x][2] ];
						curvept.leftDirection = [ posx+x*width+2.33*oneThirdWide, posy-y*height+0.5*oneQuarterHigh-nubdir[y][x][2] ];
						curvept.pointType = PointType.SMOOTH;
				
						var curvept = r.pathPoints.add();
						curvept.anchor = [ posx+x*width+oneThirdWide, posy-y*height+oneQuarterHigh-nubdir[y][x][2] ];
						curvept.rightDirection = [ posx+x*width+0.67*oneThirdWide, posy-y*height+0.5*oneQuarterHigh-nubdir[y][x][2] ];
						curvept.leftDirection = [ posx+x*width+1.33*oneThirdWide, posy-y*height+1.5*oneQuarterHigh-nubdir[y][x][2] ];
						curvept.pointType = PointType.SMOOTH;
				
						var curvept = r.pathPoints.add();
						curvept.anchor = [ posx+x*width+oneThirdWide, posy-y*height-nubdir[y][x][2] ];
						curvept.rightDirection = [ posx+x*width+0.67*oneThirdWide, posy-y*height-0.33*oneQuarterHigh-nubdir[y][x][2] ];
						curvept.leftDirection = [ posx+x*width+1.33*oneThirdWide, posy-y*height+0.33*oneQuarterHigh-nubdir[y][x][2] ];
						curvept.pointType = PointType.SMOOTH;
					}
				}
		
				// Add bottom left point
				addPoint (r,  posx+x*width, posy-y*height);
		
				if (x > 0)
				{
					if (nubdir[y][x][1])
					{
						// Add four points to get nub right on left side
						var curvept = r.pathPoints.add();
						curvept.anchor = [ posx+x*width-nubdir[y][x][3], posy-y*height-oneThirdHigh ];
						curvept.rightDirection = [ posx+x*width+0.5*oneQuarterWide-nubdir[y][x][3], posy-y*height-1.33*oneThirdHigh ];
						curvept.leftDirection = [ posx+x*width-0.5*oneQuarterWide-nubdir[y][x][3], posy-y*height-0.67*oneThirdHigh ];
						curvept.pointType = PointType.SMOOTH;
			
						var curvept = r.pathPoints.add();
						curvept.anchor = [ posx+x*width+oneQuarterWide-nubdir[y][x][3], posy-y*height-1*oneThirdHigh ];
						curvept.rightDirection = [ posx+x*width+1.5*oneQuarterWide-nubdir[y][x][3], posy-y*height-1.33*oneThirdHigh ];
						curvept.leftDirection = [ posx+x*width+0.5*oneQuarterWide-nubdir[y][x][3], posy-y*height-0.67*oneThirdHigh ];
						curvept.pointType = PointType.SMOOTH;
			
						var curvept = r.pathPoints.add();
						curvept.anchor = [ posx+x*width+oneQuarterWide-nubdir[y][x][3], posy-y*height-2*oneThirdHigh ];
						curvept.rightDirection = [ posx+x*width+0.5*oneQuarterWide-nubdir[y][x][3], posy-y*height-2.33*oneThirdHigh ];
						curvept.leftDirection = [ posx+x*width+1.5*oneQuarterWide-nubdir[y][x][3], posy-y*height-1.67*oneThirdHigh ];
						curvept.pointType = PointType.SMOOTH;
			
						var curvept = r.pathPoints.add();
						curvept.anchor = [ posx+x*width-nubdir[y][x][3], posy-y*height-2*oneThirdHigh ];
						curvept.rightDirection = [ posx+x*width-0.5*oneQuarterWide-nubdir[y][x][3], posy-y*height-2.33*oneThirdHigh ];
						curvept.leftDirection = [ posx+x*width+0.5*oneQuarterWide-nubdir[y][x][3], posy-y*height-1.67*oneThirdHigh ];
						curvept.pointType = PointType.SMOOTH;
					} else
					{
						// Add four points to get nub left on left side
						var curvept = r.pathPoints.add();
						curvept.anchor = [ posx+x*width-nubdir[y][x][3], posy-y*height-oneThirdHigh ];
						curvept.leftDirection = [ posx+x*width+0.5*oneQuarterWide-nubdir[y][x][3], posy-y*height-0.67*oneThirdHigh ];
						curvept.rightDirection = [ posx+x*width-0.5*oneQuarterWide-nubdir[y][x][3], posy-y*height-1.33*oneThirdHigh ];
						curvept.pointType = PointType.SMOOTH;
			
						var curvept = r.pathPoints.add();
						curvept.anchor = [ posx+x*width-oneQuarterWide-nubdir[y][x][3], posy-y*height-1*oneThirdHigh ];
						curvept.leftDirection = [ posx+x*width-0.5*oneQuarterWide-nubdir[y][x][3], posy-y*height-0.67*oneThirdHigh ];
						curvept.rightDirection = [ posx+x*width-1.5*oneQuarterWide-nubdir[y][x][3], posy-y*height-1.33*oneThirdHigh ];
						curvept.pointType = PointType.SMOOTH;
			
						var curvept = r.pathPoints.add();
						curvept.anchor = [ posx+x*width-oneQuarterWide-nubdir[y][x][3], posy-y*height-2*oneThirdHigh ];
						curvept.rightDirection = [ posx+x*width-0.5*oneQuarterWide-nubdir[y][x][3], posy-y*height-2.33*oneThirdHigh ];
						curvept.leftDirection = [ posx+x*width-1.5*oneQuarterWide-nubdir[y][x][3], posy-y*height-1.67*oneThirdHigh ];
						curvept.pointType = PointType.SMOOTH;
			
						var curvept = r.pathPoints.add();
						curvept.anchor = [ posx+x*width-nubdir[y][x][3], posy-y*height-2*oneThirdHigh ];
						curvept.leftDirection = [ posx+x*width-0.5*oneQuarterWide-nubdir[y][x][3], posy-y*height-1.67*oneThirdHigh ];
						curvept.rightDirection = [ posx+x*width+0.5*oneQuarterWide-nubdir[y][x][3], posy-y*height-2.33*oneThirdHigh ];
						curvept.pointType = PointType.SMOOTH;
					}
				}
				
			//	Close the path. Neatness First.
				r.closed = true;
			//	This group is clipped
				g.clipped = true;
			//	Move away from the rest?
				if (scatterBox.value)
				{
					var moveMatrix = app.getTranslationMatrix( width*(x-(cols/2))/2, -(height*(y-(rows/2))/2) );
					g.transform( moveMatrix );
				}
			//	Add to current selection
				g.selected = true;
			}
		}
		
		if (deleteBox.value)
			sel.remove();
	}
} else
	myDlg.hide();

function addPoint (obj, x, y)
{
	var np = obj.pathPoints.add();
	np.anchor = [x,y];
	np.leftDirection = [x,y];
	np.rightDirection = [x,y];
	np.pointType = PointType.CORNER;
}
