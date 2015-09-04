
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


function Buffer()
{
    this.text = new Array;
    this.text[0] = "";
    this.addCustomEvent('lineChanged');
    this.addCustomEvent('lineAdded');
    this.addCustomEvent('lineDeleted');

    this.undoHistory = new Array;
    this.undoPtr = -1;
    this.undoID = 0;
    this.inUndoChain = false;
}

Buffer.prototype = new CustomEvObject;
Buffer.prototype.constructor = Buffer;

Buffer.prototype.text = null;

Buffer.prototype.exportText = function()
{
    var string = this.text[0];
    for (var i = 1; i < this.text.length; i++)
	{
	    string += "\n" + this.text[i];
	}
    return string;
};

Buffer.prototype.getLine = function(row)
{
    var line = this.text[row];
    if (line)
        return line;
    return "";
};


Buffer.prototype.getCharAt = function(row, col)
{
    if (row >= this.text.length)
       return null;
    if (col >= this.text[row].length)
       return null;

    return this.text[row].substr(col, 1);
};


Buffer.prototype.numLines = function()
{
    return this.text.length;
};    


Buffer.prototype.lineLength = function(row)
{
    if (this.text[row])
	return this.text[row].length;
    return 0;
};


Buffer.prototype.atEndOfLine = function(row, col)
{
    if (col >= this.text[row].length)
        return true;
    return false;
};


Buffer.prototype.atLastLine = function(row)
{
    if (row == this.text.length - 1)
        return true;
    return false;
};


Buffer.prototype.atEndOfDocument = function(row, col)
{
    if (row == this.text.length - 1 && col == this.text[row].length)
        return true;
    return false;
};

    
Buffer.prototype.regexpSearch = function(regexp, row, col)
{
    if (row == null) { row = 0; }
    if (col == null) { col = 0; }

    var rx = new RegExp(regexp);
     
    var test = this.text[row].substr(col);
    while(row < this.text.length - 1)
        {
	    var result = rx.exec(test);
	    if (result)
		{
		    return {row: row, col: result.index + col};
		}
	    col = 0;
	    test = this.text[++row];
	}
};




Buffer.prototype.deleteLine = function(row)
{
    if (!(row >= 0))
	return;
    if (row == 0 && this.text.length == 1)
	{
	    var text = this.text[0];
	    this.text[0] = '';
	    this.fireCustomEvent('lineChanged', {row: 0, text: ''});
	    return text;
	}

    this.fireCustomEvent('lineDeleted', {row: row} );
    //return deleted text
    var text = this.text[row];
    this.text.splice(row, 1);
    return text;
};


Buffer.prototype.setLine = function(row, text)
{
    this.text[row] = text;
    this.fireCustomEvent('lineChanged', {row: row, text: text});
};


Buffer.prototype.insertLine = function(row, newText)
{
    this.text.splice(row, 0, newText); 
    this.fireCustomEvent('lineAdded', {row: row, text: newText});
};


Buffer.prototype.loadBuffer = function(text)
{
    text = text.replace(/\t/g, '      ');
    this.text = text.split(/\n/);
    for (i = 0; i < this.text.length; i++)
	{
	    this.text[i] = this.text[i].replace(/\r|\n/g, '');
	}
};

