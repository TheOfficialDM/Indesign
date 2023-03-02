//DESCRIPTION: Highlight deviations in word and letter spacing, glyph scaling, and tracking
//Peter Kahrel


(function () {

	var doc = app.documents[0];

	var condition_colours = {
		word_spacing: UIColors.GRID_GREEN,
		letter_spacing: UIColors.GRID_BLUE,
		glyph_scaling: UIColors.GRID_ORANGE,
		tracking: UIColors.LIPSTICK,
		horizontal_scaling: UIColors.YELLOW
	}


	function check_conditions (doc) {
		for (var i in condition_colours) {
			if (doc.conditions.item (i) == null) {
				doc.conditions.add ({
					name: i, 
					indicatorColor: condition_colours[i], 
					indicatorMethod: ConditionIndicatorMethod.USE_HIGHLIGHT
				});
			}
		}
	}


	function actual_spacing (x, par) {
		switch (x) {
			case 'word_spacing' : return par.minimumWordSpacing + par.desiredWordSpacing + par.maximumWordSpacing;
			case 'letter_spacing' : return par.minimumLetterSpacing + par.desiredLetterSpacing + par.maximumLetterSpacing;
			case 'glyph_scaling' : return par.minimumGlyphScaling + par.desiredGlyphScaling + par.maximumGlyphScaling;
			case 'tracking' : return par.tracking;
			case 'horizontal_scaling' : return par.horizontalScale;
		}
	}

	function style_spacing (x, pstyle) {
		return actual_spacing (x, pstyle)
	}

	function main (doc) {
		var i;
		var j;
		var apply_conditions = [];
		var p = doc.stories.everyItem().paragraphs.everyItem().getElements();
		for (i = 0; i < p.length; i++) {
			apply_conditions = [];
			for (j in condition_colours) {
				if (actual_spacing (j, p[i]) != style_spacing (j, p[i].appliedParagraphStyle)) {
					apply_conditions.push (doc.conditions.item(j));
				}
			}
			if (apply_conditions.length > 0) {
				p[i].applyConditions (apply_conditions, true)
			}
		}
		// Conditional text is visible only Normal screenmode
		doc.layoutWindows[0].screenMode = ScreenModeOptions.PREVIEW_OFF;
	}

	check_conditions (doc);
	main (doc);

}());