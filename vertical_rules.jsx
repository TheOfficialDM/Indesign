//DESCRIPTION: Add vertical paragraph rules to selected paragraphs
// Peter Kahrel

try {if (app.selection.length > 0)
    vertical_rules ()}
catch (e) {alert (e.message + "\r(line " + e.line + ")")};


function vertical_rules ()
{
    var vr, rule_length;
    var sel = app.selection[0];
    var p_first = sel.paragraphs[0];
    var p_last = sel.paragraphs[-1];
    var ascender = p_first.characters[0].ascent;
    var descender = p_first.characters[0].descent;
    var os = vrule_style();
    delete_rule (p_first, os.left); // delete any vertical rules
    delete_rule (p_first, os.right);
    // add a rule at the first selected paragraph. We'll set its length later
    vr_left = p_first.insertionPoints[0].graphicLines.add ({appliedObjectStyle: os.left});
    vr_right = p_first.insertionPoints[0].graphicLines.add ({appliedObjectStyle: os.right});
    // Two possibilities
    // 1. Everything on the same page: set the par. rule of just the first paragraph 
    // from its first line to the last paragraph's last line
    if (p_first.lines[0].parentTextFrames[0] == p_last.lines[-1].parentTextFrames[0])
	{
        rule_length = p_last.lines[-1].baseline - p_first.lines[0].baseline + descender + ascender;
        vr_left.geometricBounds = [0, 0, rule_length, 0];
        vr_right.geometricBounds = [0, 0, rule_length, 0];
	}
    else
        // 2. The last paragraph ends on another page: insert a rule in the first line of last selected paragraph's frame
        // and extend it to the last line of the selected paragraph.
        {
        // First set the rule at the first selected paragraph to extend to the bottom of its frame
        rule_length = p_first.parentTextFrames[0].lines[-1].baseline - p_first.lines[0].baseline + ascender + descender;
        vr_left.geometricBounds = [0, 0, rule_length, 0];
        vr_right.geometricBounds = [0, 0, rule_length, 0];
        // Then try to delete any v. rules in the first paragraph of the second frame
        var first_line = p_last.lines[-1].parentTextFrames[0].lines[0];
        delete_rule (first_line.paragraphs[0], os);
        // Now add a rule at the first line of the next frame and extend it to the last line of the last selected paragraph

        rule_length = p_last.lines[-1].baseline - first_line.baseline + ascender + descender;
        first_line.words[4].insertionPoints[-1].graphicLines.add ({appliedObjectStyle: os.left, geometricBounds: [0, 0, rule_length, 0]});
        first_line.words[4].insertionPoints[-1].graphicLines.add ({appliedObjectStyle: os.right, geometricBounds: [0, 0, rule_length, 0]});
	}
}


function vrule_style ()
{
    if (app.documents[0].objectStyles.item ("vertical rule left") == null)
	{
        var os = app.documents[0].objectStyles.add ({name: "vertical rule left"});
        os.basedOn = app.documents[0].objectStyles[0];
        os.strokeWeight = "0.5 pt";
        os.enableAnchoredObjectOptions = true;
        with (os.anchoredObjectSettings)
		{
            spineRelative = false;
            anchoredPosition = AnchorPosition.anchored;
            anchorPoint = AnchorPoint.topRightAnchor;
            horizontalReferencePoint = AnchoredRelativeTo.columnEdge;
            anchorXoffset = "6 pt";
            horizontalAlignment = HorizontalAlignment.leftAlign;
            verticalReferencePoint = VerticallyRelativeTo.lineAscent;
            pinPosition = false;
		}
		var duped = os.duplicate();
		duped.name = 'vertical rule right';
		duped.anchoredObjectSettings.horizontalAlignment = HorizontalAlignment.rightAlign;
	}
	
    return {left: app.documents[0].objectStyles.item ("vertical rule left"),
					right: app.documents[0].objectStyles.item ("vertical rule right")
				}
}


function delete_rule (p, os)
{
    var g = p.graphicLines;
    for (var i = g.length-1; i > -1; i--)
        if (g[i].appliedObjectStyle == os)
            g[i].remove ();
}



function errorM (m)
{
	alert (m, "Error", true)
	exit ()
}
