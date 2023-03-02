#targetengine grep_editor;

(function () {
		
	function script_dir(){
		try {
			return app.activeScript.path;
		}
		catch (e) {
			return File (e.fileName).path;
		}
	}


	function get_previous () {
		var temp = null;
		var f = File (script_dir()+'/grep_class_inserter.txt');
		if (f.exists) {
			f.open('r');
			temp = eval(f.read());
			f.close();
		}
		return temp;
	}


	function saveSettings (o) {
		var f = File (script_dir()+'/grep_class_inserter.txt');
		f.open('w'); 
		f.write (o.toSource()); 
		f.close();
	}


	var lookupTable = {
		'\\1': 'Back-reference (up to \\9)',
		'\\A': 'Beginning of story',
		'\\b': 'Word boundary',
		'\\d': 'Digit',
		'\\D': 'Non-digit',
		'\\G': 'Continue at the end of the previous match',
		'\\h': 'Horizontal space (including tabs)',
		'\\H': 'Not horizontal space',
		'\\l': 'Lower-case letter',
		'\\K': 'Lookbehind',
		'\\L': 'Non-lowercase letter',
		'\\n': 'Forced line break',
		'\\N{. . .}': 'Unicode name',
		'\\N': 'Unicode name',
		'\\P{. . .}': 'Negated unicode class',
		'\\P': 'Negated unicode class',
		'\\p': 'Unicode class',
		'\\p{. . .}': 'Unicode class',
		'\\r': 'End of paragraph (matches frame and page breaks too)',
		'\\S': 'Non-whitespace character',
		'\\s': 'Whitespace character (including tabs and paragraph/page breaks)',
		'\\t': 'Tab character',
		'\\U': 'Non-uppercase letter',
		'\\u': 'Upper-case letter',
		'\\v': 'Vertical space',
		'\\V': 'Not vertical space',
		'\\W': 'Non-word character',
		'\\w': 'Word character',
		'\\x{. . .}': 'Two- or four-digit hexadecimal code',
		'\\z': 'End of story',
		'\\Z': 'End of story',
		'\\\\': 'Backslash character',
		'\\[': 'Open bracket character',
		'\\]': 'Close bracket character',
		'\\{': 'Open brace character',
		'\\}': 'Close brace character',
		'\\(': 'Open parenthesis character',
		'\\)': 'Close parenthesis character',
		'\\<': 'Beginning of word',
		'\\>': 'End of word',
		'~2': 'Copyright symbol',
		'~3': 'Third space',
		'~4': 'Quarter space',
		'~6': 'Section symbol',
		'~7': 'Paragraph symbol',
		'~8': 'Bullet character',
		'~a': 'Anchored-object marker',
		'~b': 'Carriage return (=\r)',
		'~c': 'Contents of clipboard (formatted) (Change to only)',
		'~C': 'Contents of clipboard (unformatted) (Change to only)',
		'~d': 'Trademark symbol',
		'~D': 'Variable: output date',
		'~e': 'Ellipsis',
		'~E': 'Even-page break',
		'~f': 'Flush space',
		'~F': 'Footnote marker',
		'~h': 'End nested style here',
		'~H': 'Variable: chapter number',
		'~i': 'Indent to here',
		'~I': 'Index marker',
		'~j': 'Non-joiner',
		'~J': 'Variable: metadata caption',
		'~k': 'Discretionary line break',
		'~L': 'Odd-page break',
		'~l': 'Variable: file name',
		'~M': 'Column break',
		'~m': 'Em-space',
		'~N': 'Current page number',
		'~O': 'Variable: creation date',
		'~o': 'Variable: modifiation date',
		'~P': 'Page break',
		'~R': 'Frame break',
		'~r': 'Registered symbol',
		'~S': 'Non-breaking (variable width)',
		'~s': 'Non-breaking (fixed space)',
		'~T': 'Variable: last page number',
		'~u': 'Variable: custom text',
		'~v': 'Any variable',
		'~V': 'Previous page number',
		'~X': 'Next page number',
		'~x': 'Section marker',
		'~y': 'Right-indent tab',
		'~Y': 'Variable: running header (paragraph style)',
		'~Z': 'Variable: running header (character style)',
		'~#': 'Any page number',
		'~”': 'Straight double quotation mark',
		'~’': 'Straight single quotation mark',
		'~-': 'Discretionary hyphen',
		'~~': 'Non-breaking hyphen',
		'~.': 'Punctuation space',
		'~/': 'Figure space',
		'~%': 'Sixth space',
		'~|': 'Hair space',
		'~[': 'Straight left quotation mark',
		'~]': 'Straight right quotation mark',
		'~{': 'Double left quotation mark',
		'~}': 'Double right quotation mark',
		'~<': 'Thin space',
		'~>': 'En-space',
		'~_': 'Em-dash',
		'~=': 'En-dash'
	}


	var grepCodes = {
		'Beginning of word': {_short: '\\<', _long: '\\<    (?# beginning of word)\r'},
		'End of word': {_short: '\\>', _long: '\\>    (?# end of word)\r'},
		'Word boundary': {_short: '\\b', _long: '\\b'},
		'Beginning of paragraph': {_short: '^', _long: '^'},
		'End of paragraph': {_short: '$', _long: '$'},
		'Beginning of story': {_short: '\\A', _long: '\\A'},
		'End of story': {_short: '\\z', _long: '\\z'},
		
		'Word character': {_short: '\\w', _long: '\\w'},
		'Lower-case letter': {_short: '\\l', _long: '\\l'},
		'Upper-case letter': {_short: '\\u', _long: '\\u'},
		'Digit': {_short: '\\d', _long: '\\d'},
		'White space': {_short: '\\s', _long: '\\s'},
		'Horizontal space': {_short: '\\h', _long: '\\h'},
		'Vertical space': {_short: '\\v', _long: '\\v'},
		'All breaks': {_short: '\\R', _long: '\\R'},
		'Paragraph break': {_short: '\\r', _long: '\\r'},
		'Forced line break': {_short: '\\n', _long: '\\n'},
		'Floating accents': {_short: '\\X', _long: '\\X'},

		'Case-insensitive on': {_short: '(?i)', _long: '(?i)    (?# case-insensitive on)\r'},
		'Case-insensitive off': {_short: '(?-i)', _long: '(?-i)    (?# case-insensitive off)\r'},
		'Multiline on': {_short: '(?m)', _long: '(?m)    (?# multi-line on)\r'},
		'Multiline off': {_short: '(?-m)', _long: '(?-m)    (?# multi-line on)\r'},
		'Single-line on': {_short: '(?s)', _long: '(?s)    (?# single line on)\r'},
		'Single-line off': {_short: '(?-s)', _long: '(?-s)         (?# single line off)\r'},
		'Free spacing': {_short: '(?x)', _long: '(?x    (?# free spacing on)\r\r)         (?# free spacing off)\r'},
		'Comment': {_short: '(?#)', _long: '(?#)    (?# comment on)\r'},
		'Literal span': {_short: '\\Q\r\r\\E', _long: '\\Q    (?# literal span on)\r\r\\E    (?# literal span off)\r'},

		'alnum': {_short: '[[:alnum:]]', _long: '[[:alnum:]]'},
		'alpha': {_short: '[[:alpha:]]', _long: '[[:alpha:]]'},
		'blank': {_short: '[[:blank:]]', _long: '[[:blank:]]'},
		'digit': {_short: '[[:digit:]]', _long: '[[:digit:]]'},
		'graph': {_short: '[[:graph:]]', _long: '[[:graph:]]'},
		'lower': {_short: '[[:lower:]]', _long: '[[:lower:]]'},
		'print': {_short: '[[:print:]]', _long: '[[:print:]]'},
		'punct': {_short: '[[:punct:]]', _long: '[[:punct:]]'},
		'space': {_short: '[[:space:]]', _long: '[[:space:]]'},
		'upper': {_short: '[[:upper:]]', _long: '[[:upper:]]'},
		'word': {_short: '[[:word:]]', _long: '[[:word:]]'},
		'xdigit': {_short: '[[:xdigit:]]', _long: '[[:xdigit:]]'},
		'character equivalent [[=a=]]': {_short: '[[==]]', _long: '[[=a=]]'},

		'Letter': {_short: '\\p{L*}', _long: '\\p{Letter}'},
			'Lowercase letter': {_short: '\\p{Ll}', _long: '\\p{Lowercase_letter}'},
			'Uppercase letter': {_short: '\\p{Lu}', _long: '\\p{Uppercase_letter}'},
			'Titlecase letter': {_short: '\\p{Lt}', _long: '\\p{Titlecase_letter}'},
			'Modifier letter': {_short: '\\p{Lm}', _long: '\\p{Modifier_letter}'},
			'Other letter': {_short: '\\p{Lo}', _long: '\\p{Letter_other}'},
		'Mark': {_short: '\\p{M*}', _long: '\\p{Mark}'},
			'Non-spacing mark': {_short: '\\p{Mn}', _long: '\\p{Non_spacing_mark}'},
			'Spacing combining mark': {_short: '\\p{Mc}', _long: '\\p{Spacing_combining_mark}'},
			'Enclosing mark': {_short: '\\p{Me}', _long: '\\p{Enclosing_mark}'},
		'Separator': {_short: '\\p{Z*}', _long: '\\p{Separator}'},
			'Space separator': {_short: '\\p{Zs}', _long: '\\p{Space_separator}'},
			'Line separator': {_short: '\\p{Zl}', _long: '\\p{Line_separator}'},
			'Paragraph separator': {_short: '\\p{Zp}', _long: '\\p{Paragraph_separator}'},
		'Symbol': {_short: '\\p{S*}', _long: '\\p{Symbol}'},
			'Math symbol': {_short: '\\p{Sm}', _long: '\\p{Math_symbol}'},
			'Currency symbol': {_short: '\\p{Sc}', _long: '\\p{Currency_symbol}'},
			'Modifier symbol': {_short: '\\p{Sk}', _long: '\\p{Modifier_symbol}'},
			'Other symbol': {_short: '\\p{So}', _long: '\\p{Other_symbol}'},
		'Number': {_short: '\\p{N*}', _long: '\\p{Number}'},
			'Decimal digit number': {_short: '\\p{Nd}', _long: '\\p{Decimal_digit_number}'},
			'Letter number': {_short: '\\p{Nl}', _long: '\\p{Letter_number}'},
			'Other number': {_short: '\\p{No}', _long: '\\p{Other_number}'},
		'Punctuation': {_short: '\\p{P*}', _long: '\\p{Punctuation}'},
			'Dash punctuation': {_short: '\\p{Pd}', _long: '\\p{Dash_punctuation}'},
			'Open punctuation': {_short: '\\p{Ps}', _long: '\\p{Open_punctuation}'},
			'Close punctuation': {_short: '\\p{Pe}', _long: '\\p{Close_punctuation}'},
			'Initial punctuation': {_short: '\\p{Pi}', _long: '\\p{Initial_punctuation}'},
			'Final punctuation': {_short: '\\p{Pf}', _long: '\\p{Final_punctuation}'},
			'Connector punctuation': {_short: '\\p{Pc}', _long: '\\p{Connector_punctuation}'},
			'Other punctuation': {_short: '\\p{Po}', _long: '\\p{Other_punctuation}'},

		'Zero or one time': {_short: '?', _long: '?'},
		'Zero or more times': {_short: '*', _long: '*'},
		'One or more times': {_short: '+', _long: '+'},
		'Zero or one time (shortest match)': {_short: '??', _long: '??'},
		'Zero or more times (shortest match)': {_short: '*?', _long: '*?'},
		'One or more times (shortest match)': {_short: '+?', _long: '+?'},
		
		'Positive lookbehind': {_short: '(?<=)', _long: '(?<= (?# begin positive lookbehind))  (?# end positive lookbehind)'},
		'Positive lookbehind 1': {_short: '(?<=)', _long: '(?<=     (?# begin positive lookbehind) )         (?# end positive lookbehind)'},
		'Positive lookbehind 2': {_short: '\\K', _long: '\\K'},
		'Positive lookahead': {_short: '(?=)', _long: '(?=     (?# begin positive lookahead))         (?# end positive lookahead)'},
		'Negative lookbehind': {_short: '(?<!)', _long: '(?<!     (?# begin negative lookbehind))         (?# end negative lookbehind)'},
		'Negative lookahead': {_short: '(?!)', _long: '(?!     (?# begin negative lookahead))         (?# end negative lookahead)'},
		'Lookaround': {_short: '(?<=)(?=)', _long: '(?<=   (?# begin positive lookbehind))         (?# end positive lookbehind) (?=     (?# begin positive lookahead))         (?# end positive lookahead)'}
	}


	var explanation = {
			// Standard wildcards
			'Word character': 'Letters, digits, and the underscore character',
				'Lower-case letter': 'Any lower-case letter',
				'Upper-case letter': 'Any upper-case letter',
				'Digit': '0,1,2,3,4,5,6,7,8,9,0 (see also Unicode properties\\Number)',
				'White space': 'Spaces, tabs, paragraph marks',
				'Horizontal space': 'All spaces, and tabs. Does not match right-indent tabs and forced line breaks',
				'Vertical space': 'All breaks: line, frame, page, etc. (equivalent of \\R)',
				'All breaks': 'All breaks: line, frame, page, etc. (equivalent of \\v)',
				'Paragraph break': 'Line breaks, including frame, page, column, etc. Does not match forced line break',
				'Forced line break': 'Forced line break',
				'Floating accents': 'Match a character followed by any floating accents (floating accents are Combining diacritical marks, Unicode range 0300-036F and Combining half marks, FE20-FE2F).',
			// POSIX
			'alnum': 'Alphanumeric characters: letters and digits',
			'alpha': 'Alphabetic characters: letters',
			'blank': 'Spaces and tabs',
			'digit': 'Digits',
			'graph': 'Non-blank characters',
			'lower': 'Lowercase letters',
			'print': 'Non-blank characters plus the space character',
			'punct': 'Punctuation',
			'space': 'All whitespace',
			'upper': 'Uppercase letters',
			'word': 'Alphanumeric characters and the underscore character (equivalent of \\w)',
			'xdigit': 'Hexadecimal characters (0-9 and A-F)',
			'character equivalent [[=a=]]': 'Matches a character and all its accented versions. [[=a=]] matches a, á, à, ä, ą, ã, å, â, ā, ă, ǻ, ầ.',
			
			// Unicode properties
			'Letter': 'Any letter.',
				'Lowercase letter': 'Any lower-case letter.',
				'Uppercase letter': 'Any upper-case letter.',
				'Titlecase letter': 'In some languages, digraphs have a special title-case form. InDesign matches Dz (01F2), Dž (01C5), Lj (01C8), Nj (01CB). Thus, "nj" has the forms nj, NJ, and Nj. InDesign also matches the Ancient Greek letters with "subscript iota", as they can be written as a separate letter: ᾼ, ῌ, ῼ, and their variants with diacritics.',
				'Modifier letter': 'Various characters from Spacing modifier letters (02B0–02FF).',
				'Other letter': 'Whatever letters not captured by the four above classes, i.e. letters without case and that aren’t modifiers: characters from Hebrew, Arabic, the SE-Asian languages, etc.',
			'Mark': 'Any of the following three types of mark.',
				'Non-spacing mark': 'Including combining diacritical marks and tone marks. Matches characters in a wide variety of ranges.',
				'Spacing combining mark': 'Vowels in SE-Asian languages.',
				'Enclosing mark': 'Circles, squares, keycaps, etc. Found in a variety of Unicode ranges.',
			'Separator': 'Spaces, returns, 2028 (line separator), 2029 (paragraph separator. Does not match hyphens and dashes.',
				'Space separator': 'All spaces except tab and return.',
				'Line separator': '2028 is the line-separator character.',
				'Paragraph separator': '2029',
			'Symbol': '(Math, wingdings)',
				'Math symbol': 'Math symbols.',
				'Currency symbol': 'All currency symbols.',
				'Modifier symbol': 'Combining characters with their own width, such as the acute 00B4 (not acute 0301).',
				'Other symbol': 'Wingdings, dingbats, etc. from various ranges.',
			'Number': 'Any kind of number.',
				'Decimal digit number': 'The digits 0 to 9.',
				'Letter number': 'The Roman upper- and lower-case numerals in Number forms (2150–218F).',
				'Other number': 'Super- and subscripts, fractions, enclosed numbers in Latin 1, Number forms, and enclosed alphanumerics.',
			'Punctuation': 'Any punctuation.',
				'Dash punctuation': 'All hyphens and dashes.',
				'Open punctuation': 'Opening brackets, braces, parentheses, and similar, e.g. 2045, FE17, and FF62.',
				'Close punctuation': 'Closing brackets, braces, parentheses, and similar, e.g. 2046, FE18, and FF63.',
				'Initial punctuation': 'All opening quotes.',
				'Final punctuation': 'All closing quotes.',
				'Connector punctuation': 'underscore, 203F, 2040, 2054.',
				'Other punctuation': 'All other punctuation: ! \' % &, etc.',
			// Locations
				'Beginning of word': 'Beginning of word',
				'End of word': 'End of word',
				'Word boundary': '\\b combines beginning of word \\< and end of word \\>',
				'Beginning of paragraph': 'Beginning of paragraph',
				'End of paragraph': 'End of paragraph',
				'Beginning of story': 'Beginning of story',
				'End of story': 'End of story',
			// Match
				'Positive lookbehind 1': 'Match but do not capture the text in the parenthesis. (?<=\. )Figure stands for \'Find "Figure" only when it is preceded by \ dot and a space.\' You can\'t use variable-length patterns inside a lookbehind, but see \\K, below)',
				'Positive lookbehind 2': 'Alternative to the classic lookbehind (see Lookbehind 1). \\K stands for "match but ignore". Unlike the classic lookbehind, \\K allows variable-length strings',
				'Positive lookahead': 'Match a pattern only if followed by the pattern set in the lookahead. Figure(?= \\d) stands for \'Find "Figure" only when it is folloowed by a space and a digit',
				'Positive lookahead': 'Match a pattern only if not followed by the pattern set in the lookahead',
				'Lookaround': 'Combination of lookbehind and lookahead',

			// Modifiers
				'Case-insensitive on': 'Ignore case (the default is "case-insensitive off")',
				'Case-insensitive off': 'Do not ignore case (default)',
				'Multiline on': '^ and $ are disabled as paragraph start and end markers, in effect becoming story start and end markers. (?-m)^Xyz matches only at the start of a story. (Multiline off is the default)',
				'Multiline off': '^ and $ are treated as start and end of paragraph (default)',
				'Single-line on': 'The dot matches the paragraph mark, i.e. the scope of .* is the story (default is (?s-))',
				'Single-line off': 'The dot does not match the paragraph mark, i.e. the scope of .* is the paragraph (default)',
			// Miscellaneous
			'Free spacing': 'Ignore space characters (in this mode, use \\x20 to match a space character).',
			'Comment': 'Insert a comment: (?# . . . )',
			'Literal span': 'Interpret the spanned text literally, so that e.g. \\d is not considered a wildcard ("digit") but as the literal text "\\d".',
	}



	function blueCode () {
		if (app.selection[0].pageItems.length > 0) {
			return {name: 'Anchored-object marker', code: '~a'}
		}
		switch (app.selection[0].contents) {
			case SpecialCharacters.AUTO_PAGE_NUMBER: return {name: 'Current page number', code: '~>'};
			case SpecialCharacters.DISCRETIONARY_HYPHEN: return {name: 'Discretionary hyphen', code: '~-'};
			case SpecialCharacters.DISCRETIONARY_LINE_BREAK: return {name: 'Discretionary line break', code: '~k'};
			case SpecialCharacters.EM_SPACE: return {name: 'Em space', code: '~m'};
			case SpecialCharacters.END_NESTED_STYLE: return {name: 'End nested style', code: '~h'};
			case SpecialCharacters.EN_SPACE: return {name: 'En space', code: '~>'};
			case SpecialCharacters.PAGE_BREAK: return {name: 'Page break', code: '~P'};
			case SpecialCharacters.EVEN_PAGE_BREAK: return {name: 'Even page break', code: '~E'};
			case SpecialCharacters.FIGURE_SPACE: return {name: 'Figure space', code: '~/'};
			case SpecialCharacters.FIXED_WIDTH_NONBREAKING_SPACE: return {name: 'Non-breaking space (fixed width)', code: '~s'};
			case SpecialCharacters.FLUSH_SPACE: return {name: 'Flush space', code: '~f'};
			case SpecialCharacters.FORCED_LINE_BREAK: return {name: 'Forced line break', code: '\\n'};
			case SpecialCharacters.FRAME_BREAK: return {name: 'Frame break', code: '~R'};
			case SpecialCharacters.HAIR_SPACE: return {name: 'Hair space', code: '~|'};
			case SpecialCharacters.INDENT_HERE_TAB: return {name: 'Indent-here tab', code: '~i'};
			case SpecialCharacters.LEFT_TO_RIGHT_EMBEDDING: return {name: 'Left-to-right embedding', code: '\\x{202A}'};
			case SpecialCharacters.LEFT_TO_RIGHT_MARK: return {name: 'Left-to-right mark', code: '\\x{200E}'};
			case SpecialCharacters.LEFT_TO_RIGHT_OVERRIDE: return {name: 'Left-to-right override', code: '\\x{202D}'};
			case SpecialCharacters.NEXT_PAGE_NUMBER: return {name: 'Next page number', code: '~X'};
			case SpecialCharacters.NONBREAKING_SPACE: return {name: 'Non-breaking space (variable width)', code: '~S'};
			case SpecialCharacters.ODD_PAGE_BREAK: return {name: 'Odd page break', code: '~L'};
			case SpecialCharacters.POP_DIRECTIONAL_FORMATTING: return {name: 'Pop directional formatting', code: '\\x{202C}'};
			case SpecialCharacters.PREVIOUS_PAGE_NUMBER: return {name: 'Previous page number', code: '~V'};
			case SpecialCharacters.PUNCTUATION_SPACE: return {name: 'Punctuation space', code: '~.'};
			case SpecialCharacters.QUARTER_SPACE: return {name: 'Quarter space', code: '~4'};
			case SpecialCharacters.RIGHT_INDENT_TAB: return {name: 'Right-indent tab', code: '~y'};
			case SpecialCharacters.RIGHT_TO_LEFT_EMBEDDING: return {name: 'Right-to-left embedding', code: '\\x{202B}'};
			case SpecialCharacters.RIGHT_TO_LEFT_MARK: return {name: 'Right-to-left mark', code: '\\x{200F}'};
			case SpecialCharacters.RIGHT_TO_LEFT_OVERRIDE: return {name: 'Right-to-left override', code: '\\x{202E}'};
			case SpecialCharacters.SECTION_MARKER: return {name: 'Section marker', code: '~x'};
			case SpecialCharacters.SIXTH_SPACE: return {name: 'Sixth space', code: '~%'};
			case SpecialCharacters.THIN_SPACE: return {name: 'Thin space', code: '~<'};
			case SpecialCharacters.THIRD_SPACE: return {name: 'Third space', code: '~3'};
			case SpecialCharacters.ZERO_WIDTH_JOINER: return {name: 'Zero-width joiner', code: '\\x{200D}'}
			case SpecialCharacters.ZERO_WIDTH_NONJOINER: return {name: 'Zero-width non-joiner', code: '~j'};
			case '\r': return {name: 'Paragraph break', code: '\\r'};
			case '\t': return {name: 'Tab character', code: '\\t'};
			case ' ': return {name: 'Space character', code: ' '};
			case '\u205F': return {name: 'Medium mathematical space', code: '\\u205F'};
			case '\u2010': return {name: 'Hyphen', code: '\\u2010'};
			case '\u2011': return {name: 'Non-breaking hypen', code: '~~'};
			case '\u2063': return {name: 'Invisible separator', code: '\\u2063'};
			default: return {name: '', code: ''};
		}
	}

	function create_window (wtitle) {
		var w = new Window ('palette', wtitle);
			var previous = get_previous();
			//w.alignChildren = 'left';
			w.orientation = 'row';
			w.alignChildren = ['fill','top'];
		
			w.tree = w.add ('treeview');
				w.tree.preferredSize = [180, 250];
			
			w.buttons = w.add ('group {orientation: "column", alignChildren: "fill"}');
				w.verbose = w.buttons.add ('checkbox {text: "Verbose mode"}');
				w.keep_open = w.buttons.add ('checkbox {text: "Keep this window open"}');

				w.explain = w.buttons.add ('edittext', undefined, '', {readonly: true, multiline: true});
					w.explain.preferredSize.height = 120;
					
				w.show_code = w.buttons.add ('edittext');
					w.show_code.preferredSize.width = 150;
					
					w.buttonGroup = w.buttons.add ('group');
						w.insert = w.buttonGroup.add ('button', undefined, 'Insert', {name: 'ok'});
						w.lookup = w.buttonGroup.add ('button', undefined, 'Look up');
						w.lookup.helpTip = 'Enter a code (such as ~k or \\n) in the text field to look up its meaning. To\u00A0look up the meaning of a (blue) special character, select the character, then click "Look up".';

			if (previous != null) {
				w.location = previous.location;
				w.keep_open.value = previous.keep_open;
				w.verbose.value = previous.verbose;
			}

		var wc = w.tree.add ('node', 'Standard wildcards');
		var posix = w.tree.add ('node', 'POSIX');
		if (parseInt (app.version) > 5) {
			var uni = w.tree.add ('node', 'Unicode properties');
		}
		var loc = w.tree.add ('node', 'Locations');
		var rep = w.tree.add ('node', 'Repeat');
		var match = w.tree.add ('node', 'Match');
		var mod = w.tree.add ('node', 'Modifiers');
		var misc = w.tree.add ('node', 'Miscellaneous');
		
		wc.add ('item', 'Word character');
		wc.add ('item', 'Lower-case letter');
		wc.add ('item', 'Upper-case letter');
		wc.add ('item', 'Digit');
		wc.add ('item', 'White space');
		if (parseFloat(app.version) >= 8) { // From CS6 
			wc.add ('item', 'Horizontal space');
			wc.add ('item', 'Vertical space');
			wc.add ('item', 'All breaks');
			wc.add ('item', 'Paragraph break');
			wc.add ('item', 'Forced line break');
		}
		wc.add ('item', 'Floating accents');

		posix.add ('item', 'alnum');
		posix.add ('item', 'alpha');
		posix.add ('item', 'blank');
		posix.add ('item', 'digit');
		posix.add ('item', 'graph');
		posix.add ('item', 'lower');
		posix.add ('item', 'print');
		posix.add ('item', 'punct');
		posix.add ('item', 'space');
		posix.add ('item', 'upper');
		posix.add ('item', 'word');
		posix.add ('item', 'xdigit');
		posix.add ('item', 'character equivalent [[=a=]]');

		loc.add ('item', 'Beginning of word');
		loc.add ('item', 'End of word');
		loc.add ('item', 'Word boundary');
		loc.add ('item', 'Beginning of paragraph');
		loc.add ('item', 'End of paragraph');
		loc.add ('item', 'Beginning of story');
		loc.add ('item', 'End of story');
		
		rep.add ('item', 'Zero or one time');
		rep.add ('item', 'Zero or more times');
		rep.add ('item', 'One or more times');
		rep.add ('item', 'Zero or one time (shortest match)');
		rep.add ('item', 'Zero or more times (shortest match)');
		rep.add ('item', 'One or more times (shortest match)');

		if (parseFloat (app.version) >= 8) { // From CS6
			match.add ('item', 'Positive lookbehind 1');
			match.add ('item', 'Positive lookbehind 2');
		} else {
			match.add ('item', 'Positive lookbehind');
		}
		match.add ('item', 'Positive lookahead');
		match.add ('item', 'Negative lookbehind');
		match.add ('item', 'Negative lookahead');
		match.add ('item', 'Lookaround');
		
		mod.add ('item', 'Case-insensitive on');
		mod.add ('item', 'Case-insensitive off');
		mod.add ('item', 'Multiline on');
		mod.add ('item', 'Multiline off');
		mod.add ('item', 'Single-line on');
		mod.add ('item', 'Single-line off');
		
		misc.add ('item', 'Free spacing');
		misc.add ('item', 'Comment');
		misc.add ('item', 'Literal span');


		if (parseInt (app.version) > 5)  // From CS4
			{
			var uni_letter = uni.add ('node', 'Letter'); uni_letter.helpTip = '£££££';
				uni_letter.add ('item', 'Lowercase letter');
				uni_letter.add ('item', 'Uppercase letter');
				uni_letter.add ('item', 'Titlecase letter');
				uni_letter.add ('item', 'Modifier letter');
				uni_letter.add ('item', 'Other letter');
			var uni_mark = uni.add ('node', 'Mark');
				uni_mark.add ('item', 'Non-spacing mark');
				uni_mark.add ('item', 'Spacing combining mark');
				uni_mark.add ('item', 'Enclosing mark');
			var uni_sep = uni.add ('node', 'Separator');
				uni_sep.add ('item', 'Space separator');
				uni_sep.add ('item', 'Line separator');
				uni_sep.add ('item', 'Paragraph separator');
			var uni_symbol = uni.add ('node', 'Symbol');
				uni_symbol.add ('item', 'Math symbol');
				uni_symbol.add ('item', 'Currency symbol');
				uni_symbol.add ('item', 'Modifier symbol');
				uni_symbol.add ('item', 'Other symbol');
			var uni_number = uni.add ('node', 'Number');
				uni_number.add ('item', 'Decimal digit number');
				uni_number.add ('item', 'Letter number');
				uni_number.add ('item', 'Other number');
			var uni_punct = uni.add ('node', 'Punctuation');
				uni_punct.add ('item', 'Dash punctuation');
				uni_punct.add ('item', 'Open punctuation');
				uni_punct.add ('item', 'Close punctuation');
				uni_punct.add ('item', 'Initial punctuation');
				uni_punct.add ('item', 'Final punctuation');
				uni_punct.add ('item', 'Connector punctuation');
				uni_punct.add ('item', 'Other punctuation');
			}
		
		w.tree.onDoubleClick = w.insert.onClick = function () {
			// if a terminal node
			//$.bp()
			if (w.tree.selection == null) return;
			if (w.tree.selection.text in explanation) {
				var syntax_mode = w.verbose.value ? '_long' : '_short';
				var gEditor = Window.find ('palette', 'A GREP editor');
				if (gEditor !== null && gEditor.visible) {
					gEditor.editWindow.textselection = grepCodes[w.tree.selection.text][syntax_mode];
				} else {
					app.findGrepPreferences.findWhat += grepCodes[w.tree.selection.text][syntax_mode];
				}
				if (w.keep_open.value == false){
					w.close();
				}
			} else {
			}
		}

		
		w.tree.onChange = w.verbose.onClick = function (){
			if (w.tree.selection === null) return;
			var syntax_mode = w.verbose.value ? '_long' : '_short';
			try {
				w.show_code.text = grepCodes[w.tree.selection.text][syntax_mode];
			} catch (_) {
				w.show_code.text = '';
			}
			w.explain.text = explanation[w.tree.selection.text] || '';
		}

		w.lookup.onClick = function () {
			if (app.selection.length > 0 && app.selection[0] instanceof Character) {
				var blue = blueCode();
				w.explain.text = blue.name;
				w.show_code.text = blue.code;
			} else if (lookupTable.hasOwnProperty(w.show_code.text)) {
				w.explain.text = lookupTable[w.show_code.text];
			} else {
				w.explain.text = '(Not a valid code)';
			}
		}

		w.onShow = function(){
			//$.bp()
		}

		w.onClose = function () {
			var o = {
				location: [w.location[0], w.location[1]],
				keep_open: w.keep_open.value,
				verbose: w.verbose.value
			}
			saveSettings (o);
		}
		return w;
	}


	function class_picker () {
		var wtitle = 'GREP classes';
		var w = Window.find ('palette', wtitle);
		if (w == null) {
			w = create_window (wtitle);
		}
		w.show();
	}

	class_picker();

}());