// Update a document's text variables
// Peter Kahrel

(function () {

	function get_variables () {
		var arr = [];
		var v = app.activeDocument.textVariables;
		for (var i = 0; i < v.length; i++) {
			if (v[i].variableType == VariableTypes.customTextType) {
				arr.push ({label: v[i].name, content: v[i].variableOptions.contents});
			}
		}
		return arr;
	}

	function findTitle (vars) {
		for (var i = vars.length-1; i >= 0; i--) {
			if (vars[i].label.toUpperCase().indexOf('TITLE') > -1) {
				return vars[i].content;
			}
		}
		return null;
	}

	function update_variables (variables) {

		var w = new Window('dialog {properties: {closeButton: false}}');
			w.text = findTitle (variables) || 'Update text variables';
		
			var viewPort = w.add ('panel {alignChildren: "left"}');
				viewPort.maximumSize.height = 485;  // Optimised for CC

			var scrollGroup = viewPort.add ('group {orientation: "column", alignChildren: "right"}');
			scrollGroup.margins.right = 20; // Make space for the scrollbar
			scrollGroup.margins.top = 10;
			scrollGroup.spacing = 0;

			var scrollBar = viewPort.add ('scrollbar {stepdelta: 20}');

			var buttons = w.add ('group {alignment: "right"}');
				buttons.add ('button', undefined, 'OK', {name: 'ok'});
				buttons.add ('button', undefined, 'Cancel', {name: 'cancel'});
				
			for (var i = 0; i < variables.length; i++) {
				with (scrollGroup.add ('group')) {
					add ('statictext', undefined, variables[i].label);
					add ('edittext {text: "' + variables[i].content + '", characters: 30}');
				}
			}

			scrollBar.onChanging = function () {
//~ 				scrollGroup.location.y = (-1 * this.value)*2;
				scrollGroup.location.y = -1 * this.value;
			}

			w.onShow = function () {
				if (parseInt (app.version) < 9) {
					scrollGroup.size.width -= 10;
				}
				scrollBar.size.width = parseInt (app.version) < 9 ? 20 : 15;
				scrollBar.size.height = viewPort.size.height-20;
				scrollBar.location = [viewPort.size.width-30, 10];
				scrollBar.maxvalue = scrollGroup.size.height - viewPort.size.height + 15;
				// The following quirk is needed because without it the panel's content
				// is placed too low when the window is drawn.
				scrollGroup.location.y = -1 * this.value;
			};

			if (w.show() == 1) {
				var kids = scrollGroup.children;
				for (var i = 0; i < kids.length; i++) {
					app.activeDocument.textVariables.item(kids[i].children[0].text).variableOptions.contents = kids[i].children[1].text;
				}
			}
	}

	update_variables (get_variables());

}());


//~ for (i = 1; i < 101; i++) {
//~ 	app.documents[0].textVariables.add ({
//~ 		name: 'Var ' + i,
//~ 		variableType: VariableTypes.customTextType,
//~ 		variableOptions: {contents: 'variable ' + i}
//~ 	});
//~ }