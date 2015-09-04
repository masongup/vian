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



function Controller(frame)
{
    this.frame = frame;

    this.defaultInsertMode = new InsertMode;
    this.defaultReplaceMode = new ReplaceMode;
    this.defaultCommandMode = new CommandMode;

    this.majorMode = new FundamentalMode;
    this.minorModes = new Array;
    this.minorModes[0] = this.defaultCommandMode;
    
    //this.undoHistory = new Array;
    //this.undoPtr = -1;
    //this.undoID = 0;
    //this.inUndoChain = false;
    this.currentTransaction = new Array;
    
    this.cursorRow = 0;
    this.cursorCol = 0;
    this.cursorIdealCol = 0;

    this.tabSpacing = 4;
    this.buffer = null;
    this.lastFocused = null;
    this.modifiers = 0;
    this.charMap = CharMap_101us;

    this.addCustomEvent('cursorMoved');
    this.addCustomEvent('minorModesChanged');
}

Controller.prototype = new CustomEvObject;
Controller.prototype.constructor = Controller;

/**
 * This function changes itself to fit the browser when it is first run.
 */
Controller.prototype.stopEvent = function(ev)
{
    if (ev.preventDefault)
	{
	    Controller.prototype.stopEvent = function (evt) 
	    {
		evt.preventDefault();
		evt.stopPropagation();
	    };
	}
    else
	{
	    Controller.prototype.stopEvent = function (evt) 
	    {
		evt.returnValue = false;
		window.event.cancelBubble = true;
	    };
	}
    return this.stopEvent(ev);
};


Controller.prototype.keyPressed = function(key)
{

    if (this.majorMode.keyPressed && this.majorMode.keyPressed(this, key))
	{
	    return false;
	}


    for (var i = this.minorModes.length - 1; i >= 0; i--)
	{
	    if (this.minorModes[i].keyPressed(this, key))
		{
		    return false;
		}
	}


    return false;
};


Controller.prototype.modifierString = function()
{
    var m = '';
    if (this.modifiers & 0x0800) m += 'C-';
    if (this.modifiers & 0x1000) m += 'M-';
    return m;
};


Controller.prototype.handleKeyPress = function(ev) 
{
    this.stopEvent(ev ? ev : window.event);
    return false;
};


Controller.prototype.handleKeyDown = function(ev) 
{
    if (!ev) { ev = window.event; }
    
    var key = ev.keyCode + (this.modifiers & 0x0400);
    var keyString = this.charMap[key];

    if (keyString)
	{
	    if (keyString == '<shift>')
		{
		    this.modifiers = this.modifiers | 0x0400;
		} 
	    else if (keyString == '<ctrl>')
		{
		    this.modifiers = this.modifiers | 0x0800;
		}
	    else if (keyString == '<alt>')
		{
		    this.modifiers = this.modifiers | 0x1000;
		}
	    else 
		{
		    this.keyPressed(this.modifierString() + keyString);
		}
	}
    this.stopEvent(ev);
    return false;
};


Controller.prototype.handleKeyUp = function(ev)
{
    if (!ev) { ev = window.event; }

    var keyString = this.charMap[ev.keyCode];
    if (keyString == '<shift>')
	{
	    this.modifiers = this.modifiers & 0xfbff;
	}
    else if (keyString == '<ctrl>')
	{
	    this.modifiers = this.modifiers & 0xf7ff;
	}
    else if (keyString == '<alt>')
	{
	    this.modifiers = this.modifiers & 0xefff;
	}

    this.stopEvent(ev);
    return false;
};


Controller.prototype.cursorPosition = function()
{
    return {row: this.cursorRow, col: this.cursorCol};
};


Controller.prototype.commitTransaction = function()
{
    if (this.currentTransaction.length > 0)
	{
            this.currentTransaction.dateAdded = new Date().getTime();
            this.currentTransaction.undoID = this.buffer.undoID++;
	    this.buffer.undoHistory.push(this.currentTransaction);
	    this.currentTransaction = new Array;
	}
};


Controller.prototype.addUndoFunc = function(undoFunc)
{
    this.currentTransaction.push(undoFunc);
};


Controller.prototype.resetUndo = function()
{
    if (this.buffer.inUndoChain)
	{
	    this.commitTransaction();
	    this.buffer.inUndoChain = false;
	}
};


Controller.prototype.undo = function(times)
{
    for (var j = 0; j < times; j++)
	{
	    if (!this.buffer.inUndoChain)
		{
		    this.buffer.undoPtr = this.buffer.undoHistory.length - 1;
		    this.buffer.inUndoChain = true;
		}
	    if (this.buffer.undoPtr < 0) 
		{
		    this.frame.editor.showInCmdLine("No more undo info. Hit <esc> to reset undo.");
		    this.commitTransaction();
		    return;
		}

	    var transaction = this.buffer.undoHistory[this.buffer.undoPtr--];
	    if (transaction)
		{
		    var date = new Date(transaction.dateAdded);
		    this.frame.editor.showInCmdLine("[Undo " + transaction.undoID + "] " + date);
		    for (var i = transaction.length - 1; i >= 0; i--)
			{
			    var undoFunc = transaction[i];
			    undoFunc();
			}
		}
	}
    this.commitTransaction();
};


Controller.prototype.evalBuffer = function()
{
    try
	{
	    eval(this.buffer.exportText());
	}
    catch (error)
	{
	    alert(error);
	}
};


Controller.prototype.changeMinorMode = function(which, mode)
{
    this.minorModes[which] = mode;

    var modes = this.minorModes[0].displayName;
    for (var i = 1; i < this.minorModes.length; i++)
      {
        modes += " " + this.minorMode[i].displayName;
      }

    this.fireCustomEvent('minorModesChanged', {modes: modes} );
};


Controller.prototype.insertTextAtCursor = function(text)
{
    this.resetUndo();
    var curText = this.buffer.getLine(this.cursorRow);
    var prior = curText.substr(0, this.cursorCol);
    var post = curText.substr(this.cursorCol);
    
    this.f_changeLine(this.cursorRow, prior + text + post);
    this.moveCursorHorizontal(text.length);
};


Controller.prototype.replaceTextAtCursor = function(text)
{
    this.resetUndo();
    var len = text.length;
    var oldText = this.buffer.getLine(this.cursorRow);
    var prior = oldText.substr(0, this.cursorCol);
    var post = oldText.substr(this.cursorCol + len);
    var newText = prior + text + post;
    this.f_changeLine(this.cursorRow, newText);
    this.moveCursorHorizontal(text.length);
};


Controller.prototype.indentLine = function()
{
    if (this.majorMode.indentLine)
      {
         var orig = this.buffer.getLine(this.cursorRow);
         var text = this.majorMode.indentLine(this, this.cursorRow, this.buffer);
         var diff = text.length - orig.length;
         this.f_changeLine(this.cursorRow, text);
         this.moveCursorHorizontal(diff);
      }
};


Controller.prototype.backspace = function(num)
{
    this.resetUndo();
    var text = this.buffer.getLine(this.cursorRow);
    var prior = text.substr(0, this.cursorCol - num);
    var post = text.substr(this.cursorCol);
    var newText = prior + post; 
    this.f_changeLine(this.cursorRow, newText);
    var newCol = this.cursorCol - num;
    if (newCol < 0) 
	{
	    newCol = 0;
	}
    this.moveCursorTo(this.cursorRow, newCol);
    if (num > 1)
	this.commitTransaction();
};


Controller.prototype.deleteForward = function(num)
{
    this.resetUndo();
    var text = this.buffer.getLine(this.cursorRow);
    var prior = text.substr(0, this.cursorCol);
    var post = text.substr(this.cursorCol + num);
    var newText = prior + post; 
    this.f_changeLine(this.cursorRow, newText);
    if (num > 1)
	this.commitTransaction();
};


Controller.prototype.changeForward = function(num)
{
    this.deleteForward(num);
    this.changeMinorMode(0, this.defaultInsertMode);
};

Controller.prototype.changeBackward = function(num)
{
    this.backspace(num);
    this.changeMinorMode(0, this.defaultInsertMode);
};

Controller.prototype.newLine = function()
{
    this.resetUndo();
    var text = this.buffer.getLine(this.cursorRow);
    var prior = text.substr(0, this.cursorCol);
    var post = text.substr(this.cursorCol);
    this.f_changeLine(this.cursorRow, prior);
    this.f_insertLine(this.cursorRow + 1, post);
    this.moveCursorTo(this.cursorRow + 1, 0);
    this.indentLine();
    this.commitTransaction();
};


Controller.prototype.insertLineBefore = function()
{
    if (this.cursorRow == 0)
	{
	    this.moveCursorHome();
	    this.newLine(); 
	    this.moveCursorTo(0,0);
	}
    else
	{
	    this.moveCursorVertical(-1); 
	    this.moveCursorEnd(); 
	    this.newLine(); 
	}
    this.changeMinorMode(0, this.defaultInsertMode);
};


Controller.prototype.deleteToEndOfLine = function()
{
    this.resetUndo();
    var text = this.buffer.getLine(this.cursorRow);
    var prior = text.substr(0, this.cursorCol);
    this.f_changeLine(this.cursorRow, prior);
    this.commitTransaction();
};


Controller.prototype.changeToEndOfLine = function()
{
    this.deleteToEndOfLine();
    this.changeMinorMode(0, this.defaultInsertMode);
};


Controller.prototype.deleteLines = function(numLines)
{
    this.resetUndo();
    //save deleted lines in buffer
    this.yankLines(numLines);

    if (!numLines) numLines = 1;
    var limit = numLines;
    var diff = this.buffer.numLines() - this.cursorRow;
    if (limit > diff)
	{
	    limit = diff;
	}

    for (var i = 0; i < limit; i++)
	{
	    this.f_deleteLine(this.cursorRow);
	    if (this.cursorRow >= this.buffer.numLines())
		{
		    this.moveCursorVertical(-1);
		}
	}
    this.commitTransaction();
};


Controller.prototype.joinLines = function()
{
    this.resetUndo();
    var row = this.cursorRow;
    var line1 = this.buffer.getLine(row); 
    var line2 = this.buffer.getLine(row + 1);
   
    this.f_changeLine(row, line1 + line2);
    this.f_deleteLine(row + 1);   
    this.commitTransaction();
};


Controller.prototype.yankLines = function(numLines)
{
    this.yankBuffer = new Array;
    if (!numLines)
	{
	    numLines = 1;
	}
    var lineLimit = this.cursorRow + numLines; 
    if (lineLimit > this.buffer.numLines())
	{
	    lineLimit = this.buffer.numLines();
	}
    for (var i = this.cursorRow; i < lineLimit; i++)
	{
	    this.yankBuffer.push(this.buffer.getLine(i));
	}
};


Controller.prototype.putLines = function(putBefore)
{
    this.resetUndo();
    var row = putBefore ? this.cursorRow : this.cursorRow + 1;

    for (var i = this.yankBuffer.length - 1; i >= 0; i--)
	{
	    this.f_insertLine(row, this.yankBuffer[i]);
	}
    this.commitTransaction();
};


Controller.prototype.deleteWord = function(times)
{
    this.resetUndo();
    var mark = {row: this.cursorRow, col: this.cursorCol};
    var row = this.cursorRow;
    var col = this.cursorCol;
    var point = mark;
    for (var i = 0; i < times; i++)
	{
	    point = this.nextWordLoc(row, col);
	    row = point.row;
	    col = point.col;
	} 
    this.deleteRange(mark, point);
    this.commitTransaction();
};


Controller.prototype.changeWord = function(times)
{
    this.deleteWord(times);
    this.changeMinorMode(0, this.defaultInsertMode);
};


Controller.prototype.deleteWordBwd = function(times)
{
    this.resetUndo();
    var point = {row: this.cursorRow, col: this.cursorCol};
    for (var i = 0; i < times; i++)
	{
	    this.moveCursorWordBwd();
	}
    var mark = {row: this.cursorRow, col: this.cursorCol};
    this.deleteRange(mark, point);
    this.commitTransaction();
};


Controller.prototype.changeWordBwd = function(times)
{
    this.deleteWordBwd(times);
    this.changeMinorMode(0, this.defaultInsertMode);
};


Controller.prototype.deleteRange = function(mark, point)
{
    if (mark.row == point.row)
	{
	    var text = this.buffer.getLine(mark.row);
	    var prior = text.substr(0, mark.col);
	    var post = text.substr(point.col);
	    this.f_changeLine(mark.row, prior + post);
	    return;
	}
    var text = this.buffer.getLine(mark.row);
    this.f_changeLine(mark.row, text.substr(0, mark.col));
    var row = mark.row + 1;
    for (var i = 0; i < point.row - row; i++)
	{
	    this.f_deleteLine(row);
	}
    var markText = this.buffer.getLine(mark.row);
    var pointText = this.buffer.getLine(row);
    this.f_changeLine(mark.row, markText + pointText.substr(point.col));
    this.f_deleteLine(row);
};


Controller.prototype.prevLoc = function(row, col)
{
    if (row <= 0 && col <= 0)
	return null;
    if (col == 0)
	return {row: row - 1, col: this.buffer.lineLength(row - 1)};
    return {row: row, col: col - 1};
};

Controller.prototype.nextLoc = function(row, col)
{
    if (this.buffer.atEndOfDocument(row, col))
	return null;
    if (col >= this.buffer.lineLength(row))
	return {row: row + 1, col: 0};
    return {row: row, col: col + 1};
};


Controller.prototype.inWord = function(row, col)
{
    var wordMatch = this.majorMode.word;
    var c = this.buffer.getCharAt(row, col); 
    if (c && c.match(wordMatch))
	return true;
    return false;
};


Controller.prototype.inWhitespace = function(row, col)
{
    var whitespace = this.majorMode.whitespace;
    var c = this.buffer.getCharAt(row, col); 
    if (!c || c.match(whitespace))
	return true;
    return false;
};


Controller.prototype.inPunctuation = function(row, col)
{
    var wordMatch = this.majorMode.word;
    var whitespace = this.majorMode.whitespace;
    var c = this.buffer.getCharAt(row, col); 
    if (c && !c.match(wordMatch) && !c.match(whitespace))
	return true;
    return false;
};


Controller.prototype.atEndOfWord = function(row, col)
{
    if (this.inWord(row, col))
	{
	    var loc = this.nextLoc(row, col);
	    if (!loc || !this.inWord(loc.row, loc.col))
		return true;
	}
    return false;
};

//assuming we're in a word or punctuation, gives location of beginning of word
Controller.prototype.startWordLoc = function(row, col)
{
    var wordMatch = this.majorMode.word;
    var loc = {row: row, col: col};
    this.inEntity = null;

    if (this.inWord(row, col))
	this.inEntity = this.inWord;
    else if (this.inPunctuation(row, col))
	this.inEntity = this.inPunctuation;

    if (!this.inEntity)
	return loc;

    while (this.inEntity(loc.row, loc.col)) 
	{
	    row = loc.row;
	    col = loc.col;
	    loc = this.prevLoc(row, col);
	    if (!loc)
		return {row: 0, col: 0};
	    else if (loc.row != row)
		{
		    return {row: row, col: col};
		}
	}
    return {row: row, col: col};
};


//find end of previous word
Controller.prototype.prevWordLoc = function(row, col)
{
    var wordMatch = this.majorMode.word;
    var whitespace = this.majorMode.whitespace;
    var loc = {row: row, col: col};
    this.inEntity = null;

    if (this.inWord(row, col))
	this.inEntity = this.inWord;
    else if (this.inPunctuation(row, col))
	this.inEntity = this.inPunctuation;

    if (this.inEntity) //skip it
	{
	    while (this.inEntity(row, col))
		{
		    loc = this.prevLoc(row, col);
		    if (!loc)
			return {row: 0, col: 0};
		    else if (loc.row != row)
			return {row: loc.row, col: loc.col};
		    row = loc.row;
		    col = loc.col;
		}
	}
    
    //in whitespace, find word 
    while (this.inWhitespace(row, col))
	{
	    loc = this.prevLoc(row, col);
	    if (!loc)
		return {row: 0, col: 0};
	    if (loc.row != row)
		return {row: loc.row, col: loc.col};
	    row = loc.row;
	    col = loc.col;
	}
    return {row: row, col: col};
};


//find beginning of next word
Controller.prototype.nextWordLoc = function(row, col)
{
    var wordMatch = this.majorMode.word;
    var whitespace = this.majorMode.whitespace;
    var loc = {row: row, col: col};
    this.inEntity = null;

    if (this.inWord(row, col))
	this.inEntity = this.inWord;
    else if (this.inPunctuation(row, col))
	this.inEntity = this.inPunctuation;

    if (this.inEntity) //skip it
	{
	    while (this.inEntity(row, col))
		{
		    loc = this.nextLoc(row, col);
		    if (!loc)
			return {row: row, col: col};
		    row = loc.row;
		    col = loc.col;
		}
	}

    //now skip whitespace
    while (this.inWhitespace(row, col))
	{
	    loc = this.nextLoc(row, col);
	    if (!loc)
		return {row: row, col: col};
	    else if (loc.row != row)
		return {row: loc.row, col: loc.col};
	    row = loc.row;
	    col = loc.col;
	}
    return {row: row, col: col};
};


//assuming we're in a word, find end of it
Controller.prototype.endWordLoc = function(row, col)
{
    var wordMatch = this.majorMode.word;
    
    var loc;
    while (this.inWord(row, col))
	{
	    loc = this.nextLoc(row, col);
	    if (!loc)
		return {row: row, col: col};
	    row = loc.row;
	    col = loc.col;
	}
    loc = this.prevLoc(row, col);
    return {row: loc.row, col: loc.col};
};


/**
 * Fundamental editing functions: all other 
 * editing functions should be written in terms of these.
 * These add to the undo chain.
 */
Controller.prototype.f_changeLine = function(row, newText)
{
    var cur = this.cursorPosition();
    var oldText = this.buffer.getLine(row);
    this.buffer.setLine(row, newText);

    var that = this;
    var undoFunc = function()
    {
	that.f_changeLine(row, oldText);
	that.moveCursorTo(cur.row, cur.col);
    };
    this.addUndoFunc(undoFunc);
};


Controller.prototype.f_deleteLine = function(row)
{
    var cur = this.cursorPosition();
    var deletedLine = {row: row, text: this.buffer.deleteLine(row)}; 

    var that = this;
    var undoFunc = function()
    {
	that.f_insertLine(deletedLine.row, deletedLine.text);
	that.moveCursorTo(cur.row, cur.col);
    };
    this.addUndoFunc(undoFunc);
};


Controller.prototype.f_insertLine = function(row, text)
{
    var cur = this.cursorPosition();
    this.buffer.insertLine(row, text); 

    var that = this;
    var undoFunc = function()
    {
	that.f_deleteLine(row);
	that.moveCursorTo(cur.row, cur.col);
    };
    this.addUndoFunc(undoFunc);
};


/**
 * Cursor movement functions.
 */
Controller.prototype.moveCursorWordFwd = function()
{
    var loc = this.nextWordLoc(this.cursorRow, this.cursorCol);
    this.cursorRow = loc.row;
    this.cursorCol = loc.col;
    this.fireCustomEvent('cursorMoved', this.cursorPosition());
};


Controller.prototype.moveCursorWordBwd = function()
{
    var row = this.cursorRow;
    var loc = this.prevLoc(this.cursorRow, this.cursorCol);
    if (!loc)
	{
	    this.cursorRow = 0;
	    this.cursorCol = 0;
	    return;
	}
    else if (loc.row == row)
	{
	    if (this.inWord(loc.row, loc.col) || this.inPunctuation(loc.row, loc.col))
		{
		    loc = this.startWordLoc(loc.row, loc.col);
		}
	    else 
		{
		    loc = this.prevWordLoc(loc.row, loc.col);
		    loc = this.startWordLoc(loc.row, loc.col);
		}
	}
    this.cursorRow = loc.row;
    this.cursorCol = loc.col;
    this.fireCustomEvent('cursorMoved', this.cursorPosition());
};


Controller.prototype.moveCursorWordEnd = function()
{
    var loc = {row: this.cursorRow, col: this.cursorCol};
    if (!this.inWord(loc.row, loc.col) || this.atEndOfWord(loc.row, loc.col))
	{
	    loc = this.nextWordLoc(this.cursorRow, this.cursorCol);
	}
    loc = this.endWordLoc(loc.row, loc.col);
    this.cursorRow = loc.row;
    this.cursorCol = loc.col;
    this.fireCustomEvent('cursorMoved', this.cursorPosition());
};


Controller.prototype.moveCursorTo = function(row, col)
{
    this.cursorRow = row;
    this.cursorCol = col;
    this.cursorIdealCol = col;
    this.fireCustomEvent('cursorMoved', this.cursorPosition());
};


Controller.prototype.moveCursorHome = function()
{
    this.cursorCol = 0;
    this.fireCustomEvent('cursorMoved', this.cursorPosition());
};


Controller.prototype.moveCursorEnd = function()
{
    this.cursorCol = this.buffer.lineLength(this.cursorRow);
    this.fireCustomEvent('cursorMoved', this.cursorPosition());
};


Controller.prototype.moveCursorHorizontal = function(howMuch)
{
    var colLimit = this.buffer.lineLength(this.cursorRow);
    this.cursorCol += howMuch;
    if (this.cursorCol < 0)
	{
	    this.cursorCol = 0;
	} 
    else if (this.cursorCol > colLimit)
	{
	    this.cursorCol = colLimit;
	}

    this.fireCustomEvent('cursorMoved', this.cursorPosition());
    this.cursorIdealCol = 0;
};


Controller.prototype.moveCursorVertical = function(howMuch)
{
    var oldCursorRow = this.cursorRow;
    if (this.cursorCol > this.cursorIdealCol) 
	{
	    this.cursorIdealCol = this.cursorCol;
	}
    
    var rowLimit = this.buffer.numLines() - 1;
    this.cursorRow += howMuch;
    if (this.cursorRow > rowLimit)
	{
	    this.cursorRow = rowLimit;
	}
    else if (this.cursorRow < 0)
	{
	    this.cursorRow = 0;
	}

    var colLimit = this.buffer.lineLength(this.cursorRow);
    if (this.cursorIdealCol > this.cursorCol)
	{ 
	    this.cursorCol = this.cursorIdealCol; 
	}
    if (this.cursorCol > colLimit)
	{
	    this.cursorCol = colLimit;
	}

    this.fireCustomEvent('cursorMoved', this.cursorPosition());
};


