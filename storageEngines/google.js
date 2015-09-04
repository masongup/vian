
/* Copyright (c) 2007-2010 Ian Paul Larsen
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */



function GoogleStorage()
{

}


GoogleStorage.prototype.getxmlhttpreq = function()
{
    var req = null;
    if (window.XMLHttpRequest){
        req = new XMLHttpRequest()
    }	
    else if (window.ActiveXObject){
	req = new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (!req) 
	{
	    alert("ERROR: No XMLHttpRequest object.");
	}
    return req;
};


GoogleStorage.prototype.getSID = function()
{
    var sidObj = document.getElementById('sid');
    if (!sidObj)
	{
	    alert("ERROR: Not logged in to Google Docs.");
	    return;
	}
    return sidObj.value;
};

GoogleStorage.prototype.lookupFile = function(filename)
{
    var sid = this.getSID();
    if (!sid) return;
    
    var fileurl = "";
    if (filename)
    	fileurl = "&filename=" + filename;
    
    var url = "/FindDoc?sid=" + sid + fileurl;
    var req = this.getxmlhttpreq();
    if (!req) return;

    req.open("GET", url, false);
    req.send(null);
    
    var files = req.responseText.split("\n");
    var fileID = new Array;
    for (var f in files)
    	{
    		var line = files[f].split(" ", 1);
    		fileID.push({docID: line[0], 
    					 name: files[f].substr(line[0].length)});
    	}
    return fileID;
};


GoogleStorage.prototype.loadFile = function(docID)
{
    var sid = this.getSID();
    if (!sid) return;

    var url = "/GetDoc?sid=" + sid + "&docID=" + docID;
    var req = this.getxmlhttpreq();
    
    if (!req) return;

    req.open("GET", url, false);
    req.send(null);
	
    var buf = new Buffer();
    buf.loadBuffer(req.responseText);
    return buf;
};


GoogleStorage.prototype.saveFile = function(docID, content)
{
	var sid = this.getSID();
	if (!sid) return;
	
    var req = this.getxmlhttpreq();
    if (!req) return;
	
    var param = "docID=" + encodeURIComponent(docID) + "&content=";
    param += encodeURIComponent(content);
    
    try {
	req.open("POST", "/SaveDoc", false);
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	req.send(param);

	if (req.status == "200");
	{
	    alert("File saved.");
	}
    } catch (e)
    {
    	alert("Error saving file: " + e + e.description);
    }
};

GoogleStorage.prototype.createFile = function(filename)
{
    var sid = this.getSID();
    if (!sid) return;

    var url = "/CreateDoc?sid=" + sid + "&filename=" + filename;
    var req = this.getxmlhttpreq();
    if (!req) return;

    req.open("GET", url, false);
    req.send(null);
    
    var docID = req.responseText;
    return docID.split(" ", 1)[0];
};

