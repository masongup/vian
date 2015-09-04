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
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */


function SyntaxHighlighter()
{
}


SyntaxHighlighter.prototype.getSyntaxHints = function(mode, text, pState)
{
    var hints = new Array;
    var state = null;
    if(pState)
	{
	    var hint = null;
	    if (pState == 'c') //multi-line comment
		{
		    hint = this.parseMultiLineComment(mode, text);
		}
	    else if (pState == 's') //multi-line string
		{
		    hint = this.parseString(mode, text);
		}
	    state = hint.state;
	    hints.push(hint);
	    text = text.substr(hint.length);
	}

    var i = 0;
    while (text.length > 0)
	{
	    var hint = this.parse(mode, text);
	    hint.start = i;
	    i += hint.length;
	    
	    if (hint.type == 'w')
		{
		    var posskw = text.substr(0, hint.length);
		    hint.color = mode.keywords[posskw];
		}
	    
	    state = hint.state;
	    text = text.substr(hint.length);
	    hints.push(hint);
	}

    return {hints: hints, state: state};
};


SyntaxHighlighter.prototype.parse = function(mode, text)
{
    if (text.substr(0,1).match(mode.whitespace))
	{
	    var i = 0;
	    while (text.substr(i,1) && text.substr(i,1).match(mode.whitespace))
		i++;
	    return {type: '-', length: i};
	}
    else if (text.substr(0,1).match(mode.word))
	{
	    var i = 0;
	    while (text.substr(i,1) && text.substr(i,1).match(mode.word)) 
		i++;
	    return {type: 'w', length: i};
	    
	}
    else if (text.search(mode.slComment) == 0)
	{
	    return {type: 'sc', length: text.length, color: mode.slCommentColor};
	}
    else if (text.search(mode.mlCommentStart) == 0)
	{
	    var opener = text.match(mode.mlCommentStart)[0].length;
	    var hint = this.parseMultiLineComment(mode, text.substr(opener));
	    hint.length += opener;
	    return hint;
	}
    else if (text.search(mode.stringStart) == 0)
	{
	    var opener = text.match(mode.stringStart)[0].length;
	    var hint = this.parseString(mode, text.substr(opener));
	    hint.length += opener;
	    return hint;
	}
    //unknown syntax type
    return {type: 'x', length: 1}; 
};


SyntaxHighlighter.prototype.parseString = function(mode, text)
{
    var hint = null;
    var index = 0;
    while (text.length > 0)
	{
	    if (text.search(mode.stringEnd) == 0)
		{
		    var closer = text.match(mode.stringEnd)[0].length;
		    return {length: index + closer, 
			    color: mode.stringColor};
		}
	    else if (text.search(mode.stringEscape) == 0)
		{
		    var escape = text.match(mode.stringEscape)[0].length;
		    index += escape;
		    text = text.substr(escape);
		}
	    index++;
	    text = text.substr(1);
	}
    //didn't find string end delimiter
    return {length: index, state: 's', 
	    color: mode.stringColor};
};


SyntaxHighlighter.prototype.parseMultiLineComment = function(mode, text)
{
    var index = text.search(mode.mlCommentEnd);
    if (index >= 0)
	{
	    var closer = text.match(mode.mlCommentEnd)[0].length;
	    return {length: index + closer, 
		    color: mode.mlCommentColor};
	}
    return {length: text.length, 
	    color: mode.mlCommentColor,
	    state: 'c'};
};


