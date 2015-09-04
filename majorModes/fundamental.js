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



function FundamentalMode()
{
    this.keywords = new Object;
}

FundamentalMode.prototype = {
    keywords: null
};


FundamentalMode.prototype.whitespace = /[ \t]/;
FundamentalMode.prototype.word = /[A-Za-z0-9]/;
FundamentalMode.prototype.startDelimiter = /\(|\[|\{/;
FundamentalMode.prototype.endDelimiter = /\)|\]|\}/;
FundamentalMode.prototype.slComment = /\/\//;
FundamentalMode.prototype.stringStart = /\"/;
FundamentalMode.prototype.stringEnd = /\"/;
FundamentalMode.prototype.stringEscape = /\\/;
FundamentalMode.prototype.mlCommentStart = /\/\*/;
FundamentalMode.prototype.mlCommentEnd = /\*\//;

FundamentalMode.prototype.slCommentColor = '#ff7744';
FundamentalMode.prototype.stringColor = '#88ff44';
FundamentalMode.prototype.mlCommentColor = '#ff77aa';


FundamentalMode.prototype.keyPressed = function(controller, key)
{
    return false;
};


FundamentalMode.prototype.indentLine = function(controller, line, buffer)
{
  var text = buffer.getLine(line) || "";
  var prevLine = buffer.getLine(line - 1);
  var matches = prevLine.match(/^[ \t]+/);
  if (matches)
    {
       var indent = matches[0];
       return text.replace(/^[ \t]*/, indent);
    }
  else
    {
       return text.replace(/^[ \t]*/, "");
    }
};




