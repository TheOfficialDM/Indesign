mySelection = app.selection[0];
if (! mySelection instanceof TextFrame){
   alert("Please select a text frame and try again.");
exit();
}
myObjectStyle = mySelection.appliedObjectStyle;
myResult = confirm("Apply object style " + myObjectStyle.name + " to all threaded frames until the end of the story?");
if (!myResult){
   exit();
}
myCounter = 0;
while (mySelection = mySelection.nextTextFrame){
   myCounter++;
   mySelection.applyObjectStyle(myObjectStyle, true, true);
}
alert("Number of text containers affected: " + myCounter);