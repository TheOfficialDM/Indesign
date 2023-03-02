// DESCRIPTION: Export book files individually
// Peter Kahrel

export_to_pdf();

//============================================================

function export_to_pdf () {
	var pdfExportType = 'pdfExportPreferences';
	var pdf_export_settings = app.pdfExportPreferences.properties;
	var book = app.books.item (get_book());
	var data = select_items (book);
	chapters_to_pdf (data);
	app.pdfExportPreferences.properties = pdf_export_settings;
	

		function chapters_to_pdf (data) {
			var f, j, s, doc, base, from, to, e, outpath;
			var autoPagination = book.automaticPagination;
			
			function pad (n) {
				return ('000' + n).slice(-3);
			}

//~ 			function exportByPrefix () {
//~ 				var base = outpath.replace (/\.indd$/, '');
//~ 				var prefixes = doc.sections.everyItem().sectionPrefix;
//~ 				for (var i = 0; i < prefixes.length; i++) {
//~ 					f = File (base + '_' + prefixes[i] + '.pdf');
//~ 					app.pdfExportPreferences.pageRange = prefixes[i];
//~ 					doc.exportFile (ExportFormat.PDF_TYPE, f, false, data.preset);
//~ 				}
//~ 			}

			function exportByIdentifier (markerOrPrefix) {
				var base = outpath.replace (/\.indd$/, '');
				var sections = doc.sections.everyItem().getElements();
				var pages = doc.pages.everyItem().getElements();
				var first, last, marker;
				for (var i = 0; i < sections.length; i++) {
					first = sections[i].pageStart.documentOffset;
					last = first + sections[i].length-1;
					marker = markerOrPrefix ? sections[i][markerOrPrefix] : '';
					if (!markerOrPrefix) {
						marker += '_' + pages[first].name + '-' + pages[last].name;
					}
					f = File (base + '_' + marker + '.pdf');
					
					app[pdfExportType].pageRange = '+'+(first+1) + '-' + '+'+(last+1);
					if (pdfExportType === 'pdfExportPreferences') {
						app.documents[0].exportFile (ExportFormat.PDF_TYPE, f, false, data.preset);
					} else {
						app.documents[0].exportFile (ExportFormat.INTERACTIVE_PDF, f, false);
					}
				}
			}
		
			if (data.startAtPage1) {
				if (book.automaticPagination) {
					book.automaticPagination = false;
				}
			}

			for (var i = 0; i < data.chapters.length; i++) {
				try {
					doc = app.open (data.chapters[i], false);
					if (data.outfolder.length === 0) {
						outpath = String(doc.fullName);
					} else {
						outpath = data.outfolder + '/' + doc.name;
					}
					
					switch (data.export_type) {
						case 'documents': {
							f = File (outpath.replace (/\.indd$/, '.pdf'));
							app[pdfExportType].pageRange = PageRange.ALL_PAGES;
							if (data.startAtPage1) {
								doc.sections[0].properties = {
									continueNumbering: false,
									pageNumberStart: 1
								}
							}
							if (pdfExportType === 'pdfExportPreferences') {
								doc.exportFile (ExportFormat.PDF_TYPE, f, false, data.preset);
							} else {
								doc.exportFile (ExportFormat.INTERACTIVE_PDF, f, false);
							}
							doc.close (SaveOptions.NO);
							break;
						}

						case 'sections': {
							if (pdfExportType === 'pdfExportPreferences') {
								app.pdfExportPreferences.pageRange = PageRange.SELECTED_ITEMS;
							}
							if (data.prefixes) {
								exportByIdentifier ('sectionPrefix');
							} else if (data.markers) {
								exportByIdentifier ('marker');
							} else {
								exportByIdentifier ('');
							}
							doc.close (SaveOptions.NO);
							break;
						}
					
						case 'pages': {
							if (pdfExportType === 'pdfExportPreferences') {
								app.pdfExportPreferences.pageRange = PageRange.SELECTED_ITEMS;
							}
							base = outpath.replace (/\.indd$/, '');
							for (j = 0; j < doc.pages.length; j++) {
								app[pdfExportType].pageRange = '+' + (j+1);
								f = File (base + '_' + pad (doc.pages[j].name) + '.pdf');
								if (pdfExportType === 'pdfExportPreferences') {
									doc.exportFile (ExportFormat.PDF_TYPE, f, false, data.preset);
								} else {
									doc.exportFile (ExportFormat.INTERACTIVE_PDF, f, false, data.preset);
								}
							}
							doc.close (SaveOptions.NO); 
							break;
						}
					
					} // switch
				} catch (_) {
					app[pdfExportType].pageRange = PageRange.ALL_PAGES;
					// We open documents without showing them
					for (var i = app.documents.length-1; i > -1; i--) {
						if (app.documents[i].visible == false) {
							app.documents[i].close (SaveOptions.NO);
						}
					}
				}
			} // for i
		
			if (data.startAtPage1) {
				if (book.automaticPagination !== autoPagination) {
					book.automaticPagination = autoPagination;
				}
			}

		} // chapters_to_pdf


		function unique_name (base) {
			function strip_base (s) {
				return s.replace(/_\d+$/,'');
			}
			var n = 0;
			while (File (base + '.pdf').exists) {
				base = strip_base(base) + '_' + String (++n);
			}
			return base;
		}


		function first_page (doc)  {
			return String (doc.pages[0].name);
		}

		function create_list (f) {
			var arr = [];
			for (var i = 0; i < f.length; i++) {
				arr.push (decodeURI (f[i].name));
			}
			return arr
		}


		function select_items (book) {
			var arr = [];
			var book_contents = book.bookContents.everyItem().fullName;
			for (var i = 0; i < book_contents.length; i++) {
				arr[i] = File (book_contents[i]).name;
			}
			var presets = app.pdfExportPresets.everyItem().name;
			var w = new Window ('dialog', book.name + ': export chapters to PDF', undefined, {closeButton: false});
				//w.maximumSize.height = $.screens[0].bottom - 200;
				w.alignChildren = ['left', 'top'];
				w.orientation = 'row';
			
				var g1 = w.add ('group {alignChildren: "fill", orientation: "column"}');
					var list = g1.add ('listbox', undefined, arr, {multiselect: true});
					list.maximumSize.height = w.maximumSize.height-600;
				
				var exportType = g1.add ('panel {orientation: "row"}');
					var exportPrint = exportType.add ('radiobutton {text: "Print PDF", value: true}');
					var exportInteractive = exportType.add ('radiobutton {text: "Interactive PDF"}');

				var p1 = g1.add('panel {text: "Export documents", alignChildren: "left"}');
					var whole_docs = p1.add('radiobutton', undefined, 'As whole documents');
					var page_by_page = p1.add ('radiobutton', undefined, 'Individual pages');
					var sections = p1.add('radiobutton', undefined, 'Export individual sections');
					var dummygroup = p1.add ('group {orientation: "column"}');
						dummygroup.margins.left = 25;
						var markers = dummygroup.add ('radiobutton', undefined, 'Use section markers in the file names');
						var prefixes = dummygroup.add ('radiobutton', undefined, 'Use section prefixes in the file names');

			var startAtPage1 = g1.add ('checkbox {text: "First folio in each document is 1"}');

			var folder_group = g1.add ('group');
				folder_group.add ('statictext {text: "Output folder:", characters: 10, justify: "right"}');
				var outfolder = folder_group.add ('edittext {characters: 15}');
					outfolder.text = get_path (book);
				var pick_button = folder_group.add ('iconbutton', undefined, folder_icon(), {style: 'toolbutton'});

			var presetPanel = g1.add ('group {orientation: "row"}');
				presetPanel.add ('statictext {text: "PDF preset:", characters: 10, justify: "right"}');
				var preset_list = presetPanel.add ('dropdownlist', undefined, presets);
				preset_list.selection = array_pos (book.extractLabel('pdf_preset'), presets);
				preset_list.preferredSize.width = 200;

			var view_pdf = g1.add ('checkbox', undefined, 'View PDF after exporting');
			
			var buttons = w.add ('group {orientation: "column", alignChildren: "fill"}');
				var select_all = buttons.add ('button', undefined, 'Select all');
				var deselect_all = buttons.add ('button', undefined, 'Deselect all');
				var invert = buttons.add ('button', undefined, 'Invert selection');
				var ok = buttons.add ('button', undefined, 'OK', {name: 'ok'});
				var cancel = buttons.add ('button', undefined, 'Cancel', {name:'cancel'});
				
			exportPrint.onClick = function () {
				presetPanel.enabled = true;
				pdfExportType = 'pdfExportPreferences';
			}
		
			exportInteractive.onClick = function () {
				presetPanel.enabled = false;
				pdfExportType = 'interactivePDFExportPreferences';
			}
			
			whole_docs.onClick = function () {
				markers.value = prefixes.value = false;
				startAtPage1.enabled = true;
			}
		
			page_by_page.onClick = function () {
				markers.value = prefixes.value = false;
				startAtPage1.value = false;
				startAtPage1.enabled = false;
			}
		
			sections.onClick = function () {
				startAtPage1.value = false;
				startAtPage1.enabled = false;
			}

			markers.onClick = prefixes.onClick = function (){
				sections.value = true;
				startAtPage1.value = false;
				startAtPage1.enabled = false;
			}
			
			select_all.onClick = function () {
				var all_items = [];
				var L = list.items.length;
				for (var i = 0; i < L; i++) {
					all_items[i] = list.items[i];
				}
				list.selection = all_items;
			}
			
			// select all items on start-up
			select_all.notify();
			whole_docs.value = true;

			invert.onClick = function () {
				var selected_items = [];
				var L = list.items.length;
				for (var i = 0; i < L; i++) {
					if (list.items[i].selected == false) {
						selected_items.push (list.items[i]);
					}
				}
				list.selection = null;
				list.selection = selected_items;
			}
			
			deselect_all.onClick = function () {
				list.selection = null;
			}
			
			pick_button.onClick = function () {
				var f = Folder (outfolder.text).selectDlg ('Choose a folder')
				if (f != null)
					outfolder.text = f.fullName + '/';
			}


			outfolder.onDeactivate = function () {
				if (outfolder.text !== '' && !Folder (outfolder.text).exists) {
					outfolder.text = folder.text += ' does not exist';
					w.layout.layout();
					outfolder.active = true;
				} else {
					if (outfolder.text !== '' && outfolder.text.slice(-1) !== '/') {
						outfolder.text += '/';
					}
				}
			}
			

			if (w.show () == 1) {
				book.insertLabel ('output_folder', outfolder.text);
				book.insertLabel ('pdf_preset', preset_list.selection.text);
				var selected_docs = get_selected (list, book_contents);
				var selected_preset = preset_list.selection.text;
				w.close ();
				app[pdfExportType].viewPDF = view_pdf.value;

				var export_type;
				if (whole_docs.value) {
					export_type = 'documents';
				} else if (sections.value) {
					export_type = 'sections';
				} else {
					export_type = 'pages';
				}
				
				return {
					chapters: selected_docs,
						outfolder: outfolder.text,
						preset: selected_preset,
						export_type: export_type,
						markers: markers.value,
						prefixes: prefixes.value,
						startAtPage1: startAtPage1.value,
					}
			} else {
				w.close ();
				exit();
			}
		} // select_items


		function get_path (book) {
			var path = book.extractLabel ('output_folder');
			if (path == '') {
				path = book.fullName.path;
			}
			return path
		}
			
			
			
		function get_selected (selected_list, booklist) {
			var arr = [];
			for (var i = 0; i < selected_list.items.length; i++) {
				if (selected_list.items[i].selected) {
					arr.push (booklist[selected_list.items[i].index]);
				}
			}
			return arr;
		}


		function array_pos (item, arr) {
			for (var i = 0; i < arr.length; i++) {
				if (item == arr[i]) {
					return i;
				}
			}
			return 0;
		}


//~ 		function script_dir()
//~ 			{
//~ 			try {return File (app.activeScript).path + '/'}
//~ 			catch (e) {return File (e.fileName).path + '/'}
//~ 			}


		function errorM (m) {
			alert (m, 'Error', true);
			exit();
		}


		function get_book () {
			switch (app.books.length) {
				case 0: alert ('Please open a book.'); exit ();
				case 1: return app.books[0].name;
				default: return pick_book ();
			}
		}


		function pick_book () {
			var w = new Window ('dialog', 'Select a book');
			w.alignChildren = 'right';
			var g = w.add ('group');
				var list = g.add ('listbox', undefined, app.books.everyItem().name);
				list.minimumSize.width = 250;
				list.selection = 0;
			var b = w.add ('group');
				b.add ('button', undefined, 'OK', {name: 'ok'})
				b.add ('button', undefined, 'Cancel', {name: 'cancel'})
			if (w.show () == 1) {
				return list.selection.text;
			}
			exit ();
		}
	
				
		function folder_icon () {
			return "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x16\x00\x00\x00\x12\b\x06\x00\x00\x00_%.-\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008E|\u00FBQ\u0093\x00\x00\x00 cHRM\x00\x00z%\x00\x00\u0080\u0083\x00\x00\u00F9\u00FF\x00\x00\u0080\u00E9\x00\x00u0\x00\x00\u00EA`\x00\x00:\u0098\x00\x00\x17o\u0092_\u00C5F\x00\x00\x02\u00DEIDATx\u00DAb\u00FC\u00FF\u00FF?\x03-\x00@\x0011\u00D0\b\x00\x04\x10\u00CD\f\x06\b \x16\x18CFR\x12L\u00CF*\u0092e\u00FE\u00F7\u009F!\u008C\u0097\u008By\x19\u0088\u00FF\u00F7\u00EF\x7F\u0086\u00CF\u00DF\u00FE\u00C6dOz\u00B2\x1C\u00C8\u00FD\x0F\u00C5\x04\x01@\x00\u00A1\u00B8\x18f(##C\u00AD\u009Ak9\u0083\u008E_\x17\u0083i\u00D4<\x06\x16f\u00C6\u009A\t\u00D9\u00D21@%\u00CC@\u00CCH\u008C\u00C1\x00\x01\u00C4\b\u008B<\u0090\u008Bg\x14\u00CAF212,\u00D3q\u00CDb\u00E0\x16Rf`\u00E3\x14f`\u00E5\x14d\u00F8\u00FF\u00E7'\u00C3\u00FE\u00D9a\x18\u009A\u00FF\u00FE\u00FB\u009Fq\u00F3\u00F1\u00CF%\x13\u00D6\u00BE\u00FE\u0086\u00EE\x13\u0080\x00bA\u00B6\x04d\u00A8\u00A1_\x15\u00D8@\u0098\u00A1\u00AC\u00EC\u00FC\f\u00CC<\\\f^\u00A5\u00A7P\f\u00FD\u00F6\u00EE.\u00C3\u00DD\x03\x1D3\u00BE\u00FF<\u00FF\f\u00C8\u00DD\x01\u00C4\x7F\u0090\r\x07\b \x14\u0083A\x04\u00CCP6\x0E!\u0086\u00A3s\x03\x18XY\x19\x19\u00FE\x01\u00C3\x07\x14\u00D6\x7F\u00A1\u00F4\u009F\u00BF\f`\fb\x03}\u00BC\u00A9+U\u0092\u00E1\u00F9\u009B\u00BF\u00BA\u00FD\u00EB_]\u0083\u00C5\x03@\x00\u00B1\u00A0\u00877\u00CC\u00A5\u00F7\x0F\u00F72\u00C8\x1B\x052p\n(\u0080\u00A5\u00FE\u00FD\u00F9\u00C5\u00F0\u00F7\u00F7o\u0086?\u00BF\x7F1\u00FC\u00F9\x05\u00A1\u00FF\u00FE\u00F9\r\u00C6\u009F\u009E_\x00\u00C6\u00C3\u00FDI@\u0085^@\u00FC\x1B\x14J\x00\x01\u00C4\u0084\u00EEb\u0090\u00A1\u00BF>\u00BFd\u00F8\u00FC\u00EA:\x03\u00A7\u00A0\"\u00C3\u00BF\u00BF\u00BF\x19\u00FE\u00FF\u00FD\x034\u00F8\x0F\u00D8\u0090\x7F\u00BFAl \u00FD\u00EF/P\u00EE\x0FX\u00FE\u00C0\u00B1+\f\u008F^\u00FD<\b\u00D4\u00CE\x01\u008B`\u0080\x00\u00C2\b\n\x0E\x1EI\u0086\u009B\u00DB\u00CA\x19\u0084\u0094\u00EC\u0081\u0081\u00CE\u00CA\u00C0\u00C4\x04\u00F4\u00FE\u00AF_`\u0083A\u0086\u0082]\u00F9\x17j8\u0090\u00FE\u00F1\u00E9)\u00C3\u00D6\x13/\x19\u00EE\u00BFa\u00D8\u00C2\u00CE\u00C6\u00CE\n5\u00F8\x0F@\x00ad\u0090W7\u00B60\u00FC\u00FB\u00FF\u0087\u0081KX\x05\u00E8\u00D2\u00DF`\x03\u00FE\u0082]\x0Bq\u00DD\u00BF\u00BF0\u0097\u00FE\x05\u0086\u00EF_\u0086\u00C3G\u008E1\u00DCy\u00FE}9\u00D0\u00D0O\u00C8I\x11 \u00800\f~xr\x06\u0083\u00A0\u00825\u00C3\u00FF\x7FPW\x01\r\x04Y\x00q\u00E9_ \u0086\x1A\x0E\u0094\u00FF\t\f\u00B2\u0095\u00FB\u009F20\u00B3p\u00CC\u0082\u00A6\n\x10\u00FE\x07\u008A<\u0080\x00\u00C20\u0098\u009DO\u0082\u0081\u009DG\x02\x12\u00AE@\u00CD \u0083\u00C0^\x07bP\u00E4\u00FD\u0083\x1A\u00FE\x1F\u00E8\u00ABS'\u008F2\u00DC{\u00FE}\x1D;;\u00C7\x0B\u00A0\u00D6\u009F@\u00FC\x0B\x14q \u0083\x01\x02\u0088\x05\u00C5P6&\u0086\u00F6i\u00DB\x18^\u00BE[\x0FNJ\u00BF\u00FF\u00FCc\x00&\x00\u0086\u00DF\u00BF!l`\x10\x03\u0093\u00D9\x7F0\u00FE\x0B\u00CCX\u00DF\x7F\u00FEe`e\u00E3\u009C\t5\u00F0'\u0092\u008B\x19\x00\x02\b9\u00E7\u0081\x02\u009E\x0B\u0088\u00F9\u00A14+\x119\u00F7\x1F\u00D4\u00D0/P\u00FC\x1Dj8\x03@\x00!\u00BB\u00F8?T\u00F0'\u0096\u00CCC\u00C8\u00E0\u00EFP\u00FA\x1FL\x02 \u0080X\u00D0\x14\u00FD\u0086\u00DA\u00FC\u0083\u00C8\"\x15\u00E6\u0098\u00DF\u00C8\u00C1\x00\x02\x00\x01\x06\x000\u00B2{\u009A\u00B3\x1C#o\x00\x00\x00\x00IEND\u00AEB`\u0082";
		}
	}