#target indesign
 ShowAllNestedStyles();
  
function ShowAllNestedStyles() {
    var myNestedList = new Array(0);
    var myDoc = app.documents.item(0);
    
    for (j = myDoc.paragraphStyles.length-1;j>=0;j--) {
        var myPStyle = myDoc.paragraphStyles[j];
        var myPSname = myPStyle.name;
         for (i = myPStyle.nestedStyles.length-1;i>=0; i--) {
              var NstyleName = myPStyle.nestedStyles[i].appliedCharacterStyle.name;
              myNestedList.push(myPSname+" -- '" + NstyleName + "'\r");
         }
     }
    alert("NESTED Pstyles:  PStyle -- 'nest'\r" + myNestedList.join(""));
  
}

// http://forums.adobe.com/thread/1133301?tstart=0