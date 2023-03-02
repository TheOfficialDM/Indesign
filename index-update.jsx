//DESCRIPTION: re-range page numbers
// Peter Kahrel

//#targetengine index_update;

// Globals  =======================================================================

var page_span = 1;
//var pairs = false;
var drop_digits = false;
var topic_separator = '%%';

/*=========================================================================================

Expand page ranges, sort, and do page ranges again. 
Handles arabic and roman page numbers.
Example: you start with this (topic separators must be used, here, %%):

Leech, G.%%ii, iv, 1, 2, 3, 7, 10, 21, 22, 23
Leech, G.%%iii, vi, 14, 6, 8, 9, 10, 15, 11, 22, 23

Combine this manually to get this (just delete the name on the second line):

Leech, G.%%ii, iv, 1, 2, 3, 7, 10, 21, 22, 23, iii, vi, 14, 6, 8, 9, 10, 15, 11, 22, 23

Run the script to get this:

Leech, G.%%ii–iv, vi, 1–3, 6–11, 14–15, 21–23

The script handles existing page ranges. If you start with this:

Leech, G.%%ii-iv, 1, 2, 3, 7, 10-14, 21-23
Leech, G.%%iii, vi, 6, 8-10, 14, 15, 11, 22, 23

Combine these manually to this:

Leech, G.%%ii-iv, 1, 2, 3, 7, 10-14, 21-23, iii, vi, 6, 8-10, 14, 15, 11, 22, 23

Run the script to get this:

Leech, G.%%ii–iv, vi, 1–3, 6–15, 21–23

The page_span variable controls if consecutive page numbers
are ranged (1, 2, 3 > 1-3) and if yes, by what margin.
'0' means 'no ranging at all'; '1' is the standard ranging of
consecutive numbers; '2' allows for gaps of one page. By increasing
the page_span, the spanner becomes more tolerant. Examples:

page_span = 0: page ranges are removed
page_span = 1: '1, 2, 3, 4, 6, 8' > '1-4, 6, 8'
page_span = 2: '1, 2, 3, 4, 6, 8' > '1-6, 8'
page_span = 3: '1, 2, 3, 4, 6, 8' > '1-8'
etc.

=========================================================================================*/

if (app.documents.length > 0 && app.selection.length > 0) {
	rerange_index ();
}

//------------------------------------------------------------------------------------------




function combineSameTopics (story) {

	function delHeads (paragraphs) {
		var le = paragraphs[0].contents.indexOf('%%') + 1;
		for (var i = paragraphs.length-1; i > 0; i--) {
			paragraphs[i].characters.itemByRange(0, le).contents = ', ';
			paragraphs[i-1].characters[-1].contents = '';
		}
	}		
	
	app.findGrepPreferences = null;
	app.findGrepPreferences.findWhat = '^(.+%%)(.+\\r\\1)+';
	found = app.selection[0].parentStory.findGrep();
	for (var i = found.length-1; i >= 0; i--) {
		delHeads (found[i].paragraphs.everyItem().getElements());
	}
}


function rerange_index () {
	var sel = app.selection[0];
	if (sel instanceof InsertionPoint) {
		var p = app.selection[0].paragraphs[0];
		var last = p.characters[-1].contents === '\r' ? -2 : -1;
		p.characters.itemByRange (0, last).contents = rerange_entry (p.contents);
	} else if (sel instanceof TextFrame) {
		var last, reranged;
		var story = app.selection[0].parentStory;
		//$.bp()
		combineSameTopics (story);
		var p = story.paragraphs.everyItem().getElements();
		for (var i = p.length-1; i > -1; i--) {
			reranged = rerange_entry (p[i].contents);
			if (reranged != '') {
				last = p[i].characters[-1].contents === '\r' ? -2 : -1;
				p[i].characters.itemByRange (0, last).contents = reranged;
			}
		}
	} else {
		alert ('Select insertion point or text frame.', 'Index re-range', true); 
	}
}


function rerange_entry (s) {
//~     var entry = s.match (/([^\d]+)(.+)/);
	// split s on the space between the entry and the first page number,
	// which can be arabic, roman, or a range of either. 'Page number' is therefore
	// defined as 'a space followed by a string consisting of hyphens, dashes, digits, 
	// and/or the letters i, v, x, followed by a comma'.
	if (s.indexOf('%%') < 0) {
		return '';
	}
	try {
		s = s.replace (/\s+$/, '');
		//var entry = s.match (/^(.+?\s)(?=[-ivxc\d\u2013]+)(.+)/)
		var entry = s.split('%%');
		// first part is the topic
		var topic = entry[0];
		// second part, the page numbers
		var p_nums = entry[1].replace (/\r$/,'');
		p_nums = p_nums.split (/, ?/);
		p_nums = rerange (p_nums).join (', ');
		if (drop_digits == true) {
			p_nums = dropdigits (p_nums);
		}
		return topic + '%%' + p_nums;
	} catch (_) {
		return '';
	}
}


function dropdigits (s) {
	s = s.replace (/\b(\d+)(\d+[-\u2013])\1(\d+)\b/g, '$1$2$3');
	s = s.replace (/(1\d[-\u2013])(\d)\b/g, '$11$2')
	return s
}


function rerange (s) {
	// split list into two: one roman, the other, arabic
	var page_nums = split_roman_arabic (s);
	page_nums.arabic = unrange_sort_range (page_nums.arabic);
	if (page_nums.roman.length > 2) {
		// convert roman numbers to arabic
		page_nums.roman = to_arabic (page_nums.roman);
		page_nums.roman = unrange_sort_range (page_nums.roman)
		// convert the arabic numbers in the roman list back to roman
		page_nums.roman = arabic_list_to_roman (page_nums.roman);
	}
	// concatenate the lists
	var page_nums = page_nums.roman.concat (page_nums.arabic);
	return page_nums
}


function unrange_sort_range (list) {
	list = unrange (list);
	list = list.sort (sort_arab);
	list = remove_doubles (list);
	list = range_pages (list)
	return list
}


// return two element object, each element an list,
// one of roman numbers, the other of arabic numbers

function split_roman_arabic (list) {
	var roman = [];
	var arab = [];
	for (var i = 0; i < list.length; i++) {
		if (list[i].match (/^[-\u2013\d]+$/) != null) {
			arab.push (list[i]);
		} else {
			roman.push (list[i]);
		}
	}
	return {roman: roman, arabic: arab}
}

/*
	To convert an list of roman numbers, convert to string, 
	then convert the numbers, finally convert back to list.
	This seems the easiest way to deal with page ranges.
*/

function to_arabic (list) {
	var s = list.join (',');
	s = s.replace (/(\w+)/g, romanToArabic)
	return s.split(',')
}


function arabic_list_to_roman (list) {
	var s = list.join (',');
	s = s.replace (/\w+/g, arabic2roman);
	list = s.split (',')
//~     for (var i = 0; i < list.length; i++)
//~         list[i] = arabic2roman (list[i]);
	return list
}


function sort_arab (a, b) {
	return a - b;
}



function sort_roman (a, b) {
	return romanToArabic (a) - romanToArabic (b);
}


function arabic2roman (arab) {
	var roman = ''
	if (arab < 10000) {
		var rom = [];
		rom[0] = ['','i','ii','iii','iv','v','vi','vii','viii','ix'];
		rom[1] = ['','x','xx','xxx','il','l','lx','lxx','lxxx','xc'];
		rom[2] = ['','c','cc','ccc','cd','d','dc','dcc','dccc','cm'];
		rom[3] = ['','m','mm','mmm','4m','5m','6m','7m','8m','9m'];
		arab = arab.toString().split('').reverse().join('');
		for (var i = 0; i < arab.length; i++) {
			roman = rom[i][arab.charAt(i)] + roman;
		}
	}
	return roman
}

//---------------------------------------------------------

function romanToArabic (roman) {
	var temp;
	var arabic = romanToArabicSub (roman.substr(-1));
	for (var i = roman.length-2; i > -1; i--) {
		temp = romanToArabicSub (roman[i])
		if (temp < romanToArabicSub (roman[i+1])) {
			arabic -= temp;
		} else  {
			arabic += temp;
		}
	}
	return arabic
}


function romanToArabicSub (roman) {
	switch (roman) {
		case 'i': return 1;
		case 'v': return 5;
		case 'x': return 10;
		case 'l': return 50;
		case 'c': return 100;
		case 'd': return 500;
		case 'm': return 1000;
		default: return 'Illegal character'
	}
}


function unrange (list) {
	
	function expand_num () {
		var expanded = '';
		if (arguments[1].length > arguments[2].length) {
			arguments[2] = undrop (arguments[1], arguments[2]);
		}
		var start = Number (arguments[1]);
		var stop = Number (arguments[2]);
		for (var i = start; i < stop; i++) {
			expanded += i + ',';
		}
		expanded += stop;
		return expanded;
	}

	// 123-6 > 123-126
	function undrop (from, to) {
		return from.slice (0, from.length-to.length) + to;
	}

	var s = list.join (',');
	s = s.replace (/(\d+)[-\u2013](\d+)/g, expand_num);
	return s.split (',');
}


function remove_doubles (list) {
	var s = list.join('\r')+'\r';
	s = s.replace(/([^\r]+\r)(\1)+/g,'$1');
	s = s.replace(/\r$/,'');
	return s.split ('\r');
}


function range_pages (list) {
	if (page_span === 0) return list;
	var i = 0, temp = [];
	while (i < list.length) {
		if ( (list[i+1] - list[i] <= page_span) && (i < list.length)) {
			var range = list[i] + '\u2013';
			while ( (list[i+1] - list[i] <= page_span) && (i < list.length)) {
				i++;
			}
			temp.push (range+list[i]);
		} else {
			temp.push (list[i]);
		}
		i++;
	}
	//return temp.join (', ')
	return temp
}