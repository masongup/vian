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



function VIcommandHandler(editor)
{
    this.editor = editor;
}

VIcommandHandler.prototype.funcs = 
    [
     {rx: /^(:e) (.*)$/, 
      fn: function(that, args) 
      { 
	  that.editor.openOrCreateFile(args);
      }
     },
     
     {rx: /^(:w) *$/, 
      fn: function(that, args) 
      {
	  that.editor.saveFile();
      }
     },
    
     {rx: /^(:w)[ ]+(.+)$/, 
      fn: function(that, args) 
      {
	  that.editor.saveFile(args);
      }
     },
    
     {rx: /^(:evalb)[ ]*$/, 
      fn: function(that, args) 
      { 
	  that.editor.lastFocused.controller.evalBuffer();
      }
     },
    
     {rx: /^(:splith)[ ]*$/, 
      fn: function(that, args) 
      { 
	  that.editor.splitFrameHorizontal();
      }
     },
    
     {rx: /^(:q)[ ]*$/, 
      fn: function(that, args) 
      { 
	  that.editor.quit();
      }
     }
     ];


VIcommandHandler.prototype.execute = function(cmd)
{
    for (var i = 0; i < this.funcs.length; i++)
	{
	    var m = this.funcs[i].rx.exec(cmd);
	    if (m)
		{
		    this.funcs[i].fn(this, m[2]);
                    this.editor.lastFocused.view.viewport.focus();
		    return true;
		}
	}
};
