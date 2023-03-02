//DESCRIPTION:WhatTheGREP -- Explain GREP Expressions, the Very Hard Way
// A Jongware script 18-Nov-2011
// Accept No Substitutes.
// Do not modify.
// Do not attempt to improve.

// Modified 2-Apr-2012: weird. Suddenly saw 'Ò..Ó' instead of ".." Not sure if it was like that before.
// Update 12-Dec-2018: added new codes \K, \v, and \h


// var list=["NUL", "SOH", "STX", "ETX", "EOT", "ENQ", "ACK", "alert", "backspace", "tab", "newline", "vertical-tab", "form-feed", "carriage-return", "SO", "SI", "DLE", "DC1", "DC2", "DC3", "DC4", "NAK", "SYN", "ETB", "CAN", "EM", "SUB", "ESC", "IS4", "IS3", "IS2", "IS1", "space", "exclamation-mark", "quotation-mark", "number-sign", "dollar-sign", "percent-sign", "ampersand", "apostrophe", "left-parenthesis", "right-parenthesis", "asterisk", "plus-sign", "comma", "hyphen", "period", "slash", "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "colon", "semicolon", "less-than-sign", "equals-sign", "greater-than-sign", "question-mark", "commercial-at", "left-square-bracket", "backslash", "right-square-bracket", "circumflex", "underscore", "grave-accent", "left-curly-bracket", "vertical-line", "right-curly-bracket", "tilde", "DEL" ];
/* var list =  ["alnum",  "alpha",  "blank",  "cntrl", "digit",  "graph", "lower",  "print", "punct",  "space", "upper",  "xdigit", "word", "ascii", "unicode" ];


for (a=0; a<list.length; a++)
{
//	x = list[a].substr(0,1).toLowerCase()+list[a].substr(1,1).toUpperCase()+list[a].substr(2).toLowerCase();
	x = list[a].toUpperCase();
	if (x == list[a]) continue;
//	x = list[a];
	app.findGrepPreferences.findWhat = "\\N{"+x+"}";
	r = app.activeDocument.findGrep();
	if (r.length != 0)
		alert ("Code: "+app.findGrepPreferences.findWhat+" = "+r.length);
}
exit(0);
*/

/*f = app.activeDocument.stories[0];
for (c=0; c<0x5ff; c++)
	f.insertionPoints[-1].contents = " "+String.fromCharCode(c)+" ";
exit(0); */

//DESCRIPTION:What the GREP is going on?
// Jongware, 27-Mar-2010
// Takes its info from the active GREP query


// Boost.org on Perl syntax:
// All characters match themselves, except
// .[{()\*+?|^$
// Empty alternatives are not allowed (these are almost always a mistake).
// [[.ss.]-u] matches "ss", "t", "u" (but not "s")

// Any special character preceded by an escape shall match itself. (?)
// [..] Any other escape sequence matches the character that is escaped, for example \@ matches a literal '@'.

// \b (but only inside a character class declaration). -> Right Indent Tab (!!)
// \N{name} -- symbolic name (symbols name, Unicode name, but NOT collate names!) CASE SENSITIVE except "space"

// (?R) and (?0-9) (Recurse to the start of the entire pattern, or numbered sub-expression) is ERROR
// (?(R)foo|bar) (Test In Recurse loop) is ERROR
// (?(R0-9)foo|bar) (Test In Recurse expr. n) is ERROR
// (?(DEFINE)pat) (Define named subexpr.) is ERROR

// [[=backspace=]] is eq. to some control characters AND non-spacing modifier accents!
// [[=alert==]] is same ...
// [[=DEL==]] is same ...


// Note: () = 'empty' subexpression
// Note: a|aa|aaa -> leftmost matching expr.
//   EXCEPT for
// (a|aaa|aa)b -> leftmost LONGEST expr. ...

// ...
// [\w-\.] is *NOT* allowed :-p

// TODO:
// []..] (totally should work, like, you know)
// [-..] and [..-] -- double-check!
// [--a] and [0--] -- triple-check!
// as in:
// "If a bracket expression specifies both '-' and ']', the ']' shall be placed first
//	(after the '^', if any) and the '-' last within the bracket expression."

// [[.-.]] ... something new (see http://www.opengroup.org/onlinepubs/009695399/basedefs/xbd_chap09.html#tag_09_03_05)

// specials? :(
// see boost.org:
// "ae", "Ae", "AE", "ch", "Ch", "CH", "ll", "Ll", "LL", "ss", "Ss", "SS", "nj", "Nj", "NJ", "dz", "Dz", "DZ", "lj", "Lj", "LJ".
// Also in equivs: [[=ae=]] (= equiv. to '¾')

// Case sensitive
// Can be used in x-y range (first char used for range, excl. if at start, incl. if at end (!))

// also [[.zero.]] [[.one.]] etc.
// equiv. to \N{zero}, etc. (?)
// and ALL full unicode codepoint names ... (I Don't Think So |-(


// TODO:
// (?x) x (?# works -- although it should *not* ...
// (?|pattern) resets the subexpression count at the start of each "|" alternative within pattern. DOES NOT WORK
// "Literal character for ASCII code 9", yeh, you mean it's a tab.
// TABS should be ignored in Ignore Whitespace Mode! (Unless escaped.)
// \p{Punctuation} -> Tabs, LF also allowed inside
// POSIX [:xxx:] INSIDE Inclusion/Exclusion :-(
// [+\p{digit}] : does not find \ but does find 'p'
// \pC,\pL,\pU (= \pc,\pl,\pu)

// This is a problem
// \<([ivxlc]+|[IVXLC]+)-([ivxlc]+|[IVXLC]+)|[A-Z]+\>
// right half is not in word boundary
// the | should be "level 0" [FIXED]

// (oth, this one works:)
// \<(([ivxlc]+)|[IVLXC]+)-((?(2)[ivxlc]+|[IVLXC]+))\>

// THIS TOO!
// (?x: (?(?= (a | b.no | .yes))a))

// TODO:
// \p{unicode classes} [DONE]
// [[:digit:]] -- POSIX classes [DONE]
// [^[:digit:]] -- negated POSIX classes [DONE]
// == [[:^digit:]] [DONE]

// TODO: (?(?=on)..no|..yes)

// TODO:# to EOL when (?x) [DONE]

/*

Extension         Meaning
---------         -------
(?:...)           Cluster-only parentheses, no capturing (DONE)
(?#...)           Comment, discard all text between the parens (DONE)
(?imsx-imsx)      Enable/disable pattern modifiers
(?imsx-imsx:...)  Cluster-only parens with modifiers
  i      case insensitive      OFF
  m      allow ^ and $ to match at \r      ON     
  s      allow . to match \r      OFF     
  x      ignore most whitespace [--and allow inline comments--] in grep patterns      OFF

(?=...)           Positive lookahead assertion (DONE)
(?!...)           Negative lookahead assertion (DONE)
(?<=...)          Positive lookbehind assertion (DONE)
(?<!...)          Negative lookbehind assertion (DONE)
(?()...|...)      Match with if-then-else (DONE)
(?()...)          Match with if-then (DONE)
(?>...)           Match non-backtracking subpattern ("once-only") (DONE)(?)
(?R)              Recursive pattern (does not work)

TODO:
\d+(?(?<=[13579]) is odd| is even) -- condition in lookbehind


TODO:
-- (?<=abc|def) -> *must* be same length (shortest will be used)
-- (?<= ..) NO length-modifiers (but fixed {3} is allowed)
-- (?= ..) length-modifiers allowed


" (?>\d+) can only match an entire sequence of digits. " .. (test!)

"(?x)\w(?# wot)+ # Weird" ... --- works ...

(?x:\x{61} [a-z] +?) -> [..] NOT, +? NOT, \x{61} NOT -- others do.. :-?

TODO: Fix "+?", "*?", "??", "{x,y}?" (glue to prev. cmd?) [DONE]


NOTE: "{ and } are literal characters, unless they're part of a valid regular expression token (e.g. the {n} quantifier)."
		Not true for InDesign ..

*/

var debug = true;//false;//true;
var debugframe;

grepExp = app.findGrepPreferences.findWhat;

var dlg = new Window('dialog', 'What the GREP!?');
// dlg.bounds = {x:100, y:100, width:390, height:290};  //object

dlg.titleSt = dlg.add('statictext', undefined, 'Enter your GREP here');
dlg.grepTxt = dlg.add('edittext', [5,5,400,300], grepExp, {multiline:true});
dlg.group = dlg.add ('group', undefined, {orientation: 'row'} );
dlg.group.goBtn = dlg.group.add('button', undefined, 'Show Me', {name:'ok'});
// dlg.group.copyBtn = dlg.group.add('button', undefined, 'Close, put into GREP', {name:'copy' });
dlg.group.cancelBtn = dlg.group.add('button', undefined, 'Close', {name:'cancel'});

dlg.add('statictext', undefined, 'v0.1 (C) 2010. A Jongware production');


dlg.grepTxt.active = true;

// dlg.goBtn.onClick = function() { this.parent.close(1); }; // { alert ("txt is "+dlg.grepTxr.text); app.findGrepPreferences.findWhat = dlg.grepTxt.text; };

// dlg.group.copyBtn.onClick = function() { this.parent.parent.close(3); }; // { alert ("txt is "+dlg.grepTxr.text); app.findGrepPreferences.findWhat = dlg.grepTxt.text; };

/* if (app.findGrepPreferences.findWhat == '')
{
	alert ("Nothing in the GREP Find What field ..");
	exit(0);
} */

var backslashCodes = [
	[' ', "Literal space" ],
	['\u0009', "Literal tab" ],
	['\u000a', "Literal Soft Line Break" ],
	['\u000D', "Literal Hard Return" ],
	['"', "Unknown control code" ],
	["'", "Unknown control code" ],
//	['0', "Start of octal number" ],	// Handled in code
	['1', "Found Group #1" ],
	['2', "Found Group #2" ],
	['3', "Found Group #3" ],
	['4', "Found Group #4" ],
	['5', "Found Group #5" ],
	['6', "Found Group #6" ],
	['7', "Found Group #7" ],
	['8', "Found Group #8" ],
	['9', "Found Group #9" ],
	['.', "Literal period" ],
	['?', "Literal question mark" ],
	['+', "Literal plus sign" ],
	['*', "Literal asterisk" ],
	['#', "Literal number sign" ],
	['<', "Beginning of a word" ],
	['>', "End of a word"],
	['(', "Literal opening parenthesis" ],
	[')', "Literal closing parenthesis" ],
	['`', "Start of a Story, Footnote, or Cell" ],
	['A', "Start of a Story, Footnote, or Cell" ],
	['b', "Word boundary" ],
	['B', "NOT a word boundary" ],
//	['c', "Control character cA..cZ" ],	// Handled in code
	['C', "Any single character (in Single-line mode: incl. Paragraph Break or Soft Line Break)" ],
	['d', "Any digit (0..9)" ],
	['D', "Anything EXCEPT a digit (0..9) (including Return)" ],
//	['E', "Allow following special characters" ],	// Handled in code
	['G', "Start of a Story, Footnote, or Cell (UNDOCUMENTED)" ],
	['h', 'Match "horizontal space", all space characters except Return'],	// supported since CS5 or so
	['K', "Reset start of match to here" ],	// supported since CS5 or so
	['l', "Any lowercase character (a..z)" ],
	['L', "Anything EXCEPT a lowercase character (a..z) (including Return)" ],
//	['N', "Named Unicode character" ],	// SHOULD handle in code
	['n', "Forced Line Break" ],
//	['p', "Unicode named class" ],	// Handled in code
	['Q', "Suppress special characters -- make all of them act normal until a code '\\E' is found" ],
//	['R', "Any Line End character sequence" ],	// NOT supported; literal 'R'
	['r', "Paragraph Break (Hard Return)" ],
	['s', "Any white space" ],
	['S', "Anything EXCEPT a white space" ],
	['t', "Tab character" ],
	['u', "Any uppercase character (A..Z)" ],
	['U', "Anything EXCEPT an uppercase character (A..Z) (including Return)" ],
//	['v', "\"variant\" -- matches nothing" ],		// does nothing -- not even 'v'!
	['v', 'Match "vertical space" Return and Shift Return'],	// supported since CS5 or so
	['w', "Any word character (A..Z, a..z, _, 0..9)" ],
	['W', "Anything EXCEPT a word character (A..Z, a..z, _, 0..9) (including Return)" ],
	['x', "Unicode character in Hex notation -- should have been handled in code!" ],	// Should handle entirely in code
	['X', "Any Unicode character, including any number of following non-spacing accents" ],
	['z', "End of a Story, Footnote, or Cell (loosely -- a Table may follow!)" ],
	['Z', "End of a Story, Footnote, or Cell (exactly -- may cause problems with Returns)" ],
	['^', "Literal caret" ],
	['{', "Literal opening curly brace" ],
	['}', "Literal closing curly brace" ],
	['[', "Literal opening square bracket" ],
	['\\', "Literal (single) backslash" ],
	[']', "Literal closing square bracket" ],
	['~', "Literal tilde" ]
];

var tildeCodes = [
	[';', "Unknown Tilde Code ';' ... (I'm pretty sure it IS a code)" ],
	['+', "Control-Z control code" ],
	['=', "En-Dash" ],
	['_', "Em-Dash" ],
	['-', "Discretionary Hyphen" ],
	['~', "Non-Breaking Hyphen" ],
	['#', "Any Page Number Code" ],
	['2', "Copyright symbol" ],
	['3', "Third space" ],
	['4', "Quarter space" ],
	['5', "Katakana middle dot" ],
	['6', "Section symbol" ],
	['7', "Paragraph symbol" ],
	['8', "Bullet" ],
	['>', "En-space" ],
	['a', "Anchored Object Marker" ],
	['b', "Paragraph break (Hard return)" ],
	['d', "Trademark Symbol" ],
	['D', "Output Date Variable" ],
	['e', "Ellipsis ..." ],
	['E', "Even Page Break" ],
	['f', "Flush space" ],
	['F', "Footnote Number Code" ],
	['h', "End Nested Style" ],
	['H', "Chapter Number Variable" ],
	['i', "Indent To Here" ],
	['I', "Index Marker Code" ],
	['j', "Non-joiner Code" ],
	['k', "Discretionary Line Break" ],
	['K', "Kanji Marker" ],
	['L', "Odd Page Break" ],
	['l', "File Name Variable" ],
	['m', "Em-space" ],
	['M', "Column Break" ],
	['N', "Current Page Number Code" ],
	['o', "Modification Date Variable" ],
	['O', "Creation Date Variable" ],
	['P', "Any Page Break" ],
	['r', "Trademark symbol" ],
	['R', "Frame Break" ],
	['S', "Non-breaking space" ],
	['s', "Non-breaking fixed width space" ],
	['T', "Last Page Number Variable" ],
	['u', "Custom Text Variable" ],
	['V', "Previous Page Number Code" ],
	['v', "Any Variable Code" ],
	['x', "Section Marker Code" ],
	['X', "Next Page Number Code" ],
	['y', "Right Indent Tab" ],
	['Y', "Running Header (Paragraph Style) Variable" ],
	['Z', "Running Header (Character Style) Variable" ],
	['|', "Hair space" ],
	['<', "Thin space" ],
	['.', "Punctuation space" ],
	['%', "Sixth space" ],
	['3', "Third space" ],
	['4', "Quarter space" ],
	['/', "Figure space" ],
	[ "'", "Literal single straight quote" ],
	['"', "Literal double straight quote" ],
	['[', "Single opening curly quote" ],
	[']', "Single closing curly quote" ],
	['{', "Double opening curly quote" ],
	['}', "Double closing curly quote" ]
];

//	CASE INSENSITIVE, SPACE INSENSITIVE:
var pcodes = [
/* To add:

\p{c*}+ -> ^[0123456789+-*\/_@#$%^&!?ABCDEF...UVWXYZabcdef...uvwxyz] [DONE]
\p{d}+ -> [0123456789] [DONE]
\p{l*}+ -> [ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz] [DONE]
\p{ll}+ -> [abcdefghijklmnopqrstuvwxyz] [DONE]
\p{lm}+ -> ^[0123456789+-*\/_@#$%^&!?ABCDEF...UVWXYZabcdef...uvwxyz] [DONE]
\p{lo}+ -> ^[0123456789+-*\/_@#$%^&!?ABCDEF...UVWXYZabcdef...uvwxyz] [DONE]
\p{lt}+ -> ^[0123456789+-*\/_@#$%^&!?ABCDEF...UVWXYZabcdef...uvwxyz] [DONE]
\p{lu}+ -> [ABCDEFGHIJKLMNOPQRSTUVWXYZ] [DONE]
\p{lu}+ -> ^[0123456789+-*\/_@#$%^&!?][...][abcdef...uvwxyz] [DONE]
\p{l}+ -> [abcxyz] [DONE]
\p{m*}+ -> ^[0123456789+-*\/_@#$%^&!?ABCDEF...UVWXYZabcdef...uvwxyz] [DONE]
\p{mc}+ -> ^[0123456789+-*\/_@#$%^&!?ABCDEF...UVWXYZabcdef...uvwxyz] [DONE]
\p{me}+ -> ^[0123456789+-*\/_@#$%^&!?ABCDEF...UVWXYZabcdef...uvwxyz] [DONE]
\p{mn}+ -> ^[0123456789+-*\/_@#$%^&!?ABCDEF...UVWXYZabcdef...uvwxyz] [DONE]
\p{n*}+ -> [0123456789] [DONE]
\p{nd}+ -> [0123456789] [DONE]
\p{nl}+ -> ^[0123456789+-*\/_@#$%^&!?ABCDEF...UVWXYZabcdef...uvwxyz] [DONE]
\p{no}+ -> ^[0123456789+-*\/_@#$%^&!?ABCDEF...UVWXYZabcdef...uvwxyz] [DONE]
\p{p*}+ -> [-*\/_@#][%][&!?] [DONE]
\p{p*}+ -> ^[0123456789+][$][^][ABCDEF][UVWXYZabcdef][uvwxyz] [DONE]
\p{pc}+ -> [_] [DONE]
\p{pd}+ -> [-] [DONE]
\p{pe}+ -> ^[0123456789+-*\/_@#$%^&!?ABCDEF...UVWXYZabcdef...uvwxyz] [DONE]
\p{pf}+ -> ^[0123456789+-*\/_@#$%^&!?ABCDEF...UVWXYZabcdef...uvwxyz] [DONE]
\p{pi}+ -> ^[0123456789+-*\/_@#$%^&!?ABCDEF...UVWXYZabcdef...uvwxyz] [DONE]
\p{po}+ -> [*\/][@#][%][&!?] [DONE]
\p{ps}+ -> ^[0123456789+-*\/_@#$%^&!?ABCDEF...UVWXYZabcdef...uvwxyz] [DONE]
\p{s*}+ -> [+][$][^] [DONE]
\p{sc}+ -> [$] [DONE]
\p{sk}+ -> [^] [DONE]
\p{sm}+ -> [+] [DONE]
\p{so}+ -> ^[0123456789+-*\/_@#$%^&!?ABCDEF...UVWXYZabcdef...uvwxyz] [DONE]
\p{s}+ -> [ ][	]
\p{u}+ -> [ABCXYZ] [DONE]
\p{w}+ -> [_][0123456789abcxyzABCXYZ]
\p{z*}+ -> ^[0123456789+-*\/_@#$%^&!?ABCDEF...UVWXYZabcdef...uvwxyz]
\p{zl}+ -> ^[0123456789+-*\/_@#$%^&!?ABCDEF...UVWXYZabcdef...uvwxyz] [DONE]
\p{zp}+ -> ^[0123456789+-*\/_@#$%^&!?ABCDEF...UVWXYZabcdef...uvwxyz] [DONE]
\p{zs}+ -> ^[0123456789+-*\/_@#$%^&!?ABCDEF...UVWXYZabcdef...uvwxyz] [DONE]


// NOT INSIDE [..]!
\pu (=\pU) ^ \Pu (=\PU)
\pw
\pd
\pl
\ps

*/

	[ "Any",							"Any character at all" ],
	[ "Assigned",						"Any valid Unicode character" ],
	[ "C*",								"Control character of any kind" ],
	[ "Cc", "Control",					"Control character (Tab, Line break, Paragraph break)" ],
	[ "Cf",	"Format",					"Formatting marker (bidi controls, etc.)" ],
	[ "Cn",	"Unassigned",				"Unassigned Unicode character" ],
	[ "Co",	"PrivateUse",				"Private Use Area character (U+E000-U+F8FF)" ],
	[ "Cs", "Surrogate",				"One half of a surrogate pair" ],
	[ "L*", "Letter",					"Letter character of any kind" ],
	[ "Ll",	"LowercaseLetter",			"Lowercase letter" ],
	[ "Lm",	"ModifierLetter",			"Spacing modifier letter" ],
	[ "Lo",	"OtherLetter",				"Non-case non-modifier letter" ],
	[ "Lt",	"TitlecaseLetter",			"Titlecase letter" ],
	[ "Lu",	"UppercaseLetter",			"Uppercase letter" ],
	[ "M*",								"Mark character of any kind" ],
	[ "Mark",							"Mark character" ],
	[ "Mc",	"SpacingCombiningMark",		"Spacing Combining mark" ],
	[ "Me",	"EnclosingMark",			"Circle, square, or keycap character" ],
	[ "Mn",	"NonSpacingMark",			"Non-spacing diacritical or tone mark" ],
	[ "N*",								"Number character of any kind" ],
	[ "Nd", "DecimalDigitNumber",		"Single digit (0 to 9)" ],
	[ "Nl",	"LetterNumber",				"Roman and ideographic numeral character" ],
	[ "No",	"OtherNumber",				"Other number character" ],
	[ "Number",							"Number character" ],
	[ "Other", 							"Other" ],
	[ "OtherSymbol",					"Wingdings or dingbat character" ],
	[ "P*",								"Punctuation character of any kind" ],
	[ "Pc",	"ConnectorPunctuation",		"Connector character (Underscore, Undertie (U+203F), Tie (U+2040), Inverted Undertie (U+2054))" ],
	[ "Pd",	"DashPunctuation",			"Hyphen or dash character" ],
	[ "Pe",	"ClosePunctuation",			"Closing parenthesis or bracket" ],
	[ "Pf",	"FinalPunctuation",			"Closing quote" ],
	[ "Pi",	"InitialPunctuation",		"Opening quote" ],
	[ "Po",	"OtherPunctuation",			"Various punctuation character (comma, colon, slash etc.)" ],
	[ "Ps",	"OpenPunctuation",			"Opening parenthesis or bracket" ],
	[ "Punctuation",					"Punctuation character" ],
	[ "S*",								"Symbol character of any kind" ],
	[ "Sc",	"CurrencySymbol",			"Currency symbol" ],
	[ "Separator",						"Separator (Space, Return; Line (U+2028) or Paragraph (U+2029) Separator)" ],
	[ "Sk",	"ModifierSymbol",			"Modifier symbol" ],
	[ "Sm",	"MathSymbol",				"Math symbol (+, =, <, > etc.)" ],
	[ "So",	"Symbol",					"Math, Wingdings symbol (copyright, degree etc.)" ],
	[ "Zl",	"LineSeparator",			"Line Separator (U+2028)" ],
	[ "Zp",	"ParagraphSeparator",		"Paragraph Separator (U+2029)" ],
	[ "Zs",	"SpaceSeparator",			"Any kind of space except Tab and Return" ]
];

// CASE SENSITIVE in [[=.=]], INSENSITIVE in [[:.:]] <- what nonsense ...
var posixList = [
//	Basic set:
	[ "alnum", "Alphabetic character or digit" ],
	[ "alpha", "Alphabetic character" ],
	[ "blank", "All kinds of whitespace excl. Returns" ],
	[ "cntrl", "Control character (Tab, Returns)" ],
	[ "digit", "D", "Digits" ],
	[ "graph", "Non-blank character (excl. space and control characters)" ],
	[ "lower", "L", "Lowercase alphabetic character" ],
	[ "print", "Printable character (incl. Tabs and Returns)" ],
	[ "punct", "Punctuation character" ],
	[ "space", "S", "Any whitespace character (incl. Return, Soft Line Break, etc.)" ],	// always CASE INSENSITIVE ...
	[ "upper", "U", "Uppercase alphabetic character" ],
	[ "xdigit","Digit allowed in a hexadecimal number (0-9, A-F, a-f)" ],
	[ "word",  "W", "Any word character (uppercase, lowercase, digit, underscore)" ],

//	Locale charsets:
	[ "ascii",	'Any ASCII value character (up to code 0x7F)' ],
	[ "unicode", "Any Unicode character (U+0100 to U+FFFD)" ]
];

// Posix Symbolic Names: [[.NUL.]]
// Also equiv.: [[=NUL=]] etc.
// Case SENSITIVE, space sensitive
var posixSymbol = [
	[0, "NUL", "Literal NULL character" ],	// Ctrl chars & non-spacing marks, in [[=.=]]
	[1, "SOH", "Start of Header character" ],
	[2, "STX", "Start of Text character" ],
	[3, "ETX", "End of Nested Style" ],
	[4, "EOT", "Footnote Number code" ],
	[5, "ENQ", "Enquiry character" ],
	[6, "ACK", "Acknowledge character" ],
	[7, "alert", "Alert character" ],
	[8, "backspace", "Backspace character" ],	// NOT case-sensitive!
	[9, "tab", "Tab character" ],	// only tabs in [[=.=]]
	[10, "newline", "Soft Line Break" ],
	[11, "vertical-tab", "Vertical Tab character" ],
	[12, "form-feed", "Form Feed character" ],
	[13, "carriage-return", "Paragraph Break" ],
	[14, "SO", "Shift Out character" ],
	[15, "SI", "Shift In character" ],
	[16, "DLE", "Data Link Escape character" ],
	[17, "DC1", "Device Control 1 character" ],
	[18, "DC2", "Device Control 2 character" ],
	[19, "DC3", "Device Control 3 character" ],
	[20, "DC4", "Device Control 4 character" ],
	[21, "NAK", "Not Acknowledged character" ],
	[22, "SYN", "Synchronous Idle character" ],
	[23, "ETB", "End of Block character" ],
	[24, "CAN", "Cancel character" ],	// [[.]] -> 2
	[25, "EM", "End of Medium character" ],	// [[.]] -> 2
	[26, "SUB", "Substitute character" ],
	[27, "ESC", "" ],
	[28, "IS4", "" ],
	[29, "IS3", "" ],
	[30, "IS2", "" ],
	[31, "IS1", "" ],
	[32, "space", "Literal space" ],	// NOT case-sensitive!
	[33, "exclamation-mark", "Exclamation mark" ],
	[34, "quotation-mark", "Straight double quote" ],
	[35, "number-sign", "Number sign" ],
	[36, "dollar-sign", "Dollar sign" ],
	[37, "percent-sign", "Percent sign" ],
	[38, "ampersand", "Ampersand character" ],	// NOT case-sensitive!
	[39, "apostrophe", "Straight single quote" ],	// NOT case-sensitive!
	[40, "left-parenthesis", "Open parenthesis" ],
	[41, "right-parenthesis", "Close parenthesis" ],
	[42, "asterisk", "Literal asterisk" ],	// NOT case-sensitive!
	[43, "plus-sign", "Plus sign" ],
	[44, "comma", "Comma" ],	// NOT case-sensitive!
	[45, "hyphen", "Hyphen" ],	// NOT case-sensitive!
	[46, "period", "Literal period" ],
	[47, "slash", "Forward slash" ],
	[48, "zero", "Character '0'" ],
	[49, "one", "Character '1'" ],	// 1, superscr 1
	[50, "two", "Character '2'" ],
	[51, "three", "Character '3'" ],
	[52, "four", "Character '4'" ],
	[53, "five", "Character '5'" ],
	[54, "six", "Character '6'" ],
	[55, "seven", "Character '7'" ],
	[56, "eight", "Character '8'" ],
	[57, "nine", "Character '9'" ],
	[58, "colon", "Colon" ],	// NOT case-sensitive!
	[59, "semicolon", "Semicolon" ],	// ;, 037E (Greek question mark)	// NOT case-sensitive!
	[60, "less-than-sign", "Less Than sign" ],
	[61, "equals-sign", "Equals sign" ],
	[62, "greater-than-sign", "Greater Than sign" ],
	[63, "question-mark", "Literal question mark" ],
	[64, "commercial-at", "At sign" ],
	[91, "left-square-bracket", "Literal left square bracket" ],
	[92, "backslash", "Literal backslash" ],
	[93, "right-square-bracket", "Literal right square bracket" ],
	[94, "circumflex", "Literal circumflex" ],
	[95, "underscore", "Underscore" ],
	[96, "grave-accent", "ASCII Grave accent" ],
	[123, "left-curly-bracket", "Left curly bracket" ],
	[124, "vertical-line", "Vertical line" ],
	[125, "right-curly-bracket", "Right curly bracket" ],
	[126, "tilde", "Tilde" ],	// NOT case-sensitive!
	[127, "DEL", "ASCII DEL code" ]
];

result = dlg.show();
if (result == 2)
	exit(0);
/* if (result == 3)
{
	app.findGrepPreferences.findWhat = dlg.grepTxt.text;
	exit(0);
} */

var grepTxt = dlg.grepTxt.text;

var adjustDoc = false;
var ignoreWhitespace = false;
var ignoreCase = false;
var singleLineMode = false;
var multilineMode = true;

var badCommentInIgnWhite = false;
var colorCode = { Error:-1, Text:0, SingleCode:1, Operator:2, Group:3, NGroup:4, CGroup:5, LGroup:6, Escape:7, Tilde:8, Repeat:9, RepeatTxt:10, IExGroup:11, IText:12, AGroup:13, Comment:14, CommentG:15, Warning:16, ModGroup:17 };

var numGroup = 0;
var nestGroup = 0;

var colorcoded = new Array;	// Colorcoded parsed items land here
var groupStack = [ "0" ];	// ONLY for (groups), to remember when inside if/then, lookaheads, etc.

// Undo comes courtesy of InTools sample -- Thanks, guys! ;-)
// (Advertisement: See http://in-tools.com for lots of good stuff!)

grepExp = grepTxt;
if (debug || parseFloat(app.version) < 6)
	showMeTheGrep();
else
	app.doScript (showMeTheGrep, ScriptLanguage.JAVASCRIPT,undefined,UndoModes.ENTIRE_SCRIPT, "What the GREP!?");


function showMeTheGrep ()
{
	var doc = null;
	var frame = null;
	if (app.documents.length > 0)
	{
		if (app.activeDocument.label == "grepdoc")
		{
			doc = app.activeDocument;
		}
	}

	if (doc == null)
	{
		doc = app.documents.add();
		app.activeDocument = doc;
		doc.label = "grepdoc";
	}

//	alert (doc.label+"??? "+doc.textFrames.everyItem().label);
	for (d=0; d<doc.textFrames.length; d++)
	{
		if (doc.textFrames[d].label == "grepframe")
		{
			frame = doc.textFrames[d];
			break;
		}
	}
//	alert ("frame is "+frame);
//	exit(0);

if (frame == null)
{
/*	if (app.documents.length > 0 && app.selection.length == 1 && (app.selection[0] instanceof InsertionPoint || app.selection[0] instanceof TextFrame))
	{
		frame = app.selection[0];
		if (frame instanceof InsertionPoint)
			frame = frame.parentTextFrames[0];
		alert (frame.constructor.name);
		frame.geometricBounds = [frame.geometricBounds[0], frame.geometricBounds[1], frame.geometricBounds[2]+300, frame.geometricBounds[3] ];
		frame.label = "grepframe";
	} else */
	{
		adjustDoc = true;
		doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.MILLIMETERS;
		doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.MILLIMETERS;
		
		doc.textPreferences.typographersQuotes = false;
	
		doc.documentPreferences.facingPages = false;
		doc.documentPreferences.pageWidth = "8in";
		doc.documentPreferences.pageHeight = "8in";
		doc.pages[0].marginPreferences.left = 0;	// ".5in";
		doc.pages[0].marginPreferences.right = 0;	// ".5in";
		doc.pages[0].marginPreferences.top = 0; // ".5in";
		doc.pages[0].marginPreferences.bottom = 0; // ".5in";
	
		frame = doc.textFrames.add ({geometricBounds:[".5in",".5in","30in","7.5in"]});
		frame.label = "grepframe";
	}
} else
{
	frame.geometricBounds = [frame.geometricBounds[0], frame.geometricBounds[1], frame.geometricBounds[2]+200, frame.geometricBounds[3] ];
	if (doc.label == "grepdoc")
		adjustDoc = true;
}

if (debug) debugframe = frame;


var escapeColor = addColor ("Escape", 0,200,255);
var tildeColor = addColor ("Tilde Code", 255,144,255);
var groupColor = addColor ("Group", 0,160,0);
var redColor = addColor("Parentheses", 200,0,0);
var opColor = addColor ("Operator", 0,160,224);
var ccColor = addColor ("Condition", 224,128,0);
var iexColor = addColor ("Incl/Excl", 160,160,220);
var atomColor = addColor ("Atomic", 176,0,176);
var cmtColor = addColor ("Comment", 192,192,186);
var modColor = addColor ("Modifier", 120,128,140);

var badColor = addColor ("Error", 255,0,0);


try
{
	frame.insertionPoints[-1].appliedFont = "Myriad Pro\tRegular";
} catch (_)
{
	try {
		frame.insertionPoints[-1].appliedFont = "Arial\tRegular";
	} catch (_)
	{
		// Oh what the hell. Give up and use the default font.
	}
}
frame.insertionPoints[-1].pointSize = 10;
frame.insertionPoints[-1].fillColor = app.activeDocument.swatches.item("Black");
frame.insertionPoints[-1].position = Position.NORMAL;

frame.contents = grepExp+"\r\r";
explainGrep (frame, grepExp);

frame.insertionPoints[-1].contents = "\r\r";


colorcoded.reverse();

while (colorcoded.length > 0)
{
	frame.insertionPoints[-1].contents = SpecialCharacters.THIN_SPACE;

	set = colorcoded.pop();

	switch (set[1])
	{
		case colorCode.Error:
			frame.insertionPoints[-1].properties = {fontStyle:"Bold Italic", fillColor:badColor};
			break;
		case colorCode.Warning:
			frame.insertionPoints[-1].properties = {fontStyle:"Bold", fillColor:badColor};
			break;
		case colorCode.Text:
			frame.insertionPoints[-1].properties = {fontStyle:"Regular", fillColor:app.activeDocument.swatches.item("Black"), position:Position.NORMAL};
			break;
		case colorCode.IText:
			frame.insertionPoints[-1].properties = {fontStyle:"Regular", fillColor:iexColor};
			break;
		case colorCode.SingleCode:
			frame.insertionPoints[-1].properties = {fontStyle:"Bold", fillColor:redColor};
			break;
		case colorCode.Operator:
			frame.insertionPoints[-1].properties = {fontStyle:"Bold", fillColor:opColor};
			break;
		case colorCode.Repeat:
			if (set[0])
			{
				frame.insertionPoints[-1].properties = {fontStyle:"Bold", fillColor:opColor, position:Position.SUPERSCRIPT};
				frame.insertionPoints[-1].contents = set[0];
				frame.insertionPoints[-1].position = Position.NORMAL;
			}
			break;
		case colorCode.RepeatTxt:
			frame.insertionPoints[-1].properties = {fontStyle:"Regular", fillColor:opColor};
			break;
		case colorCode.Group:
			frame.insertionPoints[-1].properties = {fontStyle:"Bold", fillColor:groupColor};
			break;
		case colorCode.NGroup:
			frame.insertionPoints[-1].properties = {fontStyle:"Bold", fillColor:ccColor};
			break;
		case colorCode.AGroup:
			frame.insertionPoints[-1].properties = {fontStyle:"Bold", fillColor:atomColor};
			break;
		case colorCode.CGroup:
			frame.insertionPoints[-1].properties = {fontStyle:"Bold", fillColor:ccColor};
			break;
		case colorCode.IExGroup:
			frame.insertionPoints[-1].properties = {fontStyle:"Bold", fillColor:iexColor};
			break;
		case colorCode.LGroup:
			frame.insertionPoints[-1].properties = {fontStyle:"Bold", fillColor:ccColor};
			break;
		case colorCode.Escape:
			frame.insertionPoints[-1].properties = {fontStyle:"Bold", fillColor:escapeColor};
			break;
		case colorCode.Tilde:
			frame.insertionPoints[-1].properties = {fontStyle:"Bold", fillColor:tildeColor};
			break;
		case colorCode.Comment:
			frame.insertionPoints[-1].properties = {fontStyle:"Regular", fillColor:cmtColor};
			break;
		case colorCode.CommentG:
			frame.insertionPoints[-1].properties = {fontStyle:"Bold", fillColor:cmtColor};
			break;
		case colorCode.ModGroup:
			frame.insertionPoints[-1].properties = {fontStyle:"Bold", fillColor:modColor};
			break;
	}
	if (set[1] == colorCode.Repeat)
		continue;
	if (set[1] == colorCode.IExGroup && set[0].substr(0,2) != "[=")
	{
		frame.insertionPoints[-1].pointSize *= 1.2;
		frame.insertionPoints[-1].contents = set[0].substr(0,1);
		frame.insertionPoints[-1].pointSize /= 1.2;
		if (set[0].substr(1,1) == "^")
		{
			frame.insertionPoints[-1].position = Position.SUBSCRIPT;
			frame.insertionPoints[-1].contents = "X";
			frame.insertionPoints[-1].position = Position.NORMAL;
			frame.insertionPoints[-1].contents = set[0].substr(2);
		} else
			frame.insertionPoints[-1].contents = set[0].substr(1);
		continue;
	}
	if (set[1] == colorCode.Group)
	{
		// Base level OR?
		if (set[0] == "|")
		{
			frame.insertionPoints[-1].pointSize *= 1.5;
			frame.insertionPoints[-1].contents = set[0];
			frame.insertionPoints[-1].pointSize /= 1.5;
			continue;
		}
		if ("0123456789".indexOf(set[0].substr(0,1)) > -1)
		{
			var decs = set[0].match(/^(\d+)(.)*$/);
			frame.insertionPoints[-1].position = Position.SUBSCRIPT;
			frame.insertionPoints[-1].contents = decs[1];
			frame.insertionPoints[-1].position = Position.NORMAL;
			frame.insertionPoints[-1].pointSize *= 1.2;
			frame.insertionPoints[-1].contents = decs[2];
			frame.insertionPoints[-1].pointSize /= 1.2;
			continue;
		}
		if ("0123456789".indexOf(set[0].substr(1,1)) > -1)
		{
			frame.insertionPoints[-1].pointSize *= 1.2;
			frame.insertionPoints[-1].contents = set[0].substr(0,1);
			frame.insertionPoints[-1].pointSize /= 1.2;
			frame.insertionPoints[-1].position = Position.SUBSCRIPT;
			frame.insertionPoints[-1].contents = set[0].substr(1);
			frame.insertionPoints[-1].position = Position.NORMAL;
			continue;
		}
	}
	if (set[1] == colorCode.CGroup)
	{
		if (set[0] == ")")
		{
			frame.insertionPoints[-1].position = Position.SUBSCRIPT;
			frame.insertionPoints[-1].contents = "?";
			frame.insertionPoints[-1].position = Position.NORMAL;
			frame.insertionPoints[-1].pointSize *= 1.2;
			frame.insertionPoints[-1].contents = set[0];
			frame.insertionPoints[-1].pointSize /= 1.2;
			continue;
		}
		if (set[0])
		{
			frame.insertionPoints[-1].pointSize *= 1.2;
			frame.insertionPoints[-1].contents = set[0];
			frame.insertionPoints[-1].pointSize /= 1.2;
			frame.insertionPoints[-1].position = Position.SUBSCRIPT;
			frame.insertionPoints[-1].contents = "?";
			frame.insertionPoints[-1].position = Position.NORMAL;
		}
		continue;
	}
	if (set[1] == colorCode.ModGroup || set[1] == colorCode.Group || set[1] == colorCode.LGroup || set[1] == colorCode.AGroup || set[1] == colorCode.NGroup)
	{
		if (set[0].substr(0,1) == ")" || set[0].substr(0,1) == "|")
		{
			frame.insertionPoints[-1].position = Position.SUBSCRIPT;
			frame.insertionPoints[-1].contents = set[0].substr(1);
			frame.insertionPoints[-1].position = Position.NORMAL;
			frame.insertionPoints[-1].pointSize *= 1.2;
			frame.insertionPoints[-1].contents = set[0].substr(0,1);
			frame.insertionPoints[-1].pointSize /= 1.2;
			continue;
		}
		//	Opening parenthesis, larger
		//	May contain subscript (should usually be always ...)
		if (set[0].substr(0,1) == '(')
		{
			frame.insertionPoints[-1].pointSize *= 1.2;
			frame.insertionPoints[-1].contents = "(";
			frame.insertionPoints[-1].pointSize /= 1.2;
			set[0] = set[0].substr(1);
		}

		subs = set[0].indexOf("_");
		if (subs > -1)
		{
			remain = set[0].substr(0,subs);
			subs = set[0].substr(subs+1);
			frame.insertionPoints[-1].contents = remain;
			if (subs)
			{
				frame.insertionPoints[-1].position = Position.SUBSCRIPT;
				frame.insertionPoints[-1].contents = subs;
				frame.insertionPoints[-1].position = Position.NORMAL;
			}
			continue;
		}
	}
	frame.insertionPoints[-1].position = Position.NORMAL;
	if (set[1] == colorCode.Escape || set[1] == colorCode.Text || set[1] == colorCode.IText)
	{
		while (set[0].length > 0)
		{
			frame.insertionPoints[-1].position = Position.NORMAL;
			str = '';
			while (set[0] != '' && set[0].substr(0,1) != ' ' && set[0].substr(0,1) != '\u0009')
			{
				str += set[0].substr(0,1);
				set[0] = set[0].substr(1);
			}
			if (str)
				frame.insertionPoints[-1].contents = str;
			str = '';		
			while (set[0] != '' && set[0].substr(0,1) == '\u0009')
			{
				str += "È";
				set[0] = set[0].substr(1);
			}
			if (str)
			{
				prevcolor = frame.insertionPoints[-1].fillColor;
				frame.insertionPoints[-1].fillColor = escapeColor;
				frame.insertionPoints[-1].contents = str;
				frame.insertionPoints[-1].fillColor = prevcolor;
			}
			str = '';		
			while (set[0] != '' && set[0].substr(0,1) == ' ')
			{
				str += "^";
				set[0] = set[0].substr(1);
			}
			if (str)
			{
				prevcolor = frame.insertionPoints[-1].fillColor;
				frame.insertionPoints[-1].fillColor = escapeColor;
				frame.insertionPoints[-1].position = Position.SUBSCRIPT;
				frame.insertionPoints[-1].contents = str;
				frame.insertionPoints[-1].fillColor = prevcolor;
				frame.insertionPoints[-1].position = Position.NORMAL;
			}
		}
	} else
		frame.insertionPoints[-1].contents = set[0];
}

frame.fit (FitOptions.FRAME_TO_CONTENT);

if (adjustDoc)
{
	doc.documentPreferences.pageHeight = frame.geometricBounds[2]+12.7;
	frame.geometricBounds = [frame.geometricBounds[0], frame.geometricBounds[1], frame.geometricBounds[2]+12.7, frame.geometricBounds[3] ];
	frame.move (["0.5in", "0.5in"]);
	doc.layoutWindows[0].zoom(ZoomOptions.FIT_PAGE);
}

/* frame.geometricBounds = [".5in",".5in","7.5in","7.5in"];
while (frame.overflows)
{
	nextPg = doc.pages.add();
	nextFrame = nextPg.textFrames.add ({geometricBounds:[".5in",".5in","7.5in","7.5in"]});
	frame.nextTextFrame = nextFrame;
	frame = nextFrame;
} */

}

function addColor (name, r,g,b)
{
	var color;
	try {
		app.activeDocument.colors.add({name:name, space:ColorSpace.RGB, colorValue:[r,g,b]});
	} catch (_) {}

	return app.activeDocument.colors.item(name);

}

function explainGrep (dest, expr)
{
	var part, partEnd, currGroup, levelId, str, repeat;

	currGroup = 0;
	levelId = numGroup;
	repeat = false;
	
//	Special cases that cannot be handled otherwise ...
	if (expr.substr(0,1) == "|")
	{
		addLn (dest, '|\tError: the "|" OR code cannot appear as the first element of an expression or sub-expression');
		colorcoded.push (["|", colorCode.Error]);
		expr = expr.substr(1);
	}
	
	while (expr.length > 0)
	{
		//	Special cases that cannot be handled otherwise ...
		if (expr == "|")
		{
			addLn (dest, '|\tError: the "|" OR code cannot appear as the last element of an expression or sub-expression');
			colorcoded.push (["|", colorCode.Error]);
			expr = '';
			break;
		}
	
		if (badCommentInIgnWhite)
		{
			colorcoded.push ([expr, colorCode.Comment]);
			expr = '';
			break;
		}
		if (expr.substr(0,1) == '#' && ignoreWhitespace)
		{
			addLn (dest, expr+"\tComment", nestGroup);
			colorcoded.push (['#', colorCode.CommentG]);
			colorcoded.push ([expr.substr(1), colorCode.Comment]);
			expr = '';
			badCommentInIgnWhite = true;
			break;
		}
		switch (expr.substr(0,1))
		{
			case '{':
			/*	part = getParen (expr.substr(0,1), expr);
				if (part.length > 0)
				{
					if (expr.substr(part.length,1) == '?')
					{
						part += "?";
					}

					str = part.match(/^\{(\d+)(,(\d*))?\}(\?)?$/);
					if (str != null)
					{
						var times = " "+str[1]+" times";
						if (str[1] == 0)
							times = " never";
						if (str[1] == 1)
							times = " once";
						if (str != null)
						{
						//	addLn (dest, "<<"+str.join(">> <<")+">>");
							expr = expr.substr(part.length);
							if (str[2] == null)
							{
								if (str[4] == null)
									addLn (dest, part+"\tRepeat"+times, nestGroup);
								else
									addLn (dest, part+"\tRepeat"+times+" ('shortest match'; always"+times+")", nestGroup);
							} else
							{
								if (str[2] == ",")
								{
									if (str[4] == null)
										addLn (dest, part+"\tRepeat at least"+times+", no maximum", nestGroup);
									else
										addLn (dest, part+"\tRepeat at least"+times+", no maximum (shortest match)", nestGroup);
								} else
								{
									if (Number(str[1]) > Number(str[3]))
									{
										if (str[4] == null)
											addLn (dest, part+"\tRepeat at least"+str[1]+" and up to "+str[3]+" times (invalid)", nestGroup);
										else
											addLn (dest, part+"\tRepeat at least"+str[1]+" and up to "+str[3]+" times (shortest match) (invalid)", nestGroup);
										colorcoded.push ([part, colorCode.Error]);
										break;
									} else
									{
										if (Number(str[1]) == Number(str[3]))
										{
											if (str[4] == null)
												addLn (dest, part+"\tRepeat at least"+times+" and up to "+str[3]+" times (so always"+times+")", nestGroup);
											else
												addLn (dest, part+"\tRepeat at least"+times+" and up to "+str[3]+" times ('shortest match'; always"+times+")", nestGroup);
										} else
										{
											if (str[4] == null)
												addLn (dest, part+"\tRepeat at least"+times+" and up to "+str[3]+" times", nestGroup);
											else
												addLn (dest, part+"\tRepeat at least"+times+" and up to "+str[3]+" times (shortest match)", nestGroup);
										}
									}
								}
							}
							colorcoded.push ([part, colorCode.Repeat]);
							break;
						}
					}
				} */
				addLn (dest, expr.substr(0,1)+"\tError: Unescaped Open Curly Brace", nestGroup);
				colorcoded.push ([expr.substr(0,1), colorCode.Error]);
				expr = expr.substr(1);
				break;

			case '[':
				// Collating groups:
// [[.x.]] (all single characters!)
// [[.ae.]]
// [[.ch.]]
// [[.dz.]]
// [[.lj.]] 
// [[.ll.]]
// [[.nj.]]
// [[.ss.]]
				str = expr.match (/^\[(\^?)\[\.(..?)\.\]\]/);
				if (str)
				{
					var isKnown = false;
					if (str[2].length == 1)
					{
						isKnown = true;
					} else
					{
						switch (str[2].toLowerCase())
						{
							case 'ae': case "ch": case "dz": case "lj": case "ll": case "nj": case "ss":
								isKnown = true;
								break;
						}
					}
					if (str[1] == '')
					{
						if (str[2].length == 2)
						{
							if (isKnown)
								addLn (dest, str[0]+'\tThe literal characters "'+str[2]+'" (collating notation)', nestGroup);
							else
								addLn (dest, str[0]+'\tThe literal characters "'+str[2]+'" (collating notation) -- Warning: Unknown set!', nestGroup);
						} else
							addLn (dest, str[0]+'\tThe literal character "'+str[2]+'" (collating notation)', nestGroup);
					} else
					{
						if (str[2].length == 2)
						{
							if (isKnown)
								addLn (dest, str[0]+'\tAny single character EXCEPT the literal characters "'+str[2]+'" (collating notation)', nestGroup);
							else
								addLn (dest, str[0]+'\tAny single character EXCEPT the literal characters "'+str[2]+'" (collating notation) -- Warning: Unknown set!', nestGroup);
						} else
							addLn (dest, str[0]+'\tAny character EXCEPT the literal character "'+str[2]+'" (collating notation)', nestGroup);
					}
					if (isKnown)
						colorcoded.push ([ str[0], colorCode.Operator]);
					else
						colorcoded.push ([ str[0], colorCode.Warning]);
					expr = expr.substr(str[0].length);
					expr = canRepeat (dest, expr, "this character");
					break;
				}

				//	POSIX Groups: [[:group:]]
				//	Negative form: [^[:group:]]
				str = expr.match (/^\[(\^?)\[:([-_\sA-Za-z]+):\]\]/);
				if (str)
				{
					var group = findPCode (posixList, str[2]);
					if (!group)
						group = findPCode (pcodes, str[2]);
					if (group)
					{
						if (str[1] == '')
						{
							addLn (dest, str[0]+'\tAny character in POSIX group "'+group[1]+'"', nestGroup);
							colorcoded.push ([ "[[:"+group[0]+":]]", colorCode.IExGroup]);
							expr = expr.substr(str[0].length);
							expr = canRepeat (dest, expr, "this group");
							break;
						}
						// str[1] == '^' -- Negated
						addLn (dest, str[0]+'\tAny character NOT in POSIX group "'+group[1]+'" (including Return)', nestGroup);
						colorcoded.push ([ "[^[:"+group[0]+":]]", colorCode.IExGroup]);
						expr = expr.substr(str[0].length);
						expr = canRepeat (dest, expr, "this group");
						break;
					}
				}

				//	Character Equivalent: [[=x=]]
				//	Negative form: [^[=x=]]
				//	Pick 'Simple' form for single characters, rather than
				//	reporting as "inclusion group with one character"
				str = expr.match(/^\[(\^?)\[=(.)=\]\]/);
				if (str)
				{
					if (str[1] == '')
						addLn (dest, str[0]+"\tAny character equivalent to '"+str[2]+"'", nestGroup);
					else
						addLn (dest, str[0]+"\tAny character NOT equivalent to '"+str[1]+"' (including Return)", nestGroup);
					colorcoded.push ([str[0], colorCode.IExGroup]);
					expr = expr.substr(str[0].length);
					expr = canRepeat (dest, expr, "this character equivalent");
					break;
				}

			//	Get Inclusion/Exclusion group.
			//	getParen should return "[ ..data.. ]" ...

				part = getParen (expr.substr(0,1), expr);
			//	addLn (dest, "Substring: <"+part+">");
				if (part.length > 0)
				{
					expr = expr.substr(part.length);
					if (part.substr(0,2) == '[^')
					{
						nestGroup++;
						addLn (dest, part.substr(0,2)+"\tExclusion: any character not in this group", nestGroup-1);
						colorcoded.push (["[^", colorCode.IExGroup]);
						partEnd = part.substr(part.length-1);
						part = part.substr(2,part.length-3);
						explainIEx (dest, part);
						nestGroup--;
						addLn (dest, partEnd+"\tEnd Exclusion Group", nestGroup);
						colorcoded.push (["]", colorCode.IExGroup]);
						expr = canRepeat (dest, expr, "while any character is NOT in this group");
						break;
					}
				
					nestGroup++;
					addLn (dest, part.substr(0,1)+"\tInclusion: any character in this group", nestGroup-1);
					colorcoded.push (["[", colorCode.IExGroup]);
					partEnd = part.substr(part.length-1);
					part = part.substr(1,part.length-2);
					explainIEx (dest, part);
					nestGroup--;
					addLn (dest, partEnd+"\tEnd Inclusion Group", nestGroup);
					colorcoded.push (["]", colorCode.IExGroup]);
					expr = canRepeat (dest, expr, "any character in this group");
					break;
				}
				addLn (dest, expr.substr(0,1)+"\tError: Unmatched Open Square Bracket", nestGroup);
				colorcoded.push (["[", colorCode.Error]);
				expr = expr.substr(1);
				break;

			case '(':
				part = getParen (expr.substr(0,1), expr);
			//	addLn (dest, "Substring: <"+part+">");
				if (part.length > 0)
				{
					expr = expr.substr(part.length);
					var modifiers = part.match (/^\(\?([smix]*)(-?)([smix]?)\)$/);
					if (modifiers)
					{
						var result = '';
						if ((modifiers[1].length + modifiers[3].length) == 1)
						{
						//	addLn (dest, modifiers.join (", "));
							switch (modifiers[1])
							{
								case 'i':
									ignoreCase = true;
									if (groupStack.length > 1)
										result = "Ignore Case On: search expression is case-insensitive from this point on to the end of this group";
									else
										result = "Ignore Case On: search expression is case-insensitive from this point on";
									break;
								case 'm':
									multilineMode = true;
									if (groupStack.length > 1)
										result = "Multiline Mode On until the end of this group: ^ and $ match Start/End of Story/Footnote/Cell, Paragraph Return, and Soft Line Break";
									else
										result = "Multiline Mode On: ^ and $ match Start/End of Story/Footnote/Cell, Paragraph Return, and Soft Line Break";
									break;
								case 's':
									singleLineMode = true;
									if (groupStack.length > 1)
										result = "Single-line Mode On until the end of this group: . also matches Paragraph Break and Soft Line Break";
									else
										result = "Single-line Mode On: . also matches Paragraph Break and Soft Line Break";
									break;
								case 'x':
									ignoreWhitespace = true;
									if (groupStack.length > 1)
										result = "Ignore Whitespace Mode On: ignore all spaces until the end of this group";
									else
										result = "Ignore Whitespace Mode On: ignore all spaces until the end of this expression";
									break;
							}
							switch (modifiers[3])
							{
								case 'i':
									ignoreCase = false;
									if (groupStack.length > 1)
										result = "Ignore Case Off: search expression is case-sensitive from this point on to the end of this group";
									else
										result = "Ignore Case Off: search expression is case-sensitive from this point on";
									break;
								case 'm':
									multilineMode = false;
									if (groupStack.length > 1)
										result = "Multiline Mode Off until the end of this group: ^ and $ match Start/End of Story/Cell/Footnote, but not Paragraph Break or Soft Line Break";
									else
										result = "Multiline Mode Off: ^ and $ match Start/End of Story/Cell/Footnote, but not Paragraph Break or Soft Line Break";
									break;
								case 's':
									singleLineMode = false;
									if (groupStack.length > 1)
										result = "Single-line Mode Off until the end of this group: . does not match Paragraph Break or Soft Line Break";
									else
										result = "Single-line Mode Off: . does not match Paragraph Break or Soft Line Break";
									break;
								case 'x':
									ignoreWhitespace = false;
									if (groupStack.length > 1)
										result = "Ignore Whitespace Mode Off: match the spaces in this expression until the end of this group";
									else
										result = "Ignore Whitespace Mode Off: match the spaces in this expression";
									break;
							}
						} else
						{
							while (modifiers[1].length > 0)
							{
								switch (modifiers[1].substr(0,1))
								{
									case 'i':
										ignoreCase = true;
										if (result) result += "; ";
										result += "Ignore Case On";
										break;
									case 'm':
										multilineMode = true;
										if (result) result += "; ";
										result += "Multiline Mode On";
										break;
									case 's':
										singleLineMode = true;
										if (result) result += "; ";
										result += "Single-line Mode On";
										break;
									case 'x':
										ignoreWhitespace = true;
										if (result) result += "; ";
										result += "Ignore Whitespace Mode On";
										break;
								}
								modifiers[1] = modifiers[1].substr(1);
							}
						//	addLn (dest, modifiers.join (", "));
							switch (modifiers[3])
							{
								case 'i':
									ignoreCase = false;
									if (result) result += "; ";
									result += "Ignore Case Off";
									break;
								case 'm':
									multilineMode = false;
									if (result) result += "; ";
									result += "Multiline Mode Off";
									break;
								case 's':
									singleLineMode = false;
									if (result) result += "; ";
									result += "Single-line Mode Off";
									break;
								case 'x':
									ignoreWhitespace = false;
									if (result) result += "; ";
									result += "Ignore Whitespace Mode Off";
									break;
							}
							if (groupStack.length > 1)
								result += "; all until the end of the current group";
						}
						if (modifiers[2].length == 1 && modifiers[3].length == 0)
						{
							if (modifiers[1].length == 0)
								result = "Note: no modifiers given -- expected s, m, i, or x before (On) or after (Off) hyphen";
							else
								result += "; Note: no modifiers given after hyphen -- expected s, m, i, or x";
						}
						addLn (dest, part+"\t"+result, nestGroup);
						colorcoded.push ([part, colorCode.ModGroup]);
						break;
					}


					nestGroup++;

					var modifiers = part.match (/^\(\?([smix]*)(-?)([smix]?):/);
					if (modifiers)
					{
						if (modifiers[1].length+modifiers[3].length == 0)
						{
							if (modifiers[2])
								addLn (dest, part.substr(0,3)+"\tNon-Marking Group (un-numbered); hyphen is ignored", nestGroup-1);
							else
								addLn (dest, part.substr(0,3)+"\tNon-Marking Group (un-numbered)", nestGroup-1);
							colorcoded.push ([part.substr(0,3)+"_N", colorCode.NGroup]);
							partEnd = part.substr(part.length-1);
							part = part.substr(3,part.length-4);
							if (part == '')
								addLn (dest, "Warning: Nothing in Non-Marking Group", nestGroup);
							else
							{
								groupStack.push ( "N" );
								explainGrep (dest, part);
								groupStack.pop();
							}
							nestGroup--;
							colorcoded.push ([")N", colorCode.NGroup]);
							addLn (dest, partEnd+"\tEnd Non-Marking Group", nestGroup);
							expr = canRepeat (dest, expr, "the Non-Marking Group");
							break;
						}
						if (modifiers[1].length+modifiers[3].length == 1)
						{
							if (modifiers[3].length)
								modifiers[3] = "-"+modifiers[3];
							var result = '';
							switch (modifiers[1]+modifiers[3])
							{
								case "i":
									addLn (dest, part.substr(0,4)+"\tIgnore Case Group", nestGroup-1);
									colorcoded.push ([part.substr(0,4)+"_i", colorCode.ModGroup]);
									partEnd = part.substr(part.length-1);
									part = part.substr(4,part.length-5);
									if (part == '')
										addLn (dest, "Warning: Nothing to ignore case in", nestGroup);
									else
									{
										var prevIgn = ignoreCase;
										ignoreCase = true;
										groupStack.push ( "i" );
										explainGrep (dest, part);
										groupStack.pop();
										ignoreCase = prevIgn;
									}
									nestGroup--;
									addLn (dest, partEnd+"\tEnd Ignore Case Group", nestGroup);
									colorcoded.push ([")i", colorCode.ModGroup]);
									expr = canRepeat (dest, expr, "the Ignore Case Group");
									break;
								case "-i":
									addLn (dest, part.substr(0,5)+"\tHonor Case Group", nestGroup-1);
									colorcoded.push ([part.substr(0,5), colorCode.ModGroup]);
									partEnd = part.substr(part.length-1);
									part = part.substr(5,part.length-6);
									if (part == '')
										addLn (dest, "Warning: Nothing to honor case in", nestGroup);
									else
									{
										var prevIgn = ignoreCase;
										ignoreCase = false;
										groupStack.push ( "i" );
										explainGrep (dest, part);
										groupStack.pop();
										ignoreCase = prevIgn;
									}
									nestGroup--;
									addLn (dest, partEnd+"\tEnd Honor Case Group", nestGroup);
									colorcoded.push ([")i", colorCode.ModGroup]);
									expr = canRepeat (dest, expr, "the Honor Case Group");
									break;

								case "m":
									addLn (dest, part.substr(0,4)+"\tBegin Multiline Mode Group", nestGroup-1);
									colorcoded.push ([part.substr(0,4)+"_M", colorCode.ModGroup]);
									partEnd = part.substr(part.length-1);
									part = part.substr(4,part.length-5);
									if (part == '')
										addLn (dest, "Warning: Nothing in Multiline Mode Group", nestGroup);
									else
									{
										var prevIgn = multilineMode;
										multilineMode = true;
										groupStack.push ( "M" );
										explainGrep (dest, part);
										groupStack.pop();
										multilineMode = prevIgn;
									}
									nestGroup--;
									addLn (dest, partEnd+"\tEnd Multiline Mode Group", nestGroup);
									colorcoded.push ([")M", colorCode.ModGroup]);
									expr = canRepeat (dest, expr, "the Multiline Mode Group");
									break;
								case "-m":
									addLn (dest, part.substr(0,5)+"\tBegin Multiline Mode Off Group", nestGroup-1);
									colorcoded.push ([part.substr(0,5), colorCode.ModGroup]);
									partEnd = part.substr(part.length-1);
									part = part.substr(5,part.length-6);
									if (part == '')
										addLn (dest, "Warning: Nothing in Multiline Mode Group", nestGroup);
									else
									{
										var prevIgn = multilineMode;
										multilineMode = false;
										groupStack.push ( "M" );
										explainGrep (dest, part);
										groupStack.pop();
										multilineMode = prevIgn;
									}
									nestGroup--;
									addLn (dest, partEnd+"\tEnd Multiline Mode Off Group", nestGroup);
									colorcoded.push ([")M", colorCode.ModGroup]);
									expr = canRepeat (dest, expr, "the Multiline Mode Off Group");
									break;

								case "s":
									addLn (dest, part.substr(0,4)+"\tBegin Single-line Mode Group", nestGroup-1);
									colorcoded.push ([part.substr(0,4), colorCode.ModGroup]);
									partEnd = part.substr(part.length-1);
									part = part.substr(4,part.length-5);
									if (part == '')
										addLn (dest, "Warning: Nothing in Single-line Mode Group", nestGroup);
									else
									{
										var prevIgn = multilineMode;
										multilineMode = true;
										groupStack.push ( "S" );
										explainGrep (dest, part);
										groupStack.pop();
										multilineMode = prevIgn;
									}
									nestGroup--;
									addLn (dest, partEnd+"\tEnd Single-line Mode Group", nestGroup);
									colorcoded.push ([")S", colorCode.ModGroup]);
									expr = canRepeat (dest, expr, "the Single-line Group");
									break;
								case "-s":
									addLn (dest, part.substr(0,5)+"\tBegin Single-line Mode Off Group", nestGroup-1);
									colorcoded.push ([part.substr(0,5), colorCode.ModGroup]);
									partEnd = part.substr(part.length-1);
									part = part.substr(5,part.length-6);
									if (part == '')
										addLn (dest, "Warning: Nothing in Single-line Mode Group", nestGroup);
									else
									{
										var prevIgn = multilineMode;
										multilineMode = false;
										groupStack.push ( "S" );
										explainGrep (dest, part);
										groupStack.pop();
										multilineMode = prevIgn;
									}
									nestGroup--;
									addLn (dest, partEnd+"\tEnd Single-line Mode Off Group", nestGroup);
									colorcoded.push ([")S", colorCode.ModGroup]);
									expr = canRepeat (dest, expr, "the Single-line Off Group");
									break;
			
								case "x":
									addLn (dest, part.substr(0,4)+"\tIgnore Whitespace Group", nestGroup-1);
									colorcoded.push ([part.substr(0,4)+"_X", colorCode.ModGroup]);
									partEnd = part.substr(part.length-1);
									part = part.substr(4,part.length-5);
									if (part == '')
										addLn (dest, "Warning: Nothing to ignore whitespace in", nestGroup);
									else
									{
									/*	if (part.indexOf('#') > -1)
										{
											addLn (dest, part+expr+"\tComment (invalid)", nestGroup);
											colorcoded.push ([part+expr, colorCode.Error]);
											expr = '';
											break;
										} */
										var prevIgn = ignoreWhitespace;
										ignoreWhitespace = true;
										groupStack.push ( "X" );
										explainGrep (dest, part);
										groupStack.pop();
										if (badCommentInIgnWhite)
										{
											colorcoded.push ([")"+expr, colorCode.Error]);
											addLn (dest, ")"+expr+"\tEnd Ignore Whitespace Group (invalid)", nestGroup);
											expr = '';
											break;
										}
										ignoreWhitespace = prevIgn;
									}
									nestGroup--;
									addLn (dest, partEnd+"\tEnd Ignore Whitespace Group", nestGroup);
									colorcoded.push ([")X", colorCode.ModGroup]);
									expr = canRepeat (dest, expr, "the Ignore Whitespace Group");
									break;

								case "-x":
									addLn (dest, part.substr(0,5)+"\tHonor Whitespace Group", nestGroup-1);
									colorcoded.push ([part.substr(0,5)+"_X", colorCode.ModGroup]);
									partEnd = part.substr(part.length-1);
									part = part.substr(5,part.length-6);
									if (part == '')
										addLn (dest, "Warning: Nothing to honor whitespace in", nestGroup);
									else
									{
										groupStack.push ( "X" );
										explainGrep (dest, part);
										groupStack.pop();
									}
									nestGroup--;
									addLn (dest, partEnd+"\tEnd Honor Whitespace Group", nestGroup);
									colorcoded.push ([")X", colorCode.ModGroup]);
									expr = canRepeat (dest, expr, "the Honor Whitespace Group");
									break;
							}
							break;
						}
						
						result = '';
						str = modifiers[1];

						var oldIgn = ignoreCase;
						var oldMulti = multilineMode;
						var oldSingle = singleLineMode;
						var oldWhite = ignoreWhitespace;
						while (str.length > 0)
						{
							switch (str.substr(0,1))
							{
								case 'i':
									ignoreCase = true;
									if (result) result += "; ";
									result += "Ignore Case On";
									break;
								case 'm':
									multilineMode = true;
									if (result) result += "; ";
									result += "Multiline Mode On";
									break;
								case 's':
									singleLineMode = true;
									if (result) result += "; ";
									result += "Single-line Mode On";
									break;
								case 'x':
									ignoreWhitespace = true;
									if (result) result += "; ";
									result += "Ignore Whitespace Mode On";
									break;
							}
							str = str.substr(1);
						}
						str = modifiers[3];
						while (str.length > 0)
						{
							switch (str.substr(0,1))
							{
								case 'i':
									ignoreCase = false;
									if (result) result += "; ";
									result += "Ignore Case Off";
									break;
								case 'm':
									multilineMode = false;
									if (result) result += "; ";
									result += "Multiline Mode Off";
									break;
								case 's':
									singleLineMode = false;
									if (result) result += "; ";
									result += "Single-line Mode Off";
									break;
								case 'x':
									ignoreWhitespace = false;
									if (result) result += "; ";
									result += "Ignore Whitespace Mode Off";
									break;
							}
							str = str.substr(1);
						}

						addLn (dest, modifiers[0]+"\tCombined Modifier Group: "+result, nestGroup-1);
						colorcoded.push ([modifiers[0]+"_*", colorCode.ModGroup]);
						part = part.substr(modifiers[0].length);
						part = part.substr(0,part.length-1);
						if (part == '')
							addLn (dest, "Warning: Nothing in Combined Modifier Group", nestGroup);
						else
						{
							groupStack.push ( "*" );
							explainGrep (dest, part);
							groupStack.pop();
						}
						nestGroup--;
						addLn (dest, ")\tEnd Combined Modifier Group", nestGroup);
						colorcoded.push ([")*", colorCode.ModGroup]);
						expr = canRepeat (dest, expr, "the Combined Modifier Group");

						ignoreCase = oldIgn;
						multilineMode = oldMulti;
						singleLineMode = oldSingle;
						ignoreWhitespace = oldWhite;

						break;
					}

				//	addLn (dest, "["+part+"]");

					if (part.substr(0,3) == "(?#")
					{
						addLn (dest, part.substr(0,3)+"\tBegin Comment", nestGroup-1);
						colorcoded.push([part.substr(0,3), colorCode.CommentG]);
						partEnd = part.substr(part.length-1);
						part = part.substr(3,part.length-4);
						addLn (dest, part+"\tComment", nestGroup);
						colorcoded.push([part, colorCode.Comment]);
						nestGroup--;
						addLn (dest, partEnd+"\tEnd Comment", nestGroup);
						colorcoded.push([partEnd, colorCode.CommentG]);
						break;
					}

					if (part.substr(0,3) == "(?(")
					{
						str = part.match(/^\(\?\((\d+)\)/);
						if (str != null)
						{
						//	addLn (dest, "["+str+"]");
						//	str = part.match(/\d+/);
							str = str[1];
							if (str < 1 || str > numGroup)
							{
								nestGroup--;
								addLn (dest, part+"\tError: Bad If/Then Group (Group "+str+" is undefined)", nestGroup-1);
								colorcoded.push ([part, colorCode.Error]);
								part = part.substr(3);
								break;
							}
							str = String(str);
							addLn (dest, part.substr(0,4+str.length)+"\tBegin If/Then if Group #"+str+" found something", nestGroup-1);
							colorcoded.push ([part.substring(0,5), colorCode.CGroup]);
							partEnd = part.substr(part.length-1);
							part = part.substr(4+str.length,part.length-5-str.length);
							if (part == null || part == '')
							{
								colorcoded.push (["(Empty)", colorCode.Error]);
								addLn (dest, "Error: Nothing in If/Then Next Match", nestGroup);
							} else
							{
								groupStack.push ( "?" );
								explainGrep (dest, part);
								groupStack.pop();
							}
							nestGroup--;
							addLn (dest, partEnd+"\tEnd If/Then", nestGroup);
							colorcoded.push ([partEnd, colorCode.CGroup]);
							expr = canRepeat (dest, expr, "this last group");
							break;
						}
						str = part.match (/^\(\?\(\?(<!|<=|=|!)/);
						if (str)
						{
							part = part.substr(2,part.length-3);
						//	addLn (dest, "testing cond.="+part);
							var lookfor = getParen ("(", part);
						//	addLn (dest, "is ["+lookfor+"]");
							part = part.substr(lookfor.length);

							colorcoded.push (["(?", colorCode.Group]);
						//	addLn (dest, "["+str.join("] [")+"]");

							addLn (dest, "(?\tIf this matches ...", nestGroup-1);

							groupStack.push ( "?" );
							explainGrep (dest, lookfor);
							groupStack.pop();

							addLn (dest, "\t... then match ...", nestGroup-1);

							if (part == null || part == '')
							{
								colorcoded.push (["(Empty)", colorCode.Error]);
								addLn (dest, "Error: Nothing in If/Then Next Match", nestGroup);
							} else
							{
								groupStack.push ( "?" );
								explainGrep (dest, part);
								groupStack.pop();
							}
							nestGroup--;
							addLn (dest, ")\tEnd If/Then", nestGroup);
							colorcoded.push ([")?", colorCode.Group]);
							expr = canRepeat (dest, expr, "this last group");
							break;
						}
						
						nestGroup--;
						addLn (dest, part+"\tError: Malformed If/Then Group", nestGroup-1);
						break;
					}

					if (part.substr(0,3) == "(?>")
					{
						addLn (dest, part.substr(0,3)+"\tBegin Atomic Group: Stop at first match found", nestGroup-1);
						colorcoded.push ([part.substr(0,3)+"_A", colorCode.AGroup]);
						partEnd = part.substr(part.length-1);
						part = part.substr(3,part.length-4);
						if (part == '')
							addLn (dest, "Warning: Nothing in Atomic Group", nestGroup);
						else
						{
							groupStack.push ( "A" );
							explainGrep (dest, part);
							groupStack.pop();
						}
						nestGroup--;
						addLn (dest, partEnd+"\tEnd Atomic Group", nestGroup);
						colorcoded.push ([")A", colorCode.AGroup]);
						break;
					}

					if (part.substr(0,3) == "(?=")
					{
						addLn (dest, part.substr(0,3)+"\tLookahead Group", nestGroup-1);
						colorcoded.push ([part.substr(0,3)+"_=", colorCode.LGroup]);

						partEnd = part.substr(part.length-1);
						part = part.substr(3,part.length-4);
						if (part == '')
						{
							addLn (dest, "Error: Nothing to look ahead for", nestGroup);
							colorcoded.push (["(Empty)", colorCode.Error]);
						} else
						{
							groupStack.push ( "=" );
							explainGrep (dest, part);
							groupStack.pop();
						}
						nestGroup--;
						addLn (dest, partEnd+"\tEnd Lookahead Group", nestGroup);
						colorcoded.push ([")=", colorCode.LGroup]);
						break;
					}
					if (part.substr(0,4) == "(?<=")
					{
						addLn (dest, part.substr(0,4)+"\tLookbehind Group", nestGroup-1);
						colorcoded.push ([part.substr(0,4)+"_<", colorCode.LGroup]);
						partEnd = part.substr(part.length-1);
						part = part.substr(4,part.length-5);
						if (part == '')
						{
							addLn (dest, "Error: Nothing to look behind for", nestGroup);
							colorcoded.push (["(Empty)", colorCode.Error]);
						} else
						{
							groupStack.push ( "<" );
							explainGrep (dest, part);
							groupStack.pop();
						}
						nestGroup--;
						addLn (dest, partEnd+"\tEnd Lookbehind Group", nestGroup);
						colorcoded.push ([")<", colorCode.LGroup]);
						break;
					}
					if (part.substr(0,3) == "(?!")
					{
						addLn (dest, part.substr(0,3)+"\tNegative Lookahead Group", nestGroup-1);
						colorcoded.push ([part.substr(0,3)+"_!", colorCode.LGroup]);
						partEnd = part.substr(part.length-1);
						part = part.substr(3,part.length-4);
						if (part == '')
						{
							colorcoded.push (["(Empty)", colorCode.Error]);
							addLn (dest, "Error: Nothing to not look ahead for", nestGroup);
						} else
						{
							groupStack.push ( "!" );
							explainGrep (dest, part);
							groupStack.pop();
						}
						nestGroup--;
						addLn (dest, partEnd+"\tEnd Negative Lookahead Group", nestGroup);
						colorcoded.push ([")!", colorCode.LGroup]);
						break;
					}
					if (part.substr(0,4) == "(?<!")
					{
						addLn (dest, part.substr(0,4)+"\tNegative Lookbehind Group", nestGroup-1);
						colorcoded.push ([part.substr(0,4)+"_<!", colorCode.LGroup]);
						partEnd = part.substr(part.length-1);
						part = part.substr(4,part.length-5);
						if (part == '')
						{
							addLn (dest, "Error: Nothing to not look behind for", nestGroup);
							colorcoded.push (["(Empty)", colorCode.Error]);
						} else
						{
							groupStack.push ( "<!" );
							explainGrep (dest, part);
							groupStack.pop();
						}
						nestGroup--;
						addLn (dest, partEnd+"\tEnd Negative Lookbehind Group", nestGroup);
						colorcoded.push ([")<!", colorCode.LGroup]);
						break;
					}

					if (part.substr(0,2) == "(?")
					{
						nestGroup--;
						addLn (dest, part+"\tError: Malformed ?-command", nestGroup);
						colorcoded.push ([part, colorCode.Error]);
						break;
					}

					numGroup++;
					currGroup = numGroup;
					
					addLn (dest, part.substr(0,1)+"\tBegin Group #"+currGroup, nestGroup-1);
					colorcoded.push (["("+currGroup, colorCode.Group]);
					partEnd = part.substr(part.length-1);
					part = part.substr(1,part.length-2);

					groupStack.push ( String(currGroup) );
					explainGrep (dest, part);
					groupStack.pop();

					nestGroup--;
					addLn (dest, partEnd+"\tEnd Group #"+currGroup, nestGroup);
					colorcoded.push ([currGroup+")", colorCode.Group]);
					expr = canRepeat (dest, expr, "the entire Group #"+currGroup);
			//	addLn (dest, "Why am I here?");
				} else
				{
					if (expr.substr(0,2) == "(?")
					{
						addLn (dest, expr.substr(0,2)+"\tError: Malformed ?-command ", nestGroup);
						colorcoded.push ([expr.substr(0,2), colorCode.Error]);
						expr = expr.substr(2);
					} else
					{
						addLn (dest, expr.substr(0,1)+"\tError: Unmatched Group Character "+expr.substr(0,1), nestGroup);
						colorcoded.push ([expr.substr(0,1), colorCode.Error]);
						expr = expr.substr(1);
					}
				}
				
				break;
			case '\\':

				//	\Octal? (max 4 characters, first *must* be zero)
				str = expr.match(/^\\0([0-7]{1,3})/);
				if (str)
				{
					var value = parseInt ("0"+str[1]);
					if (value >= 32 && value < 256)
					{
						value = String(value)+' = "'+NameForChar(String.fromCharCode(value))+'"';
					}
					addLn (dest, str[0]+"\tASCII character "+value, nestGroup);
					colorcoded.push ([str[0], colorCode.Escape]);
					expr = expr.substr(str[0].length);
					expr = canRepeat (dest, expr, "this character");
					break;
				}

				//	\xASCII hex?
				str = expr.match(/^\\x([0-9A-Fa-f][0-9A-Fa-f]?)/);
				if (str)
				{
					var value = parseInt ("0x"+str[1]);
					if (value >= 32 && value < 256)
					{
						value = String(value)+' = "'+NameForChar(String.fromCharCode(value))+'"';
					}
					addLn (dest, str[0]+"\tASCII character #"+value, nestGroup);
					colorcoded.push ([str[0], colorCode.Escape]);
					expr = expr.substr(str[0].length);
					expr = canRepeat (dest, expr, "this character");
					break;
				}

				//	\x{Unicode hex}?
				str = expr.match(/^\\x\{([0-9A-Fa-f]+)\}/);
				if (str)
				{
					var value = parseInt ("0x"+str[1]);
					if (value >= 32 && value <= 65535)
					{
						value = String(value)+' = "'+NameForChar(String.fromCharCode(value))+'"';
					}
					addLn (dest, str[0]+"\tUnicode character #"+value, nestGroup);
					colorcoded.push ([str[0], colorCode.Escape]);
					expr = expr.substr(str[0].length);
					expr = canRepeat (dest, expr, "this character");
					break;
				}
				
				//	\p{Unicode set}?
				if (expr.substr(0,2) == "\\p")
				{
					str = expr.match(/^\\p\{([-\sA-za-z_*]+)\}/);
					if (str)
					{
						var str2 = findPCode (pcodes, str[1]);
						if (!str2)
							str2 = findPCode (posixList, str[1]);
						if (str2)
						{
							addLn (dest, str[0]+'\tAny character in Unicode group "'+str2[1]+'"', nestGroup);
							colorcoded.push ([ "\\p{"+str2[0]+"}", colorCode.Operator]);
							expr = expr.substr(str[0].length);
							expr = canRepeat (dest, expr, "while any character is in this group,");
							break;
						}
						addLn (dest, expr.substr(0,str[0].length)+'\tError: Unknown Unicode group "'+str[1]+'"', nestGroup);
						colorcoded.push ([expr.substr(0,str[0].length), colorCode.Error]);
						expr = expr.substr(str[0].length);
						break;
					}
					str = expr.match(/^\\p(\{([-\sA-za-z_*]*)\}?)?/);
					addLn (dest, expr.substr(0,str[0].length)+'\tError: Malformed Unicode group', nestGroup);
					colorcoded.push ([expr.substr(0,str[0].length), colorCode.Error]);
					expr = expr.substr(str[0].length);
					break;
				}

				//	\P{Unicode set}?
				if (expr.substr(0,2) == "\\P")
				{
					str = expr.match(/^\\P\{([-\sA-za-z_*]+)\}/);
					if (str)
					{
						var str2 = findPCode (pcodes, str[1]);
						if (!str2)
							str2 = findPCode (posixList, str[1]);
						if (str2)
						{
							addLn (dest, str[0]+'\tAny character NOT in Unicode group "'+str2[1]+'" (including Return)', nestGroup);
							colorcoded.push ([ "\\P{"+str2[0]+"}", colorCode.Operator]);
							expr = expr.substr(str[0].length);
							expr = canRepeat (dest, expr, "while any character is NOT in this group,");
							break;
						}
						addLn (dest, expr.substr(0,1)+'\tError: Unknown Unicode group "'+str[1]+'"', nestGroup);
						colorcoded.push ([expr.substr(0,str.length), colorCode.Error]);
						expr = expr.substr(str.length);
						break;
					}
					str = expr.match(/^\\P(\{([- A-za-z0-9_*]*)\}?)?/);
					addLn (dest, expr.substr(0,str[0].length)+'\tError: Malformed Unicode group', nestGroup);
					colorcoded.push ([expr.substr(0,str[0].length), colorCode.Error]);
					expr = expr.substr(str[0].length);
					break;
				}

				// Control Character \cA to \cZ ?
				str = expr.match (/^\\c([a-zA-Z])/);
				if (str)
				{
					addLn (dest, str[0]+"\tControl character '"+str[1]+"' = ASCII code "+(str[1] > 'Z' ? str[1].charCodeAt(0)-96 : str[1].charCodeAt(0)-64), nestGroup);
					colorcoded.push ([str[0], colorCode.Operator]);
					expr = expr.substr(str[0].length);
					expr = canRepeat (dest, expr, "this control character");
					break;
				}

				// Any other escaped code?
				// This first one -- Suppress then Allow -- is a stinker!
				if (expr.substr(0,4) == "\\Q\\E")
				{
					addLn (dest, "\\Q\\E	Suppress, then immediately allow special characters -- no effect");
				//	colorcoded.push (["\\Q\\E", colorCode.Warning]);
					expr = expr.substr (4);
					break;
				}


				str = findCode (backslashCodes, expr.substr(1,1));
				if (str)
				{
				//	Sneek peek for repeat:
					if (expr.substr(1,1) != 'Q' && expr.match(/^..[\?\+\*]/))
					{
						expr = canRepeat (dest, expr.substr(2), str+";", expr.substr(0,2));
						break;
					}
					var lastChar = str;
					addLn (dest, expr.substr(0,2)+"\t"+str, nestGroup);

				//	Do not output \Q in color codes
					if (expr.substr(0,2) != "\\Q")
						colorcoded.push ([expr.substr(0,2), colorCode.Escape]);

			/*	//	Allow Suppressed special character -- an error, here!
					if (str == "\\E")
					{
						addLn (dest, str+"\tWarning: Literal character 'E'", nestGroup+1);
						colorcoded.push ([str, colorCode.Warning]);
						expr = expr.substr(2);
						break;
					} */

				//	Suppress special characters
					if (expr.substr(0,2) == "\\Q")
					{
						expr = expr.substr(2);
						str = '';
						while (expr.length)
						{
							if (expr.substr(0,2) == "\\E")
								break;
							lastChar = expr.substr(0,1);
							str += expr.substr(0,1);
							expr = expr.substr(1);
						}
						if (str.length)
						{
						/*	switch (str)
							{
								case ' ': addLn (dest, str+"\tA regular space", nestGroup+1); break;
								case '\u0009': addLn (dest, str+"\tA literal tab character", nestGroup+1); break;
								case '\u000a': addLn (dest, str+"\tA literal Line Break", nestGroup+1); break;
								case '\u000d': addLn (dest, str+"\tA literal Hard Return", nestGroup+1); break;
								case "'": addLn (dest, str+"\tAny single quote (straight, or single opening or closing curly quote)", nestGroup+1); break;
								case '"': addLn (dest, str+"\tAny double quote (straight, or double opening or closing curly quote)", nestGroup+1); break;
								default:
									if (ignoreCase && str.match(/[A-Za-z]/))
										addLn (dest, str+"\tLiteral text \""+str+"\" (case ignored)", nestGroup+1);
									else
										addLn (dest, str+"\tLiteral text \""+str+"\"", nestGroup+1);
							} */
							addLnForText (dest, str, nestGroup, ignoreCase);
							colorcoded.push ([str, colorCode.Text]);
						}
						if (expr.substr(0,2) == "\\E")
						{
							addLn (dest, expr.substr(0,2)+"\tAllow special characters again");
						//	colorcoded.push ([expr.substr(0,2), colorCode.Escape]);
							expr = expr.substr(2);
							if (lastChar == 9)
								lastChar = "Tab";
							else if (lastChar == ' ')
								lastChar = "Space";
							else
								lastChar = 'the character "'+lastChar+'"';
							expr = canRepeat (dest, expr, lastChar);
						}
						break;
					}
					expr = expr.substr(2);
					expr = canRepeat (dest, expr, 'the code "'+lastChar+'"');
					break;
				}
				if (expr.length == 1)
				{
					addLn (dest, expr.substr(0,1)+"\tA single backslash (safer to use '\\\\')", nestGroup);
					colorcoded.push ([expr.substr(0,1), colorCode.Warning]);
					expr = expr.substr(1);
				} else
				{
					addLn (dest, expr.substr(0,2)+"\tUnnecessary escaped character (safer to use '"+expr.substr(1,1)+"')", nestGroup);
					colorcoded.push ([expr.substr(0,2), colorCode.Warning]);
					expr = expr.substr(2);
					expr = canRepeat (dest, expr, 'the character "'+expr.substr(1,1)+'"');
				}
				break;
				
			// InDesign tilde code?
			case '~':
				str = findCode (tildeCodes, expr.substr(1,1));
				if (str)
				{
					addLn (dest, expr.substr(0,2)+"\t"+str, nestGroup);
					colorcoded.push ([expr.substr(0,2), colorCode.Tilde]);
					expr = expr.substr(2);
			//	addLn (dest, "Remaining: {"+expr+"}");
					expr = canRepeat (dest, expr, 'the code for "'+str+'"');
					break;
				}
				// Not all next characters are good ... These are tested and give an error.
				if (expr.length > 1 && expr.substr(1,1).match(/[$^().+]/))
				{
					addLn (dest, expr.substr(0,2)+"\tError: Unknown escaped tilde sequence", nestGroup);
					colorcoded.push ([expr.substr(0,2), colorCode.Error]);
					expr = expr.substr(2);
				} else
				{
					addLn (dest, expr.substr(0,1)+"\tA single tilde (Warning: Safer to use '\\~')", nestGroup);
					colorcoded.push ([expr.substr(0,1), colorCode.Warning]);
					expr = expr.substr(1);
					expr = canRepeat (dest, expr, "the tilde");
				}
				break;

			case '.':
				if (singleLineMode)
					addLn (dest, expr.substr(0,1)+"\tAny single character (incl. Paragraph Break or Soft Line Break)", nestGroup);
				else
					addLn (dest, expr.substr(0,1)+"\tAny single character", nestGroup);
				colorcoded.push ([expr.substr(0,1), colorCode.Operator]);
				expr = expr.substr(1);
				expr = canRepeat (dest, expr, "matching any character");
				break;
		/*	case '?':
				if (expr.substr(1,1) == "?")
				{
					addLn (dest, expr.substr(0,2)+"\tPrevious command, zero or once (shortest match; effectively 'never')", nestGroup);
					colorcoded.push ([expr.substr(0,2), colorCode.Repeat]);
					expr = expr.substr(2);
				} else
				{
					addLn (dest, expr.substr(0,1)+"\tPrevious command, zero or once (longest match)", nestGroup);
					colorcoded.push ([expr.substr(0,1), colorCode.Repeat]);
					expr = expr.substr(1);
				}
				break;
			case '+':
				if (expr.substr(1,1) == "?")
				{
					addLn (dest, expr.substr(0,2)+"\tPrevious command, once or more (shortest match)", nestGroup);
					colorcoded.push ([expr.substr(0,2), colorCode.Repeat]);
					expr = expr.substr(2);
				} else
				{
					addLn (dest, expr.substr(0,1)+"\tPrevious command, once or more (longest match)", nestGroup);
					colorcoded.push ([expr.substr(0,1), colorCode.Repeat]);
					expr = expr.substr(1);
				}
				break;
			case '*':
				if (expr.substr(1,1) == "?")
				{
					addLn (dest, expr.substr(0,2)+"\tPrevious command, zero or more (shortest match)", nestGroup);
					colorcoded.push ([expr.substr(0,2), colorCode.Repeat]);
					expr = expr.substr(2);
				} else
				{
					addLn (dest, expr.substr(0,1)+"\tPrevious command, zero or more (longest match)", nestGroup);
					colorcoded.push ([expr.substr(0,1), colorCode.Repeat]);
					expr = expr.substr(1);
				}
				break; */


			// Single character handling
			default:
				switch (expr.substr(0,1))
				{
					// Various :-p
					case ')': case ']':
						addLn (dest, expr.substr(0,1)+"\tError: Unmatched End Group Character '"+expr.substr(0,1)+"'", nestGroup);
						colorcoded.push ([expr.substr(0,1), colorCode.Error]);
						expr = expr.substr(1);
						break;
						
					// OR operator
					case '|':
						if (groupStack.length > 0)
						{
							if (groupStack[groupStack.length-1] == "?")
							{
								groupStack[groupStack.length-1] = "-";
								addLn (dest, expr.substr(0,1)+"\t.. else match ..", nestGroup);
								colorcoded.push(["|?", colorCode.Group]);
								expr = expr.substr(1);
								break;
							}
							if (groupStack[groupStack.length-1] == "-")
							{
								addLn (dest, expr.substr(0,1)+"\tInvalid: More than one ELSE", nestGroup);
								colorcoded.push(["|", colorCode.Error]);
								expr = expr.substr(1);
								break;
							}
						}
					
						if (groupStack.length > 0)
						{
							switch (groupStack[groupStack.length-1])
							{
								case "0":
									colorcoded.push(["|", colorCode.Group]);
									addLn (dest, expr.substr(0,1)+"\tMatch previous OR next part of this expression", nestGroup);
									break;
								case "*":
									colorcoded.push(["|"+groupStack[groupStack.length-1], colorCode.ModGroup]);
									addLn (dest, expr.substr(0,1)+"\tMatch previous part OR next part inside Multiple Modifier Group", nestGroup);
									break;
								case "A":
									colorcoded.push(["|"+groupStack[groupStack.length-1], colorCode.AGroup]);
									addLn (dest, expr.substr(0,1)+"\tMatch previous part OR next part inside Atomic Group", nestGroup);
									break;
								case "i":
									colorcoded.push(["|"+groupStack[groupStack.length-1], colorCode.ModGroup]);
									addLn (dest, expr.substr(0,1)+"\tMatch previous part OR next part inside Case Group", nestGroup);
									break;
								case "M":
									colorcoded.push(["|"+groupStack[groupStack.length-1], colorCode.ModGroup]);
									addLn (dest, expr.substr(0,1)+"\tMatch previous part OR next part inside Multiline Group", nestGroup);
									break;
								case "N":
									colorcoded.push(["|"+groupStack[groupStack.length-1], colorCode.LGroup]);
									addLn (dest, expr.substr(0,1)+"\tMatch previous part OR next part inside Non-marking Group", nestGroup);
									break;
								case "S":
									colorcoded.push(["|"+groupStack[groupStack.length-1], colorCode.ModGroup]);
									addLn (dest, expr.substr(0,1)+"\tMatch previous part OR next part inside Single-line Group", nestGroup);
									break;
								case "X":
									colorcoded.push(["|"+groupStack[groupStack.length-1], colorCode.ModGroup]);
									addLn (dest, expr.substr(0,1)+"\tMatch previous part OR next part inside Whitespace Group", nestGroup);
									break;
								case "=":
									colorcoded.push(["|"+groupStack[groupStack.length-1], colorCode.LGroup]);
									addLn (dest, expr.substr(0,1)+"\tMatch previous part OR next part inside Lookahead Group", nestGroup);
									break;
								case "!":
									colorcoded.push(["|"+groupStack[groupStack.length-1], colorCode.LGroup]);
									addLn (dest, expr.substr(0,1)+"\tMatch previous part OR next part inside Negative Lookahead Group", nestGroup);
									break;
								case "<":
									colorcoded.push(["|"+groupStack[groupStack.length-1], colorCode.LGroup]);
									addLn (dest, expr.substr(0,1)+"\tMatch previous part OR next part inside Lookbehind Group", nestGroup);
									break;
								case "<!":
									colorcoded.push(["|"+groupStack[groupStack.length-1], colorCode.LGroup]);
									addLn (dest, expr.substr(0,1)+"\tMatch previous part OR next part inside Negative Lookbehind Group", nestGroup);
									break;
								default:
									colorcoded.push(["|"+groupStack[groupStack.length-1], colorCode.Group]);
									addLn (dest, expr.substr(0,1)+"\tMatch previous part OR next part inside Group #"+groupStack[groupStack.length-1], nestGroup);
							}
						} else
						{
							colorcoded.push(["|", colorCode.Group]);
							addLn (dest, expr.substr(0,1)+"\tMatch previous OR next part of this expression", nestGroup);
						}
						expr = expr.substr(1);
						break;
						
					// Circumflex (hat)
					case '^':
						if (multilineMode)
							addLn (dest, expr.substr(0,1)+"\tStart of Paragraph, Story, Footnote, or Cell", nestGroup);
						else
							addLn (dest, expr.substr(0,1)+"\tStart of Story, Footnote, or Cell", nestGroup);
						colorcoded.push ([expr.substr(0,1), colorCode.Operator]);
						expr = expr.substr(1);
						break;
						
					// Dollar
					case '$':
						if (multilineMode)
							addLn (dest, expr.substr(0,1)+"\tEnd of Paragraph, Story, Footnote, or Cell", nestGroup);
						else
							addLn (dest, expr.substr(0,1)+"\tEnd of Story, Footnote, or Cell", nestGroup);
						colorcoded.push ([expr.substr(0,1), colorCode.Operator]);
						expr = expr.substr(1);
						break;


					default:
					
					/*	Any remaining ("normal", huh huh) characters.
						Some special care is needed for:
						1. Spaceless ("commenting") mode
						2. Comments in commenting mode.
						3. Repeat-modifiers at the end (even after spaces, in spaceless mode)
						4. Stinking "\Q\E" !!
					*/
					
						if (expr.substr(0,1) < ' ')
						{
							str = expr.charCodeAt(0);
							str = "\\x"+"0123456789ABCDEF".substr(str>>4,1)+"0123456789ABCDEF".substr(str & 15,1);
							addLn (dest, str+"\tLiteral character for ASCII code "+expr.charCodeAt(0), nestGroup);
							colorcoded.push ([str, colorCode.Escape]);
							expr = expr.substr(1);
							expr = canRepeat (dest, expr, "this character");
							break;
						}

						str = '';
						if ("([{}])\\~*.?+|^$".indexOf(expr.substr(0,1)) == -1)
						{
							if (ignoreWhitespace)
							{
								str = expr.match(/^((\S)[ \t]*)([*?+{])/);
								if (str && str[3])
								{
								//	addLn (dest, str.join(" - "));
									expr = expr.substr(str[1].length);
									str = str[2];
								//	colorcoded.push ([str, colorCode.Text]);
									if (str == ' ')
										expr = canRepeat (dest, expr, 'Space', str);
									else
										expr = canRepeat (dest, expr, 'the character "'+str+'"', str);
									break;
								}

								var spaceless = '';
								while (expr.length && "([{}])\\~*.?+|^$#".indexOf(expr.substr(0,1)) == -1)
								{
									if (expr.match(/^\S[ \t]*([*?+{]|\\Q\\E)/))
										break;
									str += expr.substr(0,1);
									if (!expr.substr(0,1).match(/\s/))
										spaceless += expr.substr(0,1);
									expr = expr.substr(1);
								}
								if (spaceless.length)
								{
								/*	if (ignoreCase && spaceless.match(/[A-Za-z\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u01bf\u01c4-\u0249\u0386-\u513\u1e00-\u1eff\u1f00-\u1fcc]/))
										addLn (dest, spaceless+"\tLiteral text \""+spaceless+"\" (ignoring case)", nestGroup);
									else
										addLn (dest, spaceless+"\tLiteral text \""+spaceless+"\"", nestGroup); */
									addLnForText (dest, str, nestGroup, ignoreCase);
								}
								str = spaceless;
							} else
							{
								if (expr.substr(1,4) == "\\Q\\E" && "*?+{".indexOf(expr.substr(5,1)) > -1)
								{
									str = expr.substr(0,1);
									expr = expr.substr(1);
								//	colorcoded.push ([str, colorCode.Text]);
									if (str == ' ')
										expr = canRepeat (dest, expr, 'Space', str);
									else
										expr = canRepeat (dest, expr, 'the character "'+str+'"', str);
									break;
								}
								if (expr.length > 1 && "*?+{".indexOf(expr.substr(1,1)) > -1)
								{
									str = expr.substr(0,1);
									expr = expr.substr(1);
								//	colorcoded.push ([str, colorCode.Text]);
									if (str == ' ')
										expr = canRepeat (dest, expr, 'Space', str);
									else
										expr = canRepeat (dest, expr, 'the character "'+str+'"', str);
									break;
								}

						//	addLn (dest, "["+expr+"] remaining");
							
								while (expr.length > 0 && expr.substr(0,1) >= ' ' && "([{}])\\~*.?+|^$".indexOf(expr.substr(0,1)) == -1)
								{
								/*	if (expr.length > 1 && "*?+{".indexOf(expr.substr(1,1)) > -1)
										break; */
									str += expr.substr(0,1);
									expr = expr.substr(1);
								}
								if (expr.length > 0 && expr.substr(0,4) == "\\Q\\E" && "*?+{".indexOf(expr.substr(4,1)) > -1)
								{
									expr = str.substr(str.length-1)+expr;
									str = str.substr(0,str.length-1);
								}
								if (expr.length > 0 && "*?+{".indexOf(expr.substr(0,1)) > -1)
								{
									expr = str.substr(str.length-1)+expr;
									str = str.substr(0,str.length-1);
								}
								if (str.match (/^ +$/))
								{
									if (str.length > 1)
										addLn (dest, str+"\t"+str.length+" Spaces", nestGroup);
									else
										addLn (dest, str+"\tSpace", nestGroup);
								} else
								{
								/*	if (ignoreCase && str.match(/[A-Za-z\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u01bf\u01c4-\u0249\u0386-\u513\u1e00-\u1eff\u1f00-\u1fcc]/))
										addLn (dest, str+"\tLiteral text \""+str+"\" (ignoring case)", nestGroup);
									else
										addLn (dest, str+"\tLiteral text \""+str+"\"", nestGroup); */
									addLnForText (dest, str, nestGroup, ignoreCase);
								}
							}
							if (str.length)	// "spaceless" may cause this to be empty
							{
								colorcoded.push ([str, colorCode.Text]);
							//	expr = canRepeat (dest, expr, 'the character \"'+str.substr(str.length-1)+'\"');
							}
						} else
						{
							addLn (dest, expr.substr(0,1)+"\tError: Unexpected special character!", nestGroup);
							colorcoded.push ([expr.substr(0,1), colorCode.Error]);
							expr = expr.substr(1);
						}
				}
		}
	}
}

function canRepeat (dest, expr, description, repeatThis)
{
	var parm, repeat, times;
	if (expr == null || expr == '') return '';

	if (ignoreWhitespace)
	{
		while (expr.length && " \u0009\u000a\u000d".indexOf(expr.substr(0,1)) > -1)
			expr = expr.substr(1);
	}
	if (expr.substr(0,4) == "\\Q\\E")
	{
		addLn (dest, "\\Q\\E	Suppress, then immediately allow special characters -- no effect");
	//	colorcoded.push (["\\Q\\E", colorCode.Warning]);
		expr = expr.substr (4);
	}
	parm = expr.match (/^(\?|\*|\+|\{\s*\d+\s*,?\s*?\d*\s*\})(\?)?/);
	if (!parm) return expr;

	if (description == null)
		description = "this";

//	addLn (dest, "{"+parm.join("} {")+"}");
//	addLn (dest, "{"+expr+"}");

	if (repeatThis)
		colorcoded.push([repeatThis, colorCode.RepeatTxt]);
	else
		repeatThis = '';

	var testEnd = expr.substr(parm[0].length);
	if (ignoreWhitespace)
	{
		testEnd = expr.match(/\s+(.+)/);
		if (testEnd)
			testEnd = ''+testEnd[1];
		else
			testEnd = '';
	}

	switch (parm[1])
	{
		case '?':
			description = description.substr(0,1).toUpperCase()+description.substr(1);
			colorcoded.push([parm[0], colorCode.Repeat]);
			if (parm[2])
			{
				if (testEnd == '')
					addLn (dest, repeatThis+parm[0]+"\t"+description+" may occur once, or not at all; shortest match will be taken (effectively never)", nestGroup);
				else
					addLn (dest, repeatThis+parm[0]+"\t"+description+" may occur once, or not at all; shortest match will be taken", nestGroup);
			} else
				addLn (dest, repeatThis+parm[0]+"\t"+description+" may occur once, or not at all", nestGroup);
		//	addLn (dest, expr.substr(parm[0].length));
			return expr.substr(parm[0].length);
		case '*':
			description = description.substr(0,1).toUpperCase()+description.substr(1);
			colorcoded.push([parm[0], colorCode.Repeat]);
			if (parm[2])
			{
				if (testEnd == '')
					addLn (dest, repeatThis+parm[0]+"\t"+description+" may occur zero or more times; shortest match will be taken (effectively never)", nestGroup);
				else
					addLn (dest, repeatThis+parm[0]+"\t"+description+" may occur zero or more times; shortest match will be taken", nestGroup);
			} else
				addLn (dest, repeatThis+parm[0]+"\t"+description+" may occur zero or more times; longest possible match will be taken", nestGroup);
			return expr.substr(parm[0].length);
		case '+':
			description = description.substr(0,1).toUpperCase()+description.substr(1);
			colorcoded.push([parm[0], colorCode.Repeat]);
			if (parm[2])
			{
				if (testEnd == '')
					addLn (dest, repeatThis+parm[0]+"\t"+description+" may occur once or more times; shortest match will be taken (effectively only once)", nestGroup);
				else
					addLn (dest, repeatThis+parm[0]+"\t"+description+" may occur once or more times; shortest match will be taken", nestGroup);
			} else
				addLn (dest, repeatThis+parm[0]+"\t"+description+" may occur once or more times; longest possible match will be taken", nestGroup);
			return expr.substr(parm[0].length);
	}
	// Coming here, we only have {d,d} left
	repeat = expr.match(/^\s*\{\s*(\d+)\s*(,)?\s*(\d*)\s*\}/);
	// Ought not to happen. Oh well.
	if (!repeat) return expr;

	if (repeat[2])	// Comma
	{
		if (repeat[3])
		{
			if (Number(repeat[1]) > Number(repeat[3]))
			{
				colorcoded.push([parm[0], colorCode.Error]);
				addLn (dest, repeatThis+parm[0]+"\tInvalid: Repeat "+description+" no less than "+repeat[1]+" AND no more than "+repeat[3]+" times", nestGroup);
				return expr.substr(parm[0].length);
			}
			if (Number(repeat[1]) == Number(repeat[3]))
			{
				colorcoded.push([parm[0], colorCode.Repeat]);
				times = repeat[1] == "1" ? " time" : " times";
				addLn (dest, repeatThis+parm[0]+"\tRepeat "+description+" always exactly "+repeat[1]+times, nestGroup);
				return expr.substr(parm[0].length);
			}
			colorcoded.push([parm[0], colorCode.Repeat]);
			times = repeat[3] == "1" ? " time" : " times";
			if (parm[2])	// Still question mark
			{
				if (testEnd == '')
					addLn (dest, repeatThis+parm[0]+"\tRepeat "+description+" at least "+repeat[1]+" and at most "+repeat[3]+times+", shortest match (effectively always "+repeat[1]+"x)", nestGroup);
				else
					addLn (dest, repeatThis+parm[0]+"\tRepeat "+description+" at least "+repeat[1]+" and at most "+repeat[3]+times+", shortest match", nestGroup);
			} else
				addLn (dest, repeatThis+parm[0]+"\tRepeat "+description+" at least "+repeat[1]+" and at most "+repeat[3]+times, nestGroup);
			return expr.substr(parm[0].length);
		} else
		{
			colorcoded.push([parm[0], colorCode.Repeat]);
			times = repeat[1] == "1" ? " time" : " times";
			if (parm[2])	// Still question mark
				addLn (dest, repeatThis+parm[0]+"\tRepeat "+description+" exactly "+repeat[1]+times+" (shortest match ignored)", nestGroup);
			else
				addLn (dest, repeatThis+parm[0]+"\tRepeat "+description+" at least "+repeat[1]+times+", as often as possible", nestGroup);
			return expr.substr(parm[0].length);
		}
	}
	colorcoded.push([parm[0], colorCode.Repeat]);

	times = repeat[1] == "1" ? " time" : " times";
	if (parm[2])	// Still question mark
		addLn (dest, repeatThis+parm[0]+"\tRepeat "+description+" exactly "+repeat[1]+times+" (shortest match ignored)", nestGroup);
	else
		addLn (dest, repeatThis+parm[0]+"\tRepeat "+description+" exactly "+repeat[1]+times, nestGroup);
	return expr.substr(parm[0].length);
}

function NameForChar (code)
{
	var value;

	do
	{
		if (code.length == 1)
		{
			if (code > ' ')
			{
				switch (code)
				{
					case ' ': return "Space";
					case "\u00a0": return "Non-breaking Space";
					case "\u00AD": return "Discretionary Hyphen";
				}
				return code;
			}
			value = code.charCodeAt(0);
			break;
		}
		value = code.match(/\\c([A-Za-z])$/);
		if (value)
		{
			value = value[1].charCodeAt(0)- 64;
			if (value > 26)
				value -= 32;
			break;
		}
		value = code.match(/\\x([0-9A-Fa-f]{1,2})$/);
		if (value)
		{
			value = parseInt("0x"+value[1]);
			break;
		}
		value = code.match(/\\x\{([0-9A-Fa-f]+)\}$/);
		if (value)
		{
			value = parseInt("0x"+value[1]);
			break;
		}
		return code;
	} while (0);

	switch (value)
	{
		case  0: return "NULL";
		case  3: return "End Nested Style";
		case  7: return "Indent To Here";
		case  8: return "Right Indent Tab";
		case  9: return "Tab";
		case 10: return "Soft Line Break";
		case 13: return "Paragraph Return";
		case 16: return "Dashed Arrow Down";	// Remove? Appears to be an error...
		case 24: return "Any Page Number Code";
		case 25: return "Section Marker Code";
		case 32: return "Space";
		case 160: return "Non-braking Space";
		case 0xad: return "Discretionary Hyphen";
		default:
			if (value < 32)
				return "\\x"+"0123456789ABCDEF".substr(value>>4,1)+"0123456789ABCDEF".substr(value & 15,1);
	}
	return code;
}

function explainIEx (dest, expr)
{
	var block,str,value;
	while (expr.length > 0)
	{
	//	Character Equivalent: [=x=]
	//	May repeat inside InEx group (!)

		block = nextIExBlock (expr);
		
		if (block == null)
			break;

	//	Error?
		if (block.length == 4)
		{
			addLn (dest, block[0]+"-"+block[1]+"\tAnything from '"+block[0]+"' to '"+block[1]+"'", nestGroup);
			colorcoded.push ([block[0]+"-"+block[1], colorCode.Error]);
			expr = block[2];
			addLn (dest, expr+"\tSyntax error!"+block[3], nestGroup);
		//	colorcoded.push ([expr, colorCode.Error]);
			return;
		}

	//	From..To?
		if (block.length == 3)
		{
			if (block[1] == '' && block[2] == '')
			{
			//	addLn (dest, "{"+block.join("} {")+"}");
				block[0] = block[2];
			} else
			{
				var left = block[0];
				var right = block[1];

				if (left.match(/\\c[A-Za-z]/))
				{
					left = left.substr(2).toUpperCase();
					left = String.fromCharCode(left.charCodeAt(0)-64);
				}
				if (left.match(/\\x[0-9A-Fa-f]{1,2}/))
				{
					value = left.match(/\\x([0-9A-Fa-f]{1,2})/);
					value = parseInt ("0x"+value[1]);
					if (value > 31 && value < 0xfffd)
						left = String.fromCharCode(value);
				}
				if (left.match(/\\x\{[0-9A-Fa-f]+\}/))
				{
					value = left.match(/\\x\{([0-9A-Fa-f]+)\}/);
					value = parseInt ("0x"+value[1]);
					if (value > 31 && value < 0xfffd)
						left = String.fromCharCode(value);
				}
				if (right.match(/\\c[A-Za-z]/))
				{
					right = right.substr(2).toUpperCase();
					right = String.fromCharCode(right.charCodeAt(0)-64);
				}
				if (right.match(/\\x[0-9A-Fa-f]{1,2}/))
				{
					value = right.match(/\\x([0-9A-Fa-f]{1,2})/);
					value = parseInt ("0x"+value[1]);
					if (value > 31 && value < 0xfffd)
						right = String.fromCharCode(value);
				}
				if (right.match(/\\x\{[0-9A-Fa-f]+\}/))
				{
					value = right.match(/\\x\{([0-9A-Fa-f]+)\}/);
					value = parseInt ("0x"+value[1]);
					if (value > 31 && value < 0xfffd)
						right = String.fromCharCode(value);
				}

				switch (left)
				{
					case "\\(": case '\\)':
					case "\\[": case "\\]":
					case "\\{": case "\\}":
					case "\\.":
					case "\\*": case "\\?": case "\\+":
					case "\\\\":
						left = left.substr(1);
						break;
				}
				switch (right)
				{
					case "\\(": case '\\)':
					case "\\[": case "\\]":
					case "\\{": case "\\}":
					case "\\.":
					case "\\*": case "\\?": case "\\+":
					case "\\\\":
						right = right.substr(1);
						break;
				}

			//	Test if left is a wildcard expression or class.
			//	Other flavors may convert to "\w" "-" "whatever" but ID does not.
				if (left.substr(0,2) == "\\p" ||
					left.substr(0,2) == "\\P" ||
					left.substr(0,2) == "[:" ||
					left.substr(0,2) == "[=" ||
					left == "\\w" ||
					left == "\\W" ||
					left == "\\d" ||
					left == "\\D" ||
					left == "\\s" ||
					left == "\\S" ||
					left == "\\u" ||
					left == "\\U" ||

					right.substr(0,2) == "\\p" ||
					right.substr(0,2) == "\\P" ||
					right.substr(0,2) == "[:" ||
					right.substr(0,2) == "[=" ||
					right == "\\w" ||
					right == "\\W" ||
					right == "\\d" ||
					right == "\\D" ||
					right == "\\s" ||
					right == "\\S" ||
					right == "\\u" ||
					right == "\\U"
					)
				{
					addLn (dest, block[0]+"-"+block[1]+"\tError: A from/to range may not contain wildcard sets", nestGroup);
					colorcoded.push ([block[0]+"-"+block[1], colorCode.Error]);
					expr = block[2];
					continue;
				}
				
				if (ignoreCase)
				{
				//	This is LOWERCASE: :-)
				//	A-\u{FFFF} is 0041-FFFF but does NOT match 005B
				//	Not ignoring case, A-\u{FFFF} DOES match 005B
					left = left.toLowerCase();
					right = right.toLowerCase();
				}

				if (left.length == 1 && right.length == 1 && left > right)
				{
					left = NameForChar (block[0]);
					right = NameForChar (block[1]);
					addLn (dest, block[0]+"-"+block[1]+"\tInvalid: '"+left+"' is greater than '"+right+"'", nestGroup);
					colorcoded.push ([block[0]+"-"+block[1], colorCode.Error]);
				}
				else
				{
					if (left == right)
					{
						left = NameForChar (block[0]);
						right = NameForChar (block[1]);
						addLn (dest, block[0]+"-"+block[1]+"\tA single character '"+left+"'", nestGroup);
					} else
					{
						left = NameForChar (block[0]);
						right = NameForChar (block[1]);
					/*	Gets too complicated ...
						if (left.length == 1 && right.length == 1 && left >= ' ' && left <= '~' && right >= ' ' && right <= '~' && right.charCodeAt(0) > left.charCodeAt(0)+6)
						{
							addLn (dest, block[0]+"-"+block[1]+"\tAnything from '"+left+String.fromCharCode(left.charCodeAt(0)+1)+String.fromCharCode(left.charCodeAt(0)+2)+"..' to '.."+String.fromCharCode(right.charCodeAt(0)-2)+String.fromCharCode(right.charCodeAt(0)-1)+right+"'", nestGroup);
						} else */
						addLn (dest, block[0]+"-"+block[1]+"\tAnything from '"+left+"' to '"+right+"'", nestGroup);
					}
					colorcoded.push ([block[0]+"-"+block[1], colorCode.IText]);
				}
				expr = block[2];
				continue;
			}
		}

//	addLn (debugframe, "{"+block[0]+"}");

		switch (block[0].substr(0,1))
		{
			case '\\':
				// Control Character \cA to \cZ ?
				value = block[0].match(/\\c([A-Za-z])/);
				if (value)
				{
					addLn (dest, block[0]+"\tControl character '"+value[1]+"' = ASCII code "+(value[1] > 'Z' ? value[1].charCodeAt(0)-96 : value[1].charCodeAt(0)-64), nestGroup);
					colorcoded.push ([block[0], colorCode.Operator]);
					expr = expr.substr(block[0].length);
					break;
				}
				if (block[0].match(/\\x[0-9A-Fa-f]{1,2}/))
				{
					value = block[0].match(/\\x([0-9A-Fa-f]{1,2})/);
					value = parseInt ("0x"+value[1]);
					if (value > 31 && value != 127)
						value = String(value)+' = "'+NameForChar(String.fromCharCode(value))+'"';
					else
						value = NameForChar(block[0]);

					addLn (dest, block[0]+"\tUnicode character "+value, nestGroup);
					colorcoded.push ([block[0], colorCode.Escape]);
					expr = expr.substr(block[0].length);
					break;
				}
				if (block[0].match(/\\x\{[0-9A-Fa-f]+\}/))
				{
					value = block[0].match(/\\x\{([0-9A-Fa-f]+)\}/);
					value = parseInt ("0x"+value[1]);
					if (value > 31)
						value = String(value)+' = "'+NameForChar(String.fromCharCode(value))+'"';
					else
						value = NameForChar(block[0]);

					addLn (dest, block[0]+"\tUnicode character "+value, nestGroup);
					colorcoded.push ([block[0], colorCode.Escape]);
					expr = expr.substr(block[0].length);
					break;
				}
				str = findCode (backslashCodes, block[0].substr(1,1));
				if (str)
				{
					addLn (dest, block[0]+"\t"+str, nestGroup);
					colorcoded.push ([block[0], colorCode.Escape]);
					expr = block[1];
				} else
				{
					addLn (dest, block[0]+'\tWarning: Unrecognized escaped code -- "'+block[0].substr(1,1)+'" gets used in match', nestGroup);
					colorcoded.push ([block[0], colorCode.Warning]);
					expr = block[1];
				}
				break;
			case '~':
				str = findCode (tildeCodes, block[0].substr(1,1));
				if (str)
				{
					addLn (dest, block[0]+"\t"+str, nestGroup);
					colorcoded.push ([block[0], colorCode.Tilde]);
					expr = block[1];
				} else
				{
					addLn (dest, block[0]+'\tWarning: Stray tilde (safer to use "\\~")', nestGroup);
					colorcoded.push (["~", colorCode.Warning]);
					expr = block[0].substr(1)+block[1];
				}
				break;
			case '[':
				if (block[0].match(/\[=.=\]/))
				{
					addLn (dest, block[0]+"\tAny character equivalent to '"+block[0].substr(2,1)+"'", nestGroup);
					colorcoded.push ([block[0], colorCode.IExGroup]);
					expr = block[1];
					break;
				}
				var str = block[0].match (/^\[:([-_\sA-Za-z]+):\]/);
				if (str)
				{
				//	addLn (debugframe, "!"+str[1]+"!");
					var group = findPCode (posixList, str[1]);
					if (!group)
						group = findPCode (pcodes, str[1]);
					if (group)
					{
						addLn (dest, str[0]+'\tAny character in POSIX group "'+group[1]+'"', nestGroup);
						colorcoded.push ([ "[:"+group[0]+":]", colorCode.IExGroup]);
						expr = block[0].substr(str[0].length)+block[1];
						break;
					}
				}
				addLn (dest, block[0]+"\tA literal character [", nestGroup);
				colorcoded.push ([block[0], colorCode.IText]);
				expr = block[1];
				break;
			default:
				if (block[0] == ' ')
					addLn (dest, block[0]+"\tA regular space", nestGroup);
				else
				if (block[0] == '\u0009')
					addLn (dest, block[0]+"\tA regular tab", nestGroup);
				else
				{
					var range = block[0]+block[1];
					range = range.match(/^(-?[^-\\~]+-)$/);
					if (!range)
					{
						range = block[0]+block[1];
						range = range.match(/^(-?[^-\\~]+)(?!-)/);
					}
					if (range && range.length > 1)
					{
						block[1] = block[0]+block[1];
						block[1] = block[1].substr(range[1].length);
						block[0] = range[1];
					/*	if (block[1] == '-')
						{
							block[0] += '-';
							block[1] = '';
						} */
						if (block[0].length == 1)
							addLn (dest, block[0]+'\tThe character "'+block[0]+'"', nestGroup);
						else
							addLn (dest, block[0]+"\tAny of these characters", nestGroup);
						expr = block[1];
					} else
						addLn (dest, block[0]+"\tA regular character", nestGroup);
				}
				colorcoded.push ([block[0], colorCode.IText]);
				expr = block[1];
		}
	}
}

function nextGrepExpr (expr)
{
	var str, repeats;
	
	switch (expr.substr(0,1))
	{
		case '\\':
			str = expr.match(/\\c[A-Za-z]/);
			if (str)
			{
				return [str, expr.substr(str.length) ];
			}
			str = expr.match(/\\x[0-9A-Fa-f]{1,2}/);
			if (str)
			{
				return [str, expr.substr(str.length) ];
			}
			str = expr.match(/\\x\{[0-9A-Fa-f]+\}/);
			if (str)
			{
				return [str, expr.substr(str.length) ];
			}

			str = findCode (backslashCodes, expr.substr(1,1));
			if (str)
			{
				str = expr.substr(0,2);
				expr = expr.substr(2);
				repeats = nextRepExpr (expr);
				if (repeats)
					return [ str, repeats[0], repeats[1] ];
				return [ str, expr ];
			}
			break;
		case '~':
			str = findCode (tildeCodes, expr.substr(1,1));
			if (str)
			{
				str = expr.substr(0,2);
				expr = expr.substr(2);
				repeats = nextRepExpr (expr);
				if (repeats)
					return [ str, repeats[0], repeats[1] ];
				return [ str, expr ];
			}
			break;
		case '(':
			str = getParen (expr.substr(0,1), expr);
			if (str.length > 0)
			{
				expr = expr.substr(str.length);
				repeats = nextRepExpr (expr);
				if (repeats)
					return [ str, repeats[0], repeats[1] ];
				return [ str, expr ];
			}
			break;
		case '[':
			str = getParen (expr.substr(0,1), expr);
			if (str.length > 0)
			{
				expr = expr.substr(str.length);
				repeats = nextRepExpr (expr);
				if (repeats)
					return [ str, repeats[0], repeats[1] ];
				return [ str, expr ];
			}
			break;
	}
	
	if ("([{}])\\~*.?+|^$".indexOf(expr.substr(0,1)) > -1)
		return [expr.substr(0,1), expr.substr(1) ];

	str = '';
	while (expr.length && "([{}])\\~*.?+|^$".indexOf(expr.substr(0,1)) == -1)
	{
		str += expr.substr(0,1);
		expr = expr.substr(1);

		repeats = nextRepExpr (expr.substr(1));
		if (repeats)
			return [ str, expr ];
	}
	repeats = nextRepExpr (expr);
	if (repeats)
		return [ str, repeats[0], repeats[1] ];

	return [ str, expr ];
}

function nextRepExpr (expr)
{
	var str;
	switch (expr.substr(0,1))
	{
		case '?':
		case '+':
		case '*':
			str = expr.substr(0,1);
			expr = expr.substr(1);
			if (expr.substr(0,1) == '?')
			{
				str += "?";
				expr = expr.substr(1);
			}
			return [str, expr];
		case '{':
			str = getParen (expr.substr(0,1), expr);
			if (str.length > 0)
			{
				expr = expr.substr(str.length);
				if (expr.substr(0,1) == '?')
				{
					str += "?";
					expr = expr.substr(1);
				}
				return [str, expr];
			}
			break;
	}
	return null;
}

function nextIExBlock (expr)
{
	var curr, next;

	curr = nextIExChar (expr);
	if (curr)
	{
		next = nextIExChar (curr[1]);
		if (next[0] == '-' && next[1])
		{
		//	Discard '-' for now
			next = nextIExChar (next[1]);
		//	addLn (frame, "{"+next.join("}{")+"}");
			if (next[1].substr(0,1) == '-' && next[1] != "-")
			{
				return [ curr[0], next[0], next[1], " From/to range is invalid" ];
			}

			return [curr[0], next[0], next[1]];
		}
	}
	return curr;
}

function nextIExChar (expr)
{
	var str;

//	addLn (debugframe, "{"+expr+"}");

	switch (expr.substr(0,1))
	{
		case '[':
			if (expr.match (/^\[=.=\]/))
				return [ expr.substr(0,5), expr.substr(5) ];
		//	addLn (debugframe, "oi!"+expr);
			str = expr.match (/^\[:[-_\sA-Za-z]+:\]/);
			if (str)
			{
		//	addLn (debugframe, "{"+str.join("}{")+"}");
				return [ expr.substr(0,str[0].length), expr.substr(str[0].length) ];
			}
			break;

		case '~':
			str = findCode (tildeCodes, expr.substr(1,1));
			if (str)
				return [ expr.substr(0,2), expr.substr(2) ];
			break;
		case '\\':
			// cA .. cZ
			str = expr.match(/^\\c[A-Za-z]/);
			if (str)
				return [ str[0], expr.substr(str[0].length) ];
		
			// x0 .. xF and x00 .. xFF
			str = expr.match(/\\x[0-9A-Fa-f]{1,2}/);
			if (str)
				return [ str[0], expr.substr(str[0].length) ];
				
			// x{0}..x{FFFFFFF} (etc.)
			str = expr.match(/\\x\{[0-9A-Fa-f]+\}/);
			if(str)
				return [ str[0], expr.substr(str[0].length) ];
		//	str = findCode (backslashCodes, expr.substr(1,1));
		//	if (str)
				return [ expr.substr(0,2), expr.substr(2) ];
			break;
	}
	return [ expr.substr(0,1), expr.substr(1) ];
}

function findCode (list, code)
{
	var i;
	for (i=0; i<list.length; i++)
		if (list[i][0] == code) return list[i][1];
	return null;
}

function findCodeCI (list, code)
{
	var i;
	code = code.toLowerCase();
	if (list[0].length == 2)
	{
		for (i=0; i<list.length; i++)
			if (list[i][0].toLowerCase() == code) return list[i][1];
	} else
	{
		for (i=0; i<list.length; i++)
			if (list[i][0].toLowerCase() == code || list[i][1].toLowerCase() == code) return list[i][2];
	}
	return null;
}


/* Return [ correct abbrev, explanation ]
*/
function findPCode (list, code)
{
	var i,l;
	if (code == null) return null;
	code = code.toLowerCase().replace(/[-_ ]/g, '');
	for (i=0; i<list.length; i++)
	{
		for (l=0; l<list[i].length-1; l++)
			if (list[i][l].toLowerCase() == code) return [list[i][l], list[i][list[i].length-1] ];
	}
	return null;
}


function getParen (matchFrom, expr)
{
	var count = 0;
	var index;
	var matchTo;


	if (matchFrom == '[')
	{
		if (expr.substr(0,1) != '[') return "";
		index = 1;
		
	//	If a bracket expression specifies both '-' and ']', the ']' shall be placed first (after the '^', if any) and the '-' last within the bracket expression.		
		if (expr.substr(index,1) == '^')
			index++;
		if (expr.substr(index,1) == ']')
			index++;
		while (index < expr.length)
		{
			if (expr.substr(index,1) == '\\' && index+1 < expr.length)
			{
				index += 2;
				continue;
			}
			if (expr.substr(index,1) == '~' && index+1 < expr.length-1)
			{
				index += 2;
				continue;
			}
			str = expr.substr(index).match(/^\[\...?\.\]/);
			if (str)
			{
				index += str[0].length;
				continue;
			}
			str = expr.substr(index).match(/^\[=.=\]/);
			if (str)
			{
				index += str[0].length;
				continue;
			}
			str = expr.substr(index).match(/^\[:[-_\sA-Za-z]+:\]/);
			if (str)
			{
				index += str[0].length;
				continue;
			}
			if (expr.substr(index,1) == "]")
				return expr.substr(0,index+1);
			index++;
		}
		return "";
	}

	switch (matchFrom)
	{
		case '(': matchTo = ')'; break;
		case '[': matchTo = ']'; break;
		default: return "";
	}

	index = 0;
	while (index < expr.length)
	{
		if (ignoreWhitespace && matchTo == ')' && expr.substr(index,1) == '#') return '';

		if (expr.substr(index,1) == '\\' && index+1 < expr.length)
		{
			index += 2;
			continue;
		}
		if (expr.substr(index,1) == matchFrom)
			count++;
		else if (expr.substr(index,1) == matchTo)
		{
			count--;
			if (count == 0)	// || matchTo == ']')
				return expr.substr(0,index+1);
		}
		index++;
	}
	return "";
}

function addLnForText (dest, text, nestGroup, ignoreCase)
{
	var ignoring = '';

	if (ignoreCase && text.match(/[A-Za-z\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u01bf\u01c4-\u0249\u0386-\u513\u1e00-\u1eff\u1f00-\u1fcc]/))
		ignoring = " (ignoring case)";

	switch (text)
	{
		case ' ': addLn (dest, text+"\tA regular space", nestGroup); break;
		case '\u0009': addLn (dest, text+"\tA literal tab character", nestGroup); break;
		case '\u000a': addLn (dest, text+"\tA literal Line Break", nestGroup); break;
		case '\u000d': addLn (dest, text+"\tA literal Hard Return", nestGroup); break;
		case "'": addLn (dest, text+"\tAny single quote (straight, or single opening or closing curly quote)", nestGroup); break;
		case '"': addLn (dest, text+"\tAny double quote (straight, or double opening or closing curly quote)", nestGroup); break;
		default:
			if (text.length == 1)
				addLn (dest, text+'\tLiteral character "'+text+'"'+ignoring, nestGroup);
			else
				addLn (dest, text+'\tLiteral text "'+text+'"'+ignoring, nestGroup);
	}
}

function addLn (dest, text, indent, line, color)
{
	var tabs = indent;
	var lastpt;

	if (tabs)
	{
		while (tabs > 0)
		{
			dest.insertionPoints[-1].contents = "\t";
			tabs--;
		}
	}
	tabs = text.lastIndexOf("\t");
	if (tabs > 0 && text.substr(tabs))
		text = text.substr(0,tabs+1)+"\u0007"+text.substr(tabs+1);

	dest.insertionPoints[-1].contents = text+"\r";

}