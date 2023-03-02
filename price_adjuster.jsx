
/*
	This script is a combination of Olav Kvern's "PriceUpdateByString" script 
	and Steve Wareham's "number_adjuster" (and adds some functionality). 
	Olav gave permission to use his code; Steve could not be found, 
	his web site appears to have gone permanently off-line.
	
	(Add 18% : n * 1.18
	Subtract 18%: n * (1-18)
	
	Peter Kahrel
*/


(function(){
	
	//--------------------------------------------------------------
	// File handling
	
	function scriptPath(){
		try {
			return app.activeScript;
		}
		catch (e) {
			return File (e.fileName);
		}
	}

	function saveData(obj) {
		var f = File (scriptPath().fullName.replace(/\.jsx$/,'.txt'));
		f.open('w');
		f.write(obj.toSource());
		f.close();
	}

	function getPrevious() {
		var f = File (scriptPath().fullName.replace(/\.jsx$/,'.txt'));
		var obj = {};
		if (f.exists){
			f.open('r');
			var temp = f.read();
			f.close();
			obj = eval(temp);
		}
		return obj;
	}

	//-----------------------------------------------------------
	// Some values for the interface

	function getSwatches() {
		var colours = [];
		var temp = app.documents[0].swatches.everyItem().name;
		for (var i = temp.length-1; i >= 0; i--) {
			if (!/^(Registration|Paper|None|Black)$/.test(temp[i])) {
				colours.push (temp[i]);
			}
		}
		colours.unshift ('[Ignore]');
		return colours;
	}


	function getTargets () {
		var t = {list: ['Document'], index: 0};
		if (app.selection.length > 0) {
			if (app.selection[0] instanceof TextFrame) {
				t = {list: ['Document', 'Story'], index: 1};
			} else if (app.selection[0] instanceof InsertionPoint) {
				t = {list: ['Document', 'Story', 'To end of story'], index: 1};
			} else if (app.selection[0] instanceof Text) {
				t = {list: ['Document', 'Story', 'To end of story', 'Selection'], index: 3};
			} else {
				// We don't know what the selection is, so we simply give all targets
				// (just like InDesign does!)
				t = {list: ['Document', 'Story', 'To end of story', 'Selection'], index: 0};
			}
		}
		return t;
	}

	//-----------------------------------------------------------------
	// The interface
	
	function getData() {
		var cStyles = app.documents[0].characterStyles.everyItem().name;
		cStyles.unshift('[Any style]');
		var swatches = getSwatches();
		var targets = getTargets();
		var spaceNames = ['[None]', 'Fixed space', 'Third space', 'Quarter space', 'Sixth space', 'Thin space', 'Hair space'];
		var spaceCharacters = ['', '\u00A0', '\u2004', '\u2005', '\u2006', '\u2009', '\u200A'];
		
		var w = new Window ('dialog {text: "Price adjuster", alignChildren: "right", properties: {closeButton: false}}');

			w.panel = w.add('panel {alignChildren: "right"}');

				w.operationGroup = w.panel.add ('group')
					w.operationGroup.add ('statictext {text: "Operation:"}');
					w.operation = w.operationGroup.add ('dropdownlist', undefined, ['Multiply', 'Divide', 'Add', 'Subtract']);
					
				w.operatorGroup = w.panel.add ('group')
					w.operatorGroup.add ('statictext {text: "Operator:"}');
					w.operator = w.operatorGroup.add ('edittext {preferredSize: [81,-1]}');
			
				w.currencyGroup = w.panel.add ('group')
					w.currencyGroup.add ('statictext {text: "Currency symbol:"}');
					w.currency = w.currencyGroup.add ('dropdownlist', undefined, ['£', '€', '$', '¥', '¤', '₹', '[Any]', '[None]']);
					
				w.separatorGroup = w.panel.add ('group')
					w.separatorGroup.add ('statictext {text: "Separator:"}');
					w.separator = w.separatorGroup.add ('dropdownlist', undefined, spaceNames);

				w.formatGroup = w.panel.add ('group')
					w.formatGroup.add ('statictext {text: "Number format:"}');
					w.format = w.formatGroup.add ('dropdownlist', undefined, ['1,234.56', '1.234,56']);
					
				w.thousandsCheckGroup = w.panel.add ('group')
					w.thousandsCheckGroup.add ('statictext {text: "Insert thousands separator:"}');
					w.thousandsCheck = w.thousandsCheckGroup.add ('checkbox');
					
				w.decimalsGroup = w.panel.add ('group')
					w.decimalsGroup.add ('statictext {text: "Number of decimals:"}');
					w.decimals = w.decimalsGroup.add ('dropdownlist', undefined, ['0', '1', '2', '3', '4']);

				w.swatchApplyGroup = w.panel.add ('group')
					w.swatchApplyGroup.add ('statictext {text: "Apply colour:"}');
					w.swatchApply = w.swatchApplyGroup.add ('dropdownlist', undefined, swatches);
					
				w.targetGroup = w.panel.add ('group')
					w.targetGroup.add ('statictext {text: "Target:"}');
					w.target = w.targetGroup.add ('dropdownlist', undefined, targets.list);

				w.targetCstyleGroup = w.panel.add ('group')
					w.targetCstyleGroup.add ('statictext {text: "Target character style:"}');
					w.cStyle = w.targetCstyleGroup.add ('dropdownlist', undefined, cStyles);


				w.buttons = w.add ('group');
					w.credits = w.buttons.add ('button {text: "Credits"}');
					w.buttons.add ('button {text: "Cancel"}');
					w.buttons.add ('button {text: "OK"}');

				for (var i = w.panel.children.length-1; i >= 0; i--) {
					if (w.panel.children[i].children.length > 1){
						w.panel.children[i].children[1].preferredSize.width = 128;
					}
				}
			
				w.credits.onClick = function () {
					alert ('This script is a combination of Olav Kvern\'s "PriceUpdateByString" script and Steve Wareham\'s "number_adjuster", and adds some functionality. Olav gave permission to use his code; Steve could not be found, his web site appears to have gone permanently off-line.', 'Price adjuster credits');
				}

				var previous = getPrevious();
				previous.location ? w.location = previous.location : w.center();
				w.operation.selection = previous.operation || 0;
				w.operator.text = previous.operator || '3';
				w.currency.selection = previous.currency || 0;
				w.format.selection = previous.format || 0;
				w.separator.selection = previous.separator || 0;
				w.thousandsCheck.value = previous.thousandsCheck || true;
				w.decimals.selection = previous.decimals || 0;
				w.swatchApply.selection = previous.swatchApply || 0;
				w.target.selection = targets.index;
				w.cStyle.selection = previous.cStyle || 0;

		if (w.show() == 1) {
			var obj = {
				location: [w.location[0], w.location[1]],
				operation: w.operation.selection.index,
				operator: w.operator.text,
				currency: w.currency.selection.index,
				format: w.format.selection.index,
				separator: w.separator.selection.index,
				thousandsCheck: w.thousandsCheck.value,
				decimals: w.decimals.selection.index,
				swatchApply: w.swatchApply.selection.index,
				cStyle: w.cStyle.selection.index
			}
			saveData(obj);
			return {
				operation: w.operation.selection.text,
				operator: w.operator.text,
				currency: w.currency.selection.text,
				format: w.format.selection.text,
				separator: spaceCharacters[w.separator.selection.index],
				thousandsCheck: w.thousandsCheck.value,
				decimals: w.decimals.selection.text,
				swatchApply: w.swatchApply.selection.text,
				target: w.target.selection.text,
				cStyle: w.cStyle.selection.text
			}
		}
		exit();
	} // getData

	//------------------------------------------------------------------

	var calculate = {
		Multiply: function (x, y) {
			return x*y;
		},
		Divide: function (x, y) {
			return x/y;
		},
		Add: function (x, y) {
			return Number(x)+Number(y);
		},
		Subtract: function (x, y) {
			return x-y;
		}
	}

	//------------------------------------------------------------------
	// We can have any kind of currency symbol, including none
	
	function getCurrencySymbol (str) {
		var c = str.match (/^[£€$¥₹¤]/);
		return c === null ? '' : c[0];
	}
	
	//------------------------------------------------------------------
	// Do the arithmetic
	
	function adjustNumber (found, data) {
		var n = found.contents;
		var currency = getCurrencySymbol (n);
		n = n.replace (/^[£€$¥₹¤]\s?/,'')
		n = n.replace (data.thousandsRE, '');  // Delete any thousand separators
		
		if (data.decimalCharacter === ',') {
			n = n.replace (',', '.');
		}
	
		var result = calculate[data.operation] (n, data.operator);
		if (data.decimals > 0) {
			result = Number(result).toFixed(data.decimals);
		} else {
			result = String(Math.ceil(result));
		}

		var parts = result.split('.');
		if (data.thousandsCheck) {
			parts[0] = parts[0].replace(/(\d)(?=(\d\d\d)+$)/g, '$1'+data.thousandsSeparator);
		}
		return currency + data.separator + parts.join(data.decimalCharacter);
	}

	//----------------------------------------------------------------
	// Construct a GREP string for the currency. '[Any]' means all currencies.
	
	function getCurrency (c) {
		if (c === '[Any]') {
			return '[£€$¥₹¤]\\s?';
		} else if (c ==='[None]') {
			return '';
		} else {
			return '[' + c + ']\\s?';
		}
	}

	//------------------------------------------------------------------
	// Set the thousands and decimal separators and the regular expressions
	
	function setSeparators (data) {
		if (data.format === '1,234.56') {
			data.thousandsSeparator = ',';
			data.thousandsRE = /[\u2009,]/g;
			data.decimalCharacter = '.';
		} else {
			data.thousandsSeparator = '.';
			data.thousandsRE = /[\u2009\.]/g;
			data.decimalCharacter = ',';
		}
	}

	//------------------------------------------------------------------
	
	function setTarget (data) {
		if (app.selection.length === 0) {
			data.target = app.documents[0];
		} else {
			switch (data.target) {
				case 'Document': data.target = app.documents[0]; break;
				case 'Story': data.target = app.selection[0].parentStory; break;
				case 'Selection': data.target = app.selection[0]; break;
				case 'To end of story': data.target = app.selection[0].parentStory.insertionPoints.itemByRange(app.selection[0], app.selection[0].parentStory.insertionPoints[-1]).getElements()[0];
			}
		}
	}

	//------------------------------------------------------------------
	// Find all numbers and apply the change

	function applyData (data) {
		setTarget (data);
		setSeparators (data);
		data.operator = data.operator.replace (',', '.');
		app.findGrepPreferences = app.changeGrepPreferences = null;
		app.findGrepPreferences.findWhat = getCurrency(data.currency)+'\\d[\\x{2009}\\d.,]*';
		
		if (data.cStyle === '[None]') {
			app.findGrepPreferences.appliedCharacterStyle = app.documents[0].characterStyles[0];
		} else if (data.cStyle !== '[Any style]') {
			app.findGrepPreferences.appliedCharacterStyle = data.cStyle;
		}

		var found = data.target.findGrep();
		for (var i = found.length-1; i >= 0; i--) {
			if (data.swatchApply !== '[Ignore]') {
				found[i].fillColor = app.documents[0].swatches.item(data.swatchApply);
			}
			found[i].contents = adjustNumber (found[i], data);
		}
	}

	//------------------------------------------------------------------
	var data = getData();
	applyData(data);

}());
