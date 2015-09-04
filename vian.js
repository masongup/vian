
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

VIANEDITOR = null;

_LOG = function(text)
{
    var logview = document.getElementById('console');
    if (!logview) return;
    
    var log = logview.value.substr(0, 350);
    logview.value = text + "\n" + log;
};


function Vian(div)
{ 
    this.div = div;

    this.lastFocused = null;
    this.buffers = new Array;
    this.frames = new Object;
    this.storage = new GoogleStorage();
    this.cmdframe = new CmdLineFrame(this);

    var frame = new Frame(this);
    var bufEntry = this.addBuffer(null, "Untitled", new Buffer());
    frame.setBuffer(bufEntry);
    this.lastFocused = frame;

    this.frames = [[frame]];

    var table = this.displayFrames();

    this.div.appendChild(table);
    this.div.appendChild(this.cmdframe.div);
    frame.div.focus();

    this.cursorColor = 222;
    this.cursorIncrement = 111;
    //window.setTimeout("VIANEDITOR.cursorBlink();", 50);
}


Vian.prototype.addScript = function(file)
{
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', file);
    return head.appendChild(script);
};


Vian.prototype.showInCmdLine = function(str)
{
    this.cmdframe.controller.f_changeLine(0, str);
};


Vian.prototype.cursorBlink = function()
{
    this.cursorColor = (this.cursorColor + this.cursorIncrement);
    if (this.cursorColor > 999)
	{
	    this.cursorColor = 999;
            this.cursorIncrement = -111;
        }
    else if (this.cursorColor < 444)
	{
	    this.cursorColor = 444;
            this.cursorIncrement = 111;
        }
    var c = this.cursorColor;
    var color = "#" + c; 
    var view = this.lastFocused.view;
    view.cursorColor = color;
    view.syntaxChanged(view.visibleCursorRow);
    window.setTimeout("VIANEDITOR.cursorBlink();", 50);
};


Vian.prototype.getFrame = function(x)
{
    var y = 0;
    for (var i in this.frames)
	{
	    var row = this.frames[i];
	    for (var j in row)
		{
		    if (row[j])
			{
			    if (y >= x)
				return row[j];
			    y++;
			}
		}
	}
};


Vian.prototype.splitFrameHorizontal = function()
{
    var frame = new Frame(this);
    //var buf = this.addBuffer(null, "Untitled", new Buffer());
    frame.setBuffer(this.lastFocused.bufferEntry);

    for (var i in this.frames)
	{
	    var row = this.frames[i];
	    for (var j in row)
		{
		    if (row[j] == this.lastFocused)
			{
			    row.splice(j + 1, 0, frame);
			}
		}
	}
    this.div.replaceChild(this.displayFrames(), this.div.firstChild);
};


Vian.prototype.addBuffer = function(docID, filename, buf)
{
    //FIXME? doesn't check for previous docID.
    var tempname = filename;
    var i = 1;
    while (this.findBufferByName(tempname))
	{
	    tempname = filename + "<" + i + ">";
	    i++;
	}
    
    var bufferEntry = {docID: docID, filename: tempname, buffer: buf};
    this.buffers.push(bufferEntry);
    return bufferEntry;
};


Vian.prototype.findBufferByID = function(docID)
{
    for (var b in this.buffers)
	{
	    if (this.buffers[b].docID == docID)
		return this.buffers[b];
	}
    return null;
};


Vian.prototype.findBufferByName = function(name)
{
    for (var b in this.buffers)
	{
	    if (this.buffers[b].filename == name)
		return this.buffers[b];
	}
    return null;
};



Vian.prototype.displayFrames = function()
{
 
    for (var row in this.frames)
	{
	    var table = document.createElement("table");
	    table.style.width="100%";
	    table.style.margin = "0px 0px 0px 0px";
	    table.style.padding = "0px 0px 0px 0px";
	    table.cellSpacing = "0";

	    var tbody = document.createElement("tbody");

	    var tr = document.createElement("tr");

	    for (var f in this.frames[row])
		{  
		    var td = document.createElement("td");
		    td.style.margin = "0px 0px 0px 0px";  
		    td.style.padding = "0px 0px 0px 0px";
		    td.style.borderLeft = "1px solid black";
		    var frame = this.frames[row][f];
		    td.appendChild(frame.div);
		    tr.appendChild(td);
		}
	    tbody.appendChild(tr);
	    table.appendChild(tbody);
	}
    return table;
};


Vian.prototype.openOrCreateFile = function(filename)
{
    var files = this.storage.lookupFile(filename);
    var docID;


    if (!files[0] || !files[0].docID)
    	{
	    docID = this.storage.createFile(filename);
	    if (!docID)
		return;
    	}
    else 
    	{
	    docID = files[0].docID;
    	}
    var buffer = this.storage.loadFile(docID);
    var bufEntry = this.addBuffer(docID, filename, buffer);
    this.lastFocused.setBuffer(bufEntry);
    this.lastFocused.controller.moveCursorTo(0, 0);
};


Vian.prototype.saveFile = function(optName)
{
    var docID = this.lastFocused.bufferEntry.docID;
    var filename = optName || this.lastFocused.bufferEntry.filename;

    if (optName)
	{
	    var files = this.storage.lookupFile(filename);
	    if (files.length > 0)
		{
		    var result = confirm(filename + " exists.  Overwrite?");
		    if (!result)
			{
			    return;
			}
		    docID = files[0].docID;
		}
	    else
		{
		    docID = this.storage.createFile(filename);
		    if (!docID)
			return;
		}
	}

    if (!docID || !filename)
	return;

	
    this.lastFocused.bufferEntry.docID = docID;
    this.lastFocused.bufferEntry.filename = filename;
    this.lastFocused.statusbar.fileChanged({filename: filename});

    var content = this.lastFocused.buffer.exportText();
    this.showInCmdLine("Saving file as: " + filename);
    this.storage.saveFile(docID, content);
};


Vian.prototype.quit = function(filename)
{
};




