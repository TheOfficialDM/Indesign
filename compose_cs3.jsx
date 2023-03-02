//DESCRIPTION: Enter special sorts
// Enter special sorts at the insertion point if there is one, otherwise in the Find/Change dialog


//~ var ipIndex = app.selection[0].index;
//~ var story = app.selection[0].parentStory;
//~ var chs = story.characters.itemByRange(ipIndex-2, ipIndex-1);
//~ str = chs.characters[0].contents+chs.characters[1].contents;
//~ chs.remove();
//~ combine(str);

if (parseInt (app.version) > 4)
  try {compose_character ()}
    catch (e) {alert (e.message + "\r(line " + e.line + ")")};

//=============================================================================

function compose_character ()
  {
  if (parseInt (app.version) < 9 && app.menuActions.item('Tabs').checked){
    app.menuActions.item('Tabs').invoke();
  }
  var input_characters = get_input ();
	//parseInt(app.version) > 8 && Folder.fs == "Windows" && File(Folder.startup+"/InDesign.exe").execute();
  var str;
  if (app.selection.length > 0 && app.selection[0].constructor.name == "InsertionPoint" && input_characters == "\\")
    {
    var position = {story: app.selection[0].parentStory.id, ip: app.selection[0].index}
    var ip = app.selection[0];
    overstrike (ip.parentStory.characters[ip.index-2].contents, ip.parentStory.characters[ip.index-1].contents, "\\");
    }
  else
    {
    switch (input_characters.length)
      {


      case 1: str = single_accent (input_characters); break;
      case 2: combine (input_characters); break; // This one exits in situ. Ugly.
      case 3: str = special_combine (input_characters); break;
      case 4: if (ok_hex (input_characters)) {str = hex_input (input_characters); break;}
      case 5: str = plane_1 (input_characters);
      }
    }
  enter_string (str);
  app.documents[0].stories.itemByID(position.story).insertionPoints[position.ip].select();
	app.activate();
  }


// ============================================================================

function ok_hex (s) {return (s.match (/^[\da-fA-F]+$/))}


function hex_input (s)
  {
  if (app.selection.length > 0 && app.selection[0] instanceof InsertionPoint)
    return String.fromCharCode ("0x"+s)
  else
//~    return "\\x{"+s+"}";
    return String.fromCharCode ("0x"+s);
  }


function enter_string (s){
  // With an insertion point, enter a string there;
  // otherwise enter it in the Find/Change
  if (app.selection.length > 0 && app.selection[0] instanceof InsertionPoint)
    {
    app.selection[0].contents = s;
    }
  else
    {
    app.findGrepPreferences.findWhat += s;
    app.findTextPreferences.findWhat += s;
    }
	app.activate();
  exit();
  }


function combine (s)
  {
  var letter = s[0]; var accent = s[1];
  switch (accent)
    {
    case "'" : // acute
      switch (letter)
        {
        case 'A' : type_char ('\u00C1');    // Aacute
        case 'a' : type_char ('\u00E1');    // aacute
        case 'E' : type_char ('\u00C9');    // Eacute
        case 'e' : type_char ('\u00E9');    // eacute
        case 'I' : type_char ('\u00CD');    // Iacute
        case 'i' : type_char ('\u00ED');    // iacute
        case 'o' : type_char ('\u00F3');    // oacute
        case 'O' : type_char ('\u00D3');    // Oacute
        case 'u' : type_char ('\u00FA');    // uacute
        case 'U' : type_char ('\u00DA');    // Uacute
        case 'Y' : type_char ('\u00DD');    // Yacute
        case 'y' : type_char ('\u00FD');    // yacute
        case 'C' : try_char ('\u0106', letter, accent);    // Cacute
        case 'c' : try_char ('\u0107', letter, accent);    // cacute
        case 'K' : try_char ('\u1E30', letter, accent);    // Kacute
        case 'k' : try_char ('\u1E31', letter, accent);    // kacute
        case 'L' : try_char ('\u0139', letter, accent);    // Lacute
        case 'l' : try_char ('\u013A', letter, accent);    // lacute
        case 'M' : try_char ('\u1E3E', letter, accent);    // Macute
        case 'm' : try_char ('\u1E3F', letter, accent);    // macute
        case 'N' : try_char ('\u0143', letter, accent);    // Nacute
        case 'n' : try_char ('\u0144', letter, accent);    // nacute
        case 'P' : try_char ('\u1E56', letter, accent);    // Pacute
        case 'p' : try_char ('\u1E57', letter, accent);    // pacute
        case 'R' : try_char ('\u0154', letter, accent);    // Racute
        case 'r' : try_char ('\u0155', letter, accent);    // racute
        case 'S' : try_char ('\u015A', letter, accent);    // Sacute
        case 's' : try_char ('\u015B', letter, accent);    // sacute
        case 'W' : try_char ('\u1E82', letter, accent);    // Wacute
        case 'w' : try_char ('\u1E83', letter, accent);    // wacute
        case 'Z' : try_char ('\u0179', letter, accent);    // Zacute
        case 'z' : try_char ('\u017A', letter, accent);    // zacute
        default: overstrike (stripdot (letter), accent)
        }
    case "u" : // breve
      switch (letter)
        {
        case "a" : try_char ('\u0103', letter, accent);    // abreve
        case "A" : try_char ('\u0102', letter, accent);    // Abreve
        case "e" : try_char ('\u0115', letter, accent);    // ebreve
        case "E" : try_char ('\u0114', letter, accent);    // Ebreve
        case "g" : try_char ('\u011F', letter, accent);    // gbreve
        case "G" : try_char ('\u011E', letter, accent);    // Gbreve
        case "i" : try_char ('\u012D', letter, accent);    // ibreve
        case "I" : try_char ('\u012C', letter, accent);    // Ibreve
        case "O" : try_char ('\u014E', letter, accent);    // Obreve
        case "o" : try_char ('\u014F', letter, accent);    // obreve
        case "U" : try_char ('\u016C', letter, accent);    // Ubreve
        case "u" : try_char ('\u016D', letter, accent);    // ubreve
        default: overstrike (stripdot (letter), accent)
        }
    case "," : // cedilla
      switch (letter)
        {
        case "c" : type_char ('\u00E7');    // ccedille
        case "C" : type_char ('\u00C7');    // Ccedille
        case "g" : try_char ('\u0123', letter, accent);    // gcedille
        case "G" : try_char ('\u0122', letter, accent);    // Gcedille
        case "k" : try_char ('\u0137', letter, accent);    // kcedille
        case "K" : try_char ('\u0136', letter, accent);    // Kcedille
        case "l" : try_char ('\u013C', letter, accent);    // lcedille
        case "L" : try_char ('\u013B', letter, accent);    // Lcedille
        case "n" : try_char ('\u0146', letter, accent);    // ncedille
        case "N" : try_char ('\u0145', letter, accent);    // Ncedille
        case "r" : try_char ('\u0157', letter, accent);    // rcedille
        case "R" : try_char ('\u0156', letter, accent);    // Rcedille
        case "s" : try_char ('\u015F', letter, accent);    // scedille
        case "S" : try_char ('\u015E', letter, accent);    // Scedille
        case "t" : try_char ('\u0163', letter, accent);    // tcedille
        case "T" : try_char ('\u0164', letter, accent);    // Tcedille
        default: overstrike (letter, accent)
        }
    case "^" : // circum
      switch (letter)
        {
        case "a" : type_char ('\u00E2');    // acircum
        case "A" : type_char ('\u00C2');    // Acircum
        case "e" : type_char ('\u00EA');    // ecircum
        case "E" : type_char ('\u00CA');    // Ecircum
        case "i" : type_char ('\u00EE');    // icircum
        case "I" : type_char ('\u00CE');    // Icircum
        case "o" : type_char ('\u00F4');    // ocircum
        case "O" : type_char ('\u00D4');    // Ocircum
        case "u" : type_char ('\u00FB');    // ucircum
        case "U" : type_char ('\u00DB');    // Ucircum
        case "c" : try_char ('\u0109', letter, accent);    // ccircum
        case "C" : try_char ('\u0108', letter, accent);    // Ccircum
        case "e" : type_char ('\u00EA');    // ecircum
        case "g" : try_char ('\u011D', letter, accent);    // gcircum
        case "G" : try_char ('\u011C', letter, accent);    // Gcircum
        case "h" : try_char ('\u0125', letter, accent);    // hcircum
        case "H" : try_char ('\u0124', letter, accent);    // Hcircum
        case "j" : try_char ('\u0135', letter, accent);    // jcircum
        case "J" : try_char ('\u0134', letter, accent);    // Jcircum
        case "s" : try_char ('\u015D', letter, accent);    // scircum
        case "S" : try_char ('\u015C', letter, accent);    // Scircum
        case "w" : try_char ('\u0175', letter, accent);    // wcircum
        case "W" : try_char ('\u0174', letter, accent);    // Wcircum
        case "y" : try_char ('\u0177', letter, accent);    // ycircum
        case "Y" : try_char ('\u0176', letter, accent);    // Ycircum
        default: overstrike (letter, accent)
        }
    case "#" : // dblacute
      switch (letter)
        {
        case "o" : try_char ('\u0151', letter, accent);    // odblacute
        case "O" : try_char ('\u0150', letter, accent);    // Odblacute
        case "u" : try_char ('\u0171', letter, accent);    // udblacute
        case "U" : try_char ('\u0170', letter, accent);    // Udblacute
        default: overstrike (stripdot (letter), accent)
        }
    case "." : // dot
      switch (letter)
        {
        case "B" : try_char ('\u1E02', letter, accent);    // Bdot
        case "b" : try_char ('\u1E03', letter, accent);    // bdot
        case "c" : try_char ('\u010B', letter, accent);    // cdot
        case "C" : try_char ('\u010A', letter, accent);    // Cdot
        case "D" : try_char ('\u1E0A', letter, accent);    // Ddot
        case "d" : try_char ('\u1E0B', letter, accent);    // ddot
        case "e" : try_char ('\u0117', letter, accent);    // edot
        case "E" : try_char ('\u0116', letter, accent);    // Edot
        case "F" : try_char ('\u1E1E', letter, accent);    // Fdot
        case "f" : try_char ('\u1E1F', letter, accent);    // fdot
        case "g" : try_char ('\u0121', letter, accent);    // gdot
        case "G" : try_char ('\u0120', letter, accent);    // Gdot
        case "H" : try_char ('\u1E22', letter, accent);    // Hdot
        case "h" : try_char ('\u1E23', letter, accent);    // hdot
        case "i" : type_char ('i') ;            // idot
        case "I" : try_char ('\u0130', letter, accent);    // Idot
        case "m" : try_char ('\u1E41', letter, accent);    // mdot
        case "n" : try_char ('\u1E45', letter, accent);    // ndot
        case "r" : try_char ('\u1E59', letter, accent);    // rdot
        case "s" : try_char ('\u1E61', letter, accent);    // sdot
        case "t" : try_char ('\u1E6B', letter, accent);    // tdot
        case "z" : try_char ('\u017C', letter, accent);    // zdot
        case "Z" : try_char ('\u017B', letter, accent);    // Zdot
        default: overstrike (letter, accent)
        }
    case "!" :    // underdot
      switch (letter)
        {
        case "B" : try_char ('\u1E04', letter, accent);
        case "b" : try_char ('\u1E05', letter, accent);
        case "d" : try_char ('\u1E0D', letter, accent);
        case "H" : try_char ('\u1E24', letter, accent);
        case "h" : try_char ('\u1E25', letter, accent);
        case "k" : try_char ('\u1E33', letter, accent);
        case "l" : try_char ('\u1E37', letter, accent);
        case "m" : try_char ('\u1E43', letter, accent);
        case "n" : try_char ('\u1E47', letter, accent);
        case "r" : try_char ('\u1E5B', letter, accent);
        case "s" : try_char ('\u1E63', letter, accent);
        case "t" : try_char ('\u1E6D', letter, accent);
        default: overstrike (letter, accent)
        }
    case "U": // breve subscript
      overstrike (letter, accent);
    case "|" : // syllabic
      overstrike (letter, accent);
    case "[": // bridge below
      overstrike (letter, accent);
    case "]": // inverted bridge
      overstrike (letter, accent);
    case "=": // undertilde
      overstrike (letter, accent);
    case "O": // underring
      overstrike (letter, accent);
    case "`" :  // grave
      switch (letter)
        {
        case "a" : type_char ('\u00E0');    // agrave
        case "A" : type_char ('\u00C0');    // Agrave
        case "e" : type_char ('\u00E8');    // egrave
        case "E" : type_char ('\u00C8');    // Egrave
        case "i" : type_char ('\u00EC');    // igrave
        case "I" : type_char ('\u00CC');    // Igrave
        case "o" : type_char ('\u00F2');    // ograve
        case "O" : type_char ('\u00D2');    // Ograve
        case "u" : type_char ('\u00F9');    // ugrave
        case "U" : type_char ('\u00D9');    // Ugrave
        case "W" : try_char ('\u1E80', letter, accent);    // Wgrave
        case "w" : try_char ('\u1E81', letter, accent);    // wgrave
        case "y" : try_char ('\u1EF3', letter, accent);    // ygrave
        case "Y" : try_char ('\u1EF2', letter, accent);    // Ygrave
        default: overstrike (letter, accent)
        }
    case "v" :
      switch (letter)
        {
        case "s" : try_char ('\u0161', letter, accent);    // shacek
        case "S" : try_char ('\u0160', letter, accent);    // Shacek
        case "c" : try_char ('\u010D', letter, accent);    // chacek
        case "C" : try_char ('\u010C', letter, accent);    // Chacek
        case "d" : try_char ('\u010E', letter, accent);    // dhacek
        case "D" : try_char ('\u010F', letter, accent);    // Dhacek
        case "e" : try_char ('\u011B', letter, accent);    // ehacek
        case "E" : try_char ('\u011A', letter, accent);    // Ehacek
        case "i" : try_char ('\u01D0', letter, accent);    // ihacek
        case 'j' : try_char ('\u01F0', letter, accent);    // jhacek
        case "n" : try_char ('\u0148', letter, accent);    // nhacek
        case "N" : try_char ('\u0147', letter, accent);    // Nhacek
        case "r" : try_char ('\u0159', letter, accent);    // rhacek
        case "R" : try_char ('\u0158', letter, accent);    // Rhacek
        case "T" : try_char ('\u0164', letter, accent);    // Thacek
        case "z" : try_char ('\u017E', letter, accent);    // zhacek
        case "Z" : try_char ('\u017D', letter, accent);    // Zhacek
        case '3' : try_char ('\u01EF', letter, accent);    // yoghhacek
        case 'a' : try_char ('\u01CE', letter, accent);    // ahacek
        case 'o' : try_char ('\u01D2', letter, accent);    // ohacek
        default: overstrike (stripdot (letter), accent)
        }
    case "_" :
      switch (letter)
        {
        case "a" : try_char ('\u0101', letter, accent);    // amacron
        case "A" : try_char ('\u0100', letter, accent);    // Amacron
        case "d" : try_char ('\u0111', letter, accent);    // dmacron
        case "D" : try_char ('\u0110', letter, accent);    // Dmacron
        case "e" : try_char ('\u0113', letter, accent);    // emacron
        case "E" : try_char ('\u0112', letter, accent);    // Emacron
        case "i" : try_char ('\u012B', letter, accent);    // imacron
        case "I" : try_char ('\u012A', letter, accent);    // Imacron
        case "o" : try_char ('\u014D', letter, accent);    // omacron
        case "O" : try_char ('\u014C', letter, accent);    // Omacron
        case "u" : try_char ('\u016B', letter, accent);    // umacron
        case "U" : try_char ('\u016A', letter, accent);    // Umacron
        case "Y" : try_char ('\u0232', letter, accent);    // Ymacron
        case "y" : try_char ('\u0233', letter, accent);    // Ymacron
        default: overstrike (stripdot (letter), accent)
        }
    case ";" :
      switch (letter)
        {
        case "a" : try_char ('\u0105', letter, accent);    // aogonek
        case "A" : try_char ('\u0104', letter, accent);    // Aogonek
        case "e" : try_char ('\u0119', letter, accent);    // eogonek
        case "E" : try_char ('\u0118', letter, accent);    // Eogonek
        case "i" : try_char ('\u012F', letter, accent);    // iogonek
        case "I" : try_char ('\u012E', letter, accent);    // Iogonek
        case "u" : try_char ('\u0173', letter, accent);    // uogonek
        case "U" : try_char ('\u0172', letter, accent);    // Uogonek
        case 'O' : try_char ('\u01EA', letter, accent);    // Oogonek
        case 'o' : try_char ('\u01EB', letter, accent);    // oogonek
        default: overstrike (letter, accent)
        }
    case "@" :
      switch (letter)
        {
        case "a" : type_char ('\u00E5');    // aring
        case "A" : type_char ('\u00C5');    // Aring
        case "u" : try_char ('\u016F', letter, accent);    // uring
        case "U" : try_char ('\u016E', letter, accent);    // Uring
        default: overstrike (stripdot (letter), accent)
        }
    case "%" :
      switch (letter)
        {
        case "A" : try_char ('\u1E00', letter, accent);    // Aunderring
        case "a" : try_char ('\u1E01', letter, accent);    // aunderring
        default: overstrike (stripdot (letter), accent)
        }

    case "/" :
      switch (letter)
        {
        case "O" : type_char ('\u00D8');    // Oslash
        case "o" : type_char ('\u00F8');    // oslash
        case "l" : try_char ('\u0142', letter, accent);    // lstroke
        case "L" : try_char ('\u0141', letter, accent);    // Lstroke
        }
    case "~" :
      switch (letter)
        {
        case "o" : type_char ('\u00F5');    // otilde
        case "O" : type_char ('\u00D5');    // Otilde
        case "n" : type_char ('\u00F1');    // ntilde
        case "N" : type_char ('\u00D1');    // Ntilde
        case "a" : type_char ('\u00E3');    // atilde
        case "A" : type_char ('\u00C3');    // Atilde
        case "i" : try_char ('\u0129', letter, accent);    // itilde
        case "I" : try_char ('\u0128', letter, accent);    // Itilde
        case "u" : try_char ('\u0169', letter, accent);    // utilde
        case "U" : try_char ('\u0168', letter, accent);    // Utilde
        case 'E' : try_char ('\u1EBC', letter, accent);
        case 'e' : try_char ('\u1EBD', letter, accent);
        case 'Y' : try_char ('\u1EF8', letter, accent);
        case 'y' : try_char ('\u1EF9', letter, accent);
        default: overstrike (stripdot (letter), accent)
        }
    case "\"" :
      switch (letter)
        {
        case "a" : type_char ('\u00E4');    // aumlaut
        case "A" : type_char ('\u00C4');    // Aumlaut
        case "e" : type_char ('\u00EB');    // eumlaut
        case "E" : type_char ('\u00CB');    // Eumlaut
        case "i" : type_char ('\u00EF');    // iumlaut
        case "I" : type_char ('\u00CF');    // Iumlaut
        case "o" : type_char ('\u00F6');    // oumlaut
        case "O" : type_char ('\u00D6');    // Oumlaut
        case "u" : type_char ('\u00FC');    // uumlaut
        case "U" : type_char ('\u00DC');    // Uumlaut
        case "W" : try_char ('\u1E84', letter, accent);    // Wumlaut
        case "w" : try_char ('\u1E85', letter, accent);    // wumlaut
        case "y" : type_char ('\u00FF');    // yumlaut
        case "Y" : try_char ('\u0178', letter, accent);    // Yumlaut
        default: overstrike (stripdot (letter), accent);
        }
    case "-" :
      switch (letter)
        {
        case "D" : try_char ('\u0110', letter, accent);
        case "d" : try_char ('\u0111', letter, accent);
        case "H" : try_char ('\u0126', letter, accent);    // H barred
        case "h" : try_char ('\u0127', letter, accent);    // h harred
        case "T" : try_char ('\u0166', letter, accent);
        case "t" : try_char ('\u0167', letter, accent);
        default: overstrike (stripdot (letter), accent);
        }
    case "+" :
      switch (letter)
        {
        case "d" : type_char ('d\u2019');    // dquote
        case "D" : type_char ('D\u2019');    // Dquote
        case "l" : try_char ('\u013E', letter, accent);    // lquote
        case "L" : try_char ('\u013D', letter, accent);    // Lquote
        case "n" : try_char ('\u0149', letter, accent);    // nleftqoute
        case "o" : type_char ('o\u2019');    // oquote
        case "O" : type_char ('O\u2019');    // Oquote
        case "t" : try_char ('\u0165', letter, accent);    // tquote
        case "u" : type_char ('u\u2019');    // uquote
        case "U" : type_char ('U\u2019');    // Uquote
        }
    case "*" :
      switch (letter)
        {
        case "S" : try_char ('\u0218', letter, accent);    // scommaaccent
        case "s" : try_char ('\u0219', letter, accent);    // Scommaaccent
        case "T" : try_char ('\u021A', letter, accent);    // Tcommaaccent
        case "t" : try_char ('\u021B', letter, accent);    // tcommaaccent
        default: overstrike (letter, ',')
        }
    case "g" : case "G":
      switch (letter)
        {
        case "a" : type_char ('\u03B1');    // alpha
        case "b" : type_char ('\u03B2');    // beta
        case "g" : type_char ('\u03B3');    // gamma
        case "d" : type_char ('\u03B4');    // delta
        case "e" : type_char ('\u03B5');    // epsilon
        case "z" : type_char ('\u03B6');    // zeta
        case "c" : type_char ('\u03B7');    // eta
        case "h" : type_char ('\u03B8');    // theta
        case "i" : type_char ('\u03B9');    // iota
        case "k" : type_char ('\u03BA');    // kappa
        case "l" : type_char ('\u03BB');    // lambda
        case "m" : type_char ('\u00B5');    // mu
        case "v" : type_char ('\u03BD');    // nu
        case "x" : type_char ('\u03BE');    // xi
        case "o" : type_char ('\u03BF');    // omicron
        case "p" : type_char ('\u03C0');    // pi
        case "r" : type_char ('\u03C1');    // rho
        case "s" : type_char ('\u03C3');    // sigma
        case "?" : type_char ('\u03C2');    // final sigma
        case "t" : type_char ('\u03C4');    // tau
        case "u" : type_char ('\u03C5');    // upsilon
        case "f" : type_char ('\u03C6');    // phi
        case "q" : type_char ('\u03C7');    // chi
        case "y" : type_char ('\u03C8');    // psi
        case "w" : type_char ('\u03C9');    // omega
        case "A" : type_char ('\u0391');    // ALPHA
        case "B" : type_char ('\u0392');    // BETA
        case "G" : type_char ('\u0393');    // GAMMA
        case "D" : type_char ('\u0394');    // DELTA
        case "E" : type_char ('\u0395');    // EPSILON
        case "Z" : type_char ('\u0396');    // ZETA
        case "C" : type_char ('\u0397');    // ETA
        case "H" : type_char ('\u0398');    // THETA
        case "I" : type_char ('\u0399');    // IOTA
        case "K" : type_char ('\u039A');    // KAPPA
        case "L" : type_char ('\u039B');    // LAMBDA
        case "V" : type_char ('\u039D');    // NU
        case "X" : type_char ('\u039E');    // XI
        case "O" : type_char ('\u039F');    // OMICRON
        case "P" : type_char ('\u03A0');    // PI
        case "R" : type_char ('\u03A1');    // RHO
        case "S" : type_char ('\u03A3');    // SIGMA
        // "?" : type_char ('\u03A3'));    // FINAL SIGMA
        case "T" : type_char ('\u03A4');    // TAU
        case "U" : type_char ('\u03A5');    // UPSILON
        case "F" : type_char ('\u03A6');    // PHI
        case "Q" : type_char ('\u03A7');    // chi
        case "Y" : type_char ('\u03A8');    // PSI
        case "W" : type_char ('\u03A9');    // OMEGA
        }
    case 'x' : enter_string (single_accent_combining (letter));
    }
  }  // end combine


function type_char (ch) {
	enter_string (ch);
}

/*
try_char: see if a character is in the current font:
type it and try to create its outline. If that works,
the character is in the font. Due to Teus de Jong
and Dave Saunders.
*/

function try_char (uni, ch, diacr)
  {
   if (app.selection.length == 0 || app.selection[0].constructor.name != "InsertionPoint")
    { // We're inserting someting in the F/C dialog
    app.findGrepPreferences.findWhat += uni;
    app.findTextPreferences.findWhat += uni;
		app.activate();
    exit();
    }
  else
    {
    var ip = app.selection[0];
    var pos = ip_position (app.selection[0]);
    try
      {
      // insert the character
      ip.contents = uni;
      // create outline
      ip.paragraphs[0].characters[pos].createOutlines();
      // if we got here it worked, so delete the outline
      ip.paragraphs[0].characters[pos].remove();
      // insert the character (again)
      ip.contents = uni;
			app.activate();
      exit();
      }
    catch(_)
      {
      // couldn't create outline, so delete it
      ip.paragraphs[0].characters[pos].remove();
      // and create overstrike of ch and diacr, remove dot from i and j
      overstrike (stripdot (ch), diacr)
      }
    } // else
  } // try_char


// Overstrike: kern accent over the preceding letter

function overstrike (ch, diacr, backslash)
  {
  if (app.selection.length == 0 || app.selection[0].constructor.name != "InsertionPoint")   // enter value in the Find/Change dialog
    {
    app.findGrepPreferences.findWhat += ch+single_accent (diacr);
    app.findTextPreferences.findWhat += ch+single_accent (diacr);
		app.activate();
    exit(); // Blunt, but it saves elaborate bracing
    }
  /*
  -Get insertion point offset
  -Get widths of the char and the accent
  -Calculate amount to kern
  -If accent is not last char in story, get kerning between char and following char
  */
  var INDD_version = parseInt (app.version);
  
  // multiplication factor required for correct placement
  var mFactor = 1000 / app.selection[0].pointSize;
  
  if (arguments.length == 2)
    {
    // insert letter and real diacritic
    app.selection[0].contents = ch + single_accent (diacr);
    // if there's a character style, apply it
    try
      {
      switch (diacr)
        {
        case "!": app.selection[0].parentStory.characters[app.selection[0].index-1].appliedCharacterStyle = "underdot"; 
              app.selection[0].parentStory.characters[app.selection[0].index-1].contents = "\u02D9";
              break;
        case "U": app.selection[0].parentStory.characters[app.selection[0].index-1].appliedCharacterStyle = "underbreve"; break;
        case "=": app.selection[0].parentStory.characters[app.selection[0].index-1].appliedCharacterStyle = "undertilde"; break;
        case "O": app.selection[0].parentStory.characters[app.selection[0].index-1].appliedCharacterStyle = "underring";
        }
      }
    catch (_) {} // Not going to bother with error messages
    }
  var ip = app.selection[0];
  var story = ip.paragraphs[0];
  var indx = ip_position (ip);
  if (INDD_version < 7)
    var current_measure = set_measure (MeasurementUnits.points);
  else
    app.scriptPreferences.measurementUnit = MeasurementUnits.points;
  var leftCharWidth = story.insertionPoints[indx-1].horizontalOffset - story.insertionPoints[indx-2].horizontalOffset;
  var rightCharWidth = story.insertionPoints[indx].horizontalOffset - story.insertionPoints[indx-1].horizontalOffset;
  var kvalue = Math.abs ((rightCharWidth / 2) + (leftCharWidth / 2)) * mFactor;
  // remember what the accent is -- we don't necessarily know that
  var del_char = story.characters[indx-1].contents;
  // delete the accent
  story.characters[indx-1].remove ();
  // get the kerning between char and following char
  // an error means we're at last pos of line, story, cell, etc.
  try {var kv = app.selection[0].kerningValue;}
    catch (_) {kv = 0;}
  // replace the accent
  app.selection[0].contents = del_char;
  // see if the letter is a capital and if we need an accent above
  // if yes, calculate difference between cap- and x-height to determine
  // by how much the accent should be baseline-shifted to fit the capital
  if (IsUpperCase(ch) && top_accent (single_accent (diacr)) && "UO=".indexOf(diacr) < 0)
    {
    var bline_shift = x_cap_diff (ip);
    story.characters[indx-1].baselineShift = bline_shift;
    // reset bline shift
    story.insertionPoints[indx].baselineShift = 0
    }
  if (INDD_version < 7)
    restore_measure (current_measure);
  // kern accent over char
  story.insertionPoints[indx-1].kerningValue = -kvalue;
  // now do the spacing after the overstrike: we kerned the accent
  // to the left, so now we need to kern the insertion point to the right
  // in order to make up, so that any following character will be
  // placed correctly
  if (leftCharWidth > rightCharWidth)
    var kv2 = (kvalue / mFactor)-rightCharWidth;
  else
    if (rightCharWidth > leftCharWidth)
      var kv2 = - (rightCharWidth - (kvalue / mFactor));
  story.insertionPoints[indx].kerningValue = (kv2 * mFactor) + kv;
  // Fix for faulty -1000 kerning value. Unknown error
//~     if (story.insertionPoints[indx].kerningValue < -500)
//~         story.insertionPoints[indx].kerningValue = 0;
app.activate();
  exit();
  }


function ip_position (ip)
  {
  if (ip.constructor.name != "InsertionPoint")
    errorM ("Need an insertion point (line 607).")
  else
    {
    if (ip.index === 0)
      return 0;
    else
      return ip.index - ip.paragraphs[0].insertionPoints[0].index;
    }
  }


function set_measure (unit)
  {
  var doc = app.activeDocument;
  var measure = doc.viewPreferences.horizontalMeasurementUnits;
  doc.viewPreferences.horizontalMeasurementUnits = unit;
  doc.viewPreferences.verticalMeasurementUnits = unit;
  return measure
  }

function restore_measure (unit)
  {
  app.activeDocument.viewPreferences.horizontalMeasurementUnits = unit;
  app.activeDocument.viewPreferences.verticalMeasurementUnits = unit;
  }

function stripdot (inp)
  {
  // ovs = true;
  // return dotless i or j
  switch (inp)
    {
    case 'i' : return '\u0131';
    case 'j' : return '\u0237';
    default : return inp;
    }
  }


function IsUpperCase (ch) {return ch == ch.toUpperCase();}


function top_accent (ch)
  {
  // standard Type 1 diacritics available in virtually every font: grave, umlaut, macron, acute, circumflex, hacek, dot accent, ring, tilde, dbl acute
  return "\u0060\u00A8\u00AF\u00B4\u02C6\u02C7\u02D8\u02D9\u02DA\u02DC\u02DD".indexOf (ch) > -1 ||
    ch.match (/[\u0300-\u0315]/) != null;
  }


/*
  To place diacritics correctly on capitals, we need to
  calculate the difference between cap- and x-height:
  there are no script properties for this. We place
  a text frame and add a character in the current font
  and type size. Then we set the firstBaseLineOffset property 
  of the frame to capHeight and measure the baseline. 
  Then we set the frame's property to x-height and measure
  the baseline again. This is the difference we're after.
*/

function x_cap_diff (ip)
  {
  var tf = app.activeDocument.textFrames.add ({
    geometricBounds: [0,0,80,80],
    textFramePreferences: {firstBaselineOffset: FirstBaseline.capHeight, ignoreWrap: true},
    contents: "X"
    });
  var ch = ip.parentStory.characters[ip.index-1];
  tf.characters[0].properties = {appliedFont: ch.appliedFont, pointSize: ch.pointSize, alignToBaseline: false}
  var cap_height = tf.characters[0].baseline;
  tf.textFramePreferences.firstBaselineOffset = FirstBaseline.xHeight;
  x_height = tf.characters[0].baseline;
  tf.remove();
  return cap_height - x_height;
  }

// **************************************************************************************************

// get unicode point of conventional accent character
function single_accent (accent)
  {
  switch (accent)
    {
    case '\'' : return '\u00B4';    // acute
    case '`' : return '\u0060';    // grave
    case 'u' : return '\u02D8';    // breve
    //case 'U' : return "\u032E";    // breve subscript
    case 'U' : return "\u02D8";    // breve subscript
    case ',' : return '\u00B8';    // cedilla
    case '^' : return '\u02C6';    // circumflex
    case '#' : return '\u02DD';    // dbl acute
    case '!' : return '\u0323';    // underdot
    //case '!' : return '\u02D9';    // underdot
    case 'v' : return '\u02C7';    // hacek
    case '_' : return '\u00AF';    // macron
    case ';' : return '\u02DB';    // ogonek
    case '@' : return '\u02DA';    // ring
    case 'O' : return '\u02DA';    // ring
    case '%' : return '\u0325';    // underring
    case '~' : return '\u02DC';    // tilde
    case "=" : return "\u02DC"; // tilde below
    case '"' : return '\u00A8';    // umlaut
    case '.' : return '\u02D9';    // dot accent
    case ':' : return '\u00B7'; // centred dot
    case "|" : return "\u0329"; // syllabic
    case "[" : return "\u032A"; // bridge below
    case "]" : return "\u033A"; // inv. bridge below
    default : return accent;
    }
  }



function single_accent_combining (accent)
  {
  switch (accent)
    {
    case '\'' : return '\u0300';    // acute
    case '`' : return '\u0301';    // grave
    case '^' : return '\u0302';    // circumflex
    case '~' : return '\u0303';    // tilde
    case '_' : return '\u0304';    // macron
    case 'u' : return '\u0306';    // breve
    case '.' : return '\u0307';    // dotaccent
    case '"' : return '\u0308';    // umlaut
    case "?" : return '\u0309';    // hook
    case '@' : return '\u030A';    // ring
    case '#' : return '\u030B';    // dblacute
    case 'v' : return '\u030C';    // hacek
    case '!' : return '\u0323';    // underdot
    case '%' : return '\u0325';    // underring
    case ',' : return '\u0327';    // cedilla
    case "|" : return "\u0329"; // syllabic
    case "[" : return "\u032A"; // bridge below
    case ';' : return '\u032B';    // ogonek
    case 'U' : return "\u032E";    // breve subscript
    case "]" : return "\u033A"; // inv. bridge below
    default : return '?'
    }
  }


function special_combine (inp)
  {
  // inp is three chars, third one designates "class"
  // space is standard, m is math, p is phonetic
  switch (inp[2])
    {
    case " ": return compose_standard (inp.slice (0,2));
    case "m" : return compose_math (inp.slice (0,2));
    case "p" : return compose_phonetic (inp.slice (0,2));
    }
  }


function compose_standard (s)
  {
  switch (s)
    {
    case 'ii' :    return '\u0131';    // dotless i
    case 'jj' :    return '\u0237';    // dotless j
    case "nn": return "\u014B";      // eng
    case "ee": return "\u04D9";      // schwa
    // currency
    case 'c/' :    return '\u00A2';    // cent
    case 'L-' :    return '\u00A3';    // sterling
    case 'xo' :    return '\u00A4';    // currency
    case 'Y=' :    return '\u00A5';    // yen
    case 'C=' :    return '\u20AC';    // euro
    // letters
    case 'AE' :    return '\u00C6';    // AE lig
    case 'ae' :    return '\u00E6';    // ae lig
    case 'OE' :    return '\u0152';    // OE lig
    case 'oe' :    return '\u0153';    // oe lig
    case 'Th' :    return '\u00DE';    // Thorn
    case 'th' :    return '\u00FE';    // thorn
    case 'Dh' :    return '\u00D0';    // Eth
    case 'dh' :    return '\u00F0';    // eth
    case 'ss' :    return '\u00DF';    // ringel-s
    // various
    case 'SS' :    return '\u00A7';    // section
    case 'co' :    return '\u00A9';    // copyright
    case 'aa' :    return '\u00AA';    // ordfeminine
    case 'oo' :    return '\u00B0';    // ordmasculine
    case '00' :    return '\u00BA';    // degree
    case '<<' :    return '\u00AB';    // guillemot left
    case '>>' :    return '\u00BB';    // guillemot right
    case 'ro' :    return '\u00AE';    // registered
    case 'tm' :    return '\u2122';    // trademark
    case '!!' :    return '\u00A1';    // inverted exclam. mark
    case '??' :    return '\u00BF';    // inverted question mark
    case '14' :    return '\u00BC';    // quarter
    case '12' :    return '\u00BD';    // half
    case '34' :    return '\u00BE';    // three-quarters
    case '|-' :    return '\u2020';    // obelisk
    // math
    case 'om' : return '\u00B0' ;    // degree
    case '+-' : return '\u00B1' ;    // plus-minus
    case 'xm' : return '\u00D7' ;    // multiply
    case ':m' : return '\u00F7' ;    // divide
    case '7m' : return '\u2032' ;    // prime
    case '-<' : return '\u2190' ;    // left arrow
    case '|^' : return '\u2191' ;    // up arrow
    case '->' : return '\u2192' ;    // right arrow
    case '|v' : return '\u2193' ;    // left arrow
    case '=<' : return '\u21D0' ;    // left double arrow
    case '=^' : return '\u21D1' ;    // up double arrow
    case '=>' : return '\u21D2' ;    // right double arrow          
    case '=v' : return '\u21D3' ;    // down double arrow
    case 'AA' : return '\u2200' ;    // universal
    case 'EE' : return '\u2203' ;    // existential
    case '0)' : return '\u2205' ; // empty set
    case '0/' : return '\u2205' ; // empty set
    case '--' : return '\u2212' ;    // minus
    case 'VV' : return '\u221A' ;    // root
    case '88' : return '\u221E' ;    // infinity
    case 'UU' : return '\u222A' ;    // set union
    case 'Sm' : return '\u222B' ;    // integral
    case '~m' : return '\u223C' ; // equivalent
    case '~~' : return '\u2248' ;    // more or less
    case '/' : return '\u2260' ;    // is not
    case '<=' : return '\u2264' ;    // smt or eq
    case '>=' : return '\u2265' ;    // lgr or eq
    case '00' : return '\uF638' ;    // zero slash
    case '[[' : return '\u27E6' ;    // open double bracket
    case ']]' : return '\u27E7' ;    // close double bracket
    case '<m' : return '\u27E8' ;    // open angled bracket
    case '>m' : return '\u27E9' ;    // close angled bracket
    default : return "" ;
    }
  }



// **************************************************************************************************

// algorithm adapted from http://www.russellcottrell.com/greek/utilities/SurrogatePairCalculator.htm

function plane_1 (hex) {
  hex = "0x" + hex;
  var high = Math.floor ((hex - 0x10000) / 0x400) + 0xD800;
  var low = ((hex - 0x10000) % 0x400) + 0xDC00;
  return String.fromCharCode (high) + String.fromCharCode (low)
}


// Interface =====================================================================

function get_input () {
  var w = new Window ('dialog', 'Compose');
  //var default_font = ScriptUI.newFont (ScriptUI.applicationFonts.palette.name, "Regular", 16);
  w.group = w.add ('group');
  w.group.prompt = w.group.add ('statictext', undefined, 'Input:');
  //prmpt.graphics.font = default_font;
  w.response = w.group.add ('edittext {text: "?=Help", characters: 7, active: true}');
  //w.response.graphics.font = default_font;
  w.add ('button', undefined, 'OK');
  if (w.show() == 2) exit();
  if (w.response.text == '?' || w.response.text == '?=Help'){
    show_help();
    return get_input();
  } else {
    return w.response.text;
  }
} // get_input



function show_help ()
  {
  var h = new Window ("dialog");
  h.alignChildren = "right";
  var gr = h.add ("group");
    gr.orientation = "column";
    gr.alignChildren = "left";
    var p = gr.add ("panel");
      p.alignChildren = "left";
      p.add ("statictext", undefined,  "1. Single character for accent");
      p.add ("statictext", undefined,  "2. Single character followed by x: same accents, but from Combining diacr. range");
      p.add ("statictext", undefined,  "3. Character plus g for Greek (e.g. ag for alpha)");
      p.add ("statictext", undefined,  "4. Two characters followed by space for misc combinations");
      p.add ("statictext", undefined,  "5. Enter four-character unicode to insert a character by its unicode value");
      p.add ("statictext", undefined,  "6. Enter five-character unicode to insert a character by its unicode value (plane-2 Unicode)");
      p.add ("statictext", undefined,  "7. Enter \\ to create overstrike of the two characters preceding insertion point");
    var bline = gr.add ("group");
      var inp = bline.add ("group");
        inp.add ("statictext", undefined, "More info on item: ");
        var more = inp.add ("edittext", undefined, "1");
        more.active = true;
  var buttons = h.add ("group")
    buttons.add ("button", undefined, "OK");
    buttons.add ("button", undefined, "Cancel");

  if (h.show () == 1)
    {
    switch (more.text)
      {
      case "1": help_window ("Accent conventions", accent_conventions_text ()); break;
      case "2": help_window ("Accent conventions", accent_conventions_text ()); break;
      case "3": help_window ("Greek", greek_text ()); break;
      case "4": help_window ("Miscellaneous combinations", misc_text ()); break;
      case "7": help_window ("Overstrike two characters", overstrike_text ()); break;
      }
    }
  }



function help_window (title, contents)
  {
  var w = new Window ("dialog", title);
    w.alignChildren = "right";
    var t = w.add ("edittext", undefined, contents, {multiline: true, readonly: true})
      t.minimumSize.width = 500;
      t.maximumSize.height = $.screens[0].bottom-200;
      try {t.graphics.font = ScriptUI.newFont (ScriptUI.applicationFonts.palette.name, "Regular", 16)} catch (_) {};
    w.add ("button", undefined, "Close", {name: "ok"});
  w.show ()
  }

function accent_conventions_text ()
  {
return "`    grave \
'    acute \
u    breve \
U    breve subscript \
,    cedille \
;    ogonek \
^    circumflex \
#    double acute (aka Hungarian umlaut) \
v    hacek (aka caron, wedge, stre\u0161ica, m\u00E4k\u010De\u0148) \
_    macron \
@    ring \
O    ring below \
~    tilde \
=    tilde subscript \
\"    umlaut (aka dieresis) \
/    slash (in Polish L) \
*    comma accent \
-    bar \
!    underdot \
:    centred dot \
.    dot accent (overdot) \
|   syllabicity mark \
[   bridge below \
]   inverted bridge below".replace (/   +/g, "\t")
}

function greek_text ()
  {
return "Note: all these are case-sensiitive \
 \
a    alpha \
b    beta \
g    gamma \
d    delta \
e    epsilon \
z    zeta \
c    eta \
h    theta \
i    iota \
k    kappa \
l    lambda \
v    nu \
x    xi \
o    omicron \
p    pi \
r    rho \
s    sigma \
?    final sigma \
t    tau \
u    upsilon \
f    phi \
q    chi \
y    psi \
w    omega".replace (/   +/g, "\t")
}



function misc_text ()
  {
  return "Note: type the two characters in the left-hand column followed by space to enter the character in the second column.\n \
ae    \u00C6    ae \
AE    \u00E6    AE \
oe    \u0153    oe \
OE    \u0152    OE \
th    \u00FE    thorn \
Th    \u00DE    Thorn \
dh    \u00FE    eth \
Dh    \u00D0    Eth \
ii    \u0131    dotless i  \
jj    \u0237    dotless j  \
nn    \u014B   eng  \
ee    \u04D9   schwa \
ss    \u00DF    ringel-s  \
L-    \u00A3    sterling \
c/    \u00A2    cent \
Y=    \u00A5    yen \
C=    \u20AC    euro \
xo    \u00A4    currency \
co    \u00A9    copyright \
ro    \u00AE    registered \
tm    \u2122    trademark \
SS    \u00A7    section \
|-    \u2020    obelisk\
!!    \u00A1    inverted exclam. mark \
??    \u00BF    inverted question mark \
aa    \u00AA    ordinal feminine \
oo    \u00B0    ordinal masculine \
<<    \u00AB    guillemet left \
>>    \u00BB    guillemet right \
 \
14    \u00BC    quarter \
12    \u00BD    half \
34    \u00BE    three-quarters \
om    \u00B0    degree\
+-    \u00B1    plus-minus \
xm    \u00D7    multiply \
:m    \u00F7    divide \
7m    \u2032    prime \
-<    \u2190    left arrow \
|^    \u2191    up arrow \
->    \u2192    right arrow \
|v    \u2193    down arrow \
=<    \u21D0    left double arrow \
=^    \u21D1    up double arrow \
=>    \u21D2    right double arrow     \
=v    \u21D3    down double arrow \
AA    \u2200    universal \
EE    \u2203    existential \
0/    \u2205    empty set \
--    \u2212    minus \
VV    \u221A    root \
88    \u221E    infinity \
UU    \u222A    set union \
Sm    \u222B    integral \
~m    \u223C    equivalent \
~~    \u2248    more or less \
/    \u2260    is not \
<=    \u2264    smt or eq \
>=    \u2265    lgr or eq \
00    \uF638    zero slash \
[[    \u27E6    open double bracket \
]]    \u27E7    close double bracket \
<m    \u27E8    open angled bracket \
>m    \u27E9    close angled bracket".replace (/   +/g, "\t")
}



function overstrike_text ()
  {
  return "To combine two characters not available from the keyboard,\
enter those two characters in the document.\
Then run the script and at the \"Input:\" prompt, enter \\ and press Enter."
  }




//====================================================================================

function check_environment ()
  {
  return parseInt (app.version) > 4 
    && app.documents.length > 0 
    && app.selection.length > 0 
    && app.selection[0] instanceof InsertionPoint;
  }


function errorM (m)
  {
  alert (m);
  exit();
  }