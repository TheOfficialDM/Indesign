//saveVersions.jsx  
//DESCRIPTION: Saves versions of the active document in a numbered loop 
 
#targetengine "session"  
  
var myEventListenerVersions = app.addEventListener("beforeSave", SaveVersion);      
      
function SaveVersion()  
{  
    var myFolderName = 'Versions'; 
    var myDoc = app.documents.firstItem();  
    // Create a backup copy only if the document has already been backed up after its creation 
    // (ie exists as a file on a data carrier)
    if (myDoc.saved == true)  
    {  
        var myCounter = getVersion (myDoc); // refers to version number; this will be set up if necessary
        var myPathName = myDoc.filePath.fullName + '/' + myFolderName;  
        var mySFolder = Folder(myPathName);  
        try {  
            // Create a backup folder
            mySFolder.create();  
        }   
        catch(e)  
        {  
            alert("Problem with creating the folder");
        }  
  
        // Create copies of versions  
        var myName = setVersionName(myDoc.name, myCounter);  
        File(myDoc.fullName).copy(myPathName + "/" + myName);  
    }  
}  
  
function getVersion(aDoc)  
{  
    if (myMax = aDoc.extractLabel( 'theMax' ))    
    {  
        // Version number was created
        myVersion = aDoc.extractLabel( 'theVersion' )  
    }  
    else  
    {  
        // Version number wasn't created
        do  
        {  
            // Prompt max. number of versions
            myMax = prompt ('Maximum number of versions:', 5);  
            if (myMax == null)  
                exit();  
        } while (myMax < 1)  
        myVersion = '0';  
        aDoc.insertLabel( 'theVersion', myVersion);  
        aDoc.insertLabel( 'theMax', myMax);  
    }  
    // Save the version data
    myNewVersion = setVersion( aDoc, [myMax, myVersion]);  
    return myNewVersion;  
}  
  
function setVersion( aDoc, aData )  
{  
    myNum = Number( aData[1] );  
    (myNum >= Number( aData[0] )) ? myNum = 1 : myNum++;  
    aDoc.insertLabel( 'theVersion', String( myNum ) );  
    return String( myNum );  
}  
  
function setVersionName(aName, aCounter)  
{  
        var myIndex = aName.indexOf( '.indd');  
        if (myIndex == -1)  
        {  
            var theNewName = aName + '_' + aCounter;  
        }  
        else  
        {  
            var theNewName = aName.substring(0, myIndex) + '_' +  aCounter + aName.substring(myIndex, aName.length);  
        }  
    return theNewName;  
} 