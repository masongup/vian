
/* Copyright (c) 2007-2010 Ian Paul Larsen
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or 
 * sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,r
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */


var _SYNTAXVIEW = new Array();


/**
 * The View object parses the text lines from the buffer into span elements
 * and holds those elements in an array.
 **/

function View(frame, controller)
{
    var that = this;

    _SYNTAXVIEW[this.id] = this;

    this.id = View.prototype.id++;
    this.frame = frame;

    this.controller = controller;

    this.highlighter = new SyntaxHighlighter; 
    this.syntaxPoints = new Array();
    this.synTimeout = null;

    this.lines = null;
    this.buffer = null;

    this.rows = 20;
    this.topRowShown = 0;

    this.visibleCursorRow = 0;
    this.visibleCursorCol = 0;
    this.cursorElement = null;
    this.cursorIdealCol = 0;
    this.cursorColor = "#aaccdd";
    this.cursorTextColor = "#222222";

    this.foregroundColor = "#f5deb3";
    this.backgroundColor = "#2f4f4f";
    this.pMargin = "0px 0px 0px 0px";
    this.nulltext = "*** This buffer is currently empty ***";

    this.viewport = document.createElement("DIV");
    this.viewport.tabIndex = this.id;
    this.viewport.id = "viewport" + this.id;
    this.viewport.style.fontSize = "13px";
    this.viewport.style.border = "0px solid red";
    this.viewport.style.fontFamily = "monospace";
    this.viewport.style.overflowY = "hidden";
    this.viewport.style.overflowX = "auto";
    this.viewport.style.color = this.foregroundColor;
    this.viewport.style.backgroundColor = this.backgroundColor;

    this.viewport.onkeypress = function(ev) { return that.controller.handleKeyPress(ev) };
    this.viewport.onkeydown = function(ev) { return that.controller.handleKeyDown(ev) };
    this.viewport.onkeyup = function(ev) { return that.controller.handleKeyUp(ev) };
}


View.prototype = new CustomEvObject;
View.prototype.constructor = View;
View.prototype.id = 0;


View.prototype.parseLine = function(lineNumber) 
{
    var that = this;
    var element = document.createElement("PRE");
    element.style.margin = this.pMargin;
    element.onclick = function (e) { that.lineClicked(e, lineNumber); };

    var text = this.lines[lineNumber].text;
    var lineText = text; //lineText should never change.
    if (text == null) text = '';

    var pState = null;
    if (this.lines[lineNumber - 1])
      {
        pState = this.lines[lineNumber - 1].state;
      }

    var syntax = this.highlighter.getSyntaxHints(this.controller.majorMode, text, pState);
    var hints = syntax.hints;
    var state = syntax.state;

    if (lineNumber == this.visibleCursorRow) 
	{
	    var cursorCol = this.visibleCursorCol;

	    var cursor = document.createElement("SPAN");
	    this.cursorElement = cursor;
	    var cursorText = text.substr(cursorCol, 1);
	    cursor.appendChild(document.createTextNode(cursorText || ' '));
	    cursor.style.backgroundColor = this.cursorColor;
	    cursor.style.color = this.cursorTextColor;

	    for (var i = 0; i < hints.length; i++) {
		    var hint = hints[i];
		    var e = document.createElement('SPAN');
		    if (hint.color)
			e.style.color = hint.color;
		    var t = text.substr(0, hint.length);
		    text = text.substr(hint.length);
		    if (cursorCol >= 0 && cursorCol < hint.length)
			{
			    var prior = t.substr(0, cursorCol);
			    var post = t.substr(cursorCol + 1);
			    e.appendChild(document.createTextNode(prior));
			    e.appendChild(cursor);
			    e.appendChild(document.createTextNode(post));
			    cursorCol = -1;
			}
		    else
			{
			    cursorCol -= hint.length;
			    e.appendChild(document.createTextNode(t));
			}
		    element.appendChild(e);
		}
	    if (!cursorText)
		element.appendChild(cursor);
	} 
    else 
	{
	    for (var i in hints)
		{
		    var hint = hints[i];
		    var e = document.createElement('SPAN');
		    if (hint.color)
			e.style.color = hint.color;
		    var t = text.substr(0, hint.length);
		    text = text.substr(hint.length);
		    e.appendChild(document.createTextNode(t));
		    element.appendChild(e);
		}
	    element.appendChild(document.createTextNode(' '));
	}
  
    return {element: element, state: state, text: lineText};
};


View.prototype.lineClicked = function(ev, line)
{
    ev = ev ? ev : window.event;

    var oldRow = this.visibleCursorRow;
    
    var element = this.viewport;
    var offset = element.offsetLeft;
    while (element.offsetParent)
	{
	    element = element.offsetParent;
	    offset += element.offsetLeft;
	}
    
    offset = ev.clientX - offset;

    this.visibleCursorRow = line;
    this.visibleCursorCol = 0;
    this.lines[line] = this.parseLine(line);
    this.viewport.replaceChild(this.lines[line].element, this.viewport.childNodes[line - this.topRowShown]);
    while (this.visibleCursorCol < this.buffer.lineLength(line) && this.cursorElement.offsetLeft < offset)
	{
	    this.visibleCursorCol++;
	    this.lines[line] = this.parseLine(line);
	    this.viewport.replaceChild(this.lines[line].element, this.viewport.childNodes[line - this.topRowShown]);
	}
    if (this.visibleCursorCol > 0 && this.cursorElement.offsetLeft > offset)
	{
	    this.visibleCursorCol--;
	}
    this.syntaxChanged(oldRow);
    this.controller.moveCursorTo(this.visibleCursorRow, this.visibleCursorCol);
};


View.prototype.setBuffer = function(buf) 
{
    this.buffer = buf;
    this.lines = new Array();    
    for (var i = 0; i < this.buffer.text.length; i++) 
	{
	    this.lines[i] = {element: null, state: null, text: this.buffer.getLine(i)};
	    this.lines[i] = this.parseLine(i);
	}
    this.redraw();
};


View.prototype.cursorMoved = function(ev)
{
    var oldRow = this.visibleCursorRow;
    this.visibleCursorRow = ev.row;
    this.visibleCursorCol = ev.col;
    this.syntaxChanged(oldRow);
    if (ev.row != oldRow)
	{
	    this.syntaxChanged(ev.row);
	}
    this.showCursor();
    this.fillLines();
};


View.prototype.runSyntaxHighlighter = function(ev)
{
    var i = this.syntaxPoints.pop();
    
    var limit = this.rows * 2;
    while (limit-- > 0 && i)
      {
        if (i < this.lines.length)
          {
            this.syntaxChanged(i);
          }
        i = this.syntaxPoints.pop();
      }
    this.synTimeout = null;
    if (i)
      {
        this.syntaxPoints.push(i);
        this.syntaxTimeout();
      }
};


View.prototype.syntaxTimeout = function()
{
    if (!this.synTimeout)
	{
	    this.synTimeout = window.setTimeout("_SYNTAXVIEW[" + this.id + "].runSyntaxHighlighter();", 30);
	}
};


View.prototype.syntaxChanged = function(row)
{
    if (!this.lines[row])
	return;
    var oldState = this.lines[row].state;
    this.lines[row] = this.parseLine(row);
    if (oldState != this.lines[row].state)
      {
        this.syntaxPoints.push(row + 1);
        this.syntaxTimeout();
      }

    var j = row - this.topRowShown;
    if (j >= 0 && j < this.viewport.childNodes.length)
	{
	    this.viewport.replaceChild(this.lines[row].element, this.viewport.childNodes[j]);
	}
};


View.prototype.lineChanged = function(ev)
{
    var oldState = this.lines[ev.row].state;
    this.lines[ev.row].text = ev.text;
    this.lines[ev.row] = this.parseLine(ev.row);
    if (oldState != this.lines[ev.row].state)
      {
        this.syntaxPoints.push(ev.row + 1);
        this.syntaxTimeout();
      }

    var j = ev.row - this.topRowShown;
    if (j >= 0 && j < this.rows)
	{
	    this.viewport.replaceChild(this.lines[ev.row].element, this.viewport.childNodes[j]);
	}
};


View.prototype.lineDeleted = function(ev)
{
    var oldVisCurRow = this.visibleCursorRow;
    this.lines.splice(ev.row, 1);
    if (ev.row < oldVisCurRow) oldVisCurRow--;
    this.syntaxPoints.push(ev.row);
    this.syntaxTimeout();

    if (ev.row >= this.topRowShown && ev.row < this.topRowShown + this.rows)
	{
	    var j = ev.row - this.topRowShown; 
	    if (this.viewport.childNodes[j])
		{
		    this.viewport.removeChild(this.viewport.childNodes[j]);
		}
	}
    this.syntaxChanged(this.visibleCursorRow);
    if (oldVisCurRow != this.visibleCursorRow)
	{
	    this.syntaxChanged(oldVisCurRow);
	}
    this.fillLines();
};
 

View.prototype.lineAdded = function(ev)
{
    var oldVisCurRow = this.visibleCursorRow;
    if (ev.row <= oldVisCurRow) oldVisCurRow++;
    this.lines.splice(ev.row, 0, {element: null, state: null, text: ev.text});
    this.lines[ev.row] = this.parseLine(ev.row);
    this.syntaxPoints.push(ev.row + 1);
    this.syntaxTimeout();
   
    var j = ev.row - this.topRowShown;
    if (j >= 0 && j < this.rows)
	{
	    this.viewport.insertBefore(this.lines[ev.row].element, this.viewport.childNodes[j]);
	    this.viewport.removeChild(this.viewport.lastChild);
	}
    this.syntaxChanged(this.visibleCursorRow);
    if (oldVisCurRow != this.visibleCursorRow)
	{
	    this.syntaxChanged(oldVisCurRow);
	}
};


View.prototype.fillLines = function()
{
    while (this.viewport.childNodes.length < this.rows)
	{
	    var i = this.viewport.childNodes.length + this.topRowShown; 
	    if (i < this.lines.length)
		{
		    this.viewport.appendChild(this.lines[i].element);
		}
	    else 
		{
		    var blankLine = document.createElement("P");
		    blankLine.style.margin = this.pMargin;
		    blankLine.appendChild(document.createTextNode("~"));
		    blankLine.style.color = "#bbbbff";
		    this.viewport.appendChild(blankLine);        
		}
	}
};


View.prototype.showCursor = function()
{
    var cursorRow = this.visibleCursorRow;

    //scroll if necessary
    if (cursorRow < this.topRowShown)
      {
        var difference = this.topRowShown - cursorRow;
        if (difference > this.rows)
          {
	      this.topRowShown = cursorRow;
	     this.redraw();
             return;        
          }

        while (cursorRow < this.topRowShown)
	  {
	    this.topRowShown--;
	    this.viewport.insertBefore(this.lines[this.topRowShown].element, this.viewport.firstChild);
            this.viewport.removeChild(this.viewport.lastChild);
	  }
      }
    else if (cursorRow >= this.topRowShown + this.rows)
	{
            var difference = cursorRow - (this.topRowShown + this.rows);
	    if (difference > this.rows)
              {
		  this.topRowShown = 1 + cursorRow - this.rows;
		  this.redraw(); 
		  return;
              }
            
            while (cursorRow >= this.topRowShown + this.rows)
		{ 
		    this.topRowShown++;
                    if (this.viewport.firstChild)
		      {
                        this.viewport.removeChild(this.viewport.firstChild);
                      }
		}
	    this.fillLines();
	}
};
 

View.prototype.redraw = function() 
{
    var cursorRow = this.visibleCursorRow;
	
    //clear screen
    while(this.viewport.firstChild)
	{
	    this.viewport.removeChild(this.viewport.firstChild);
	}

    //scroll if necessary
    if (cursorRow < this.topRowShown)
	{
	    this.topRowShown = cursorRow;
	} 
    else if (cursorRow >= this.topRowShown + this.rows)
	{ 
	    this.topRowShown = cursorRow - (this.rows - 1);
	}

    if (this.lines != null)
	{
	    var limitRow = this.topRowShown + this.rows;
	    if (limitRow > this.lines.length) {
		limitRow = this.lines.length;
	    }
	    for (var i = this.topRowShown; i < limitRow; i++) 
		{
		    this.viewport.appendChild(this.lines[i].element);
		}
	    this.fillLines();
	}
    else 
	{
	    this.viewport.appendChild(document.createTextNode(this.nullText));
	}
};


