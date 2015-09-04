
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


function CommandMode () 
{
    var that = this;
    this.displayName = "Cmd";
    
    this.times = null;
    this.keyString = '';
    this.captureFunction = null;

    this.keymap = new Object();

    this.keymap['<bksp>'] = function(ct) { ct.moveCursorHorizontal(-1); };
    this.keymap['<ret>'] = function(ct) { ct.moveCursorHome(); ct.moveCursorVertical(1); };
    this.keymap['<esc>'] = function(ct) { that.times = null; ct.resetUndo(); };
    this.keymap['<end>'] = this.keymap['$'] = function(ct) { ct.moveCursorEnd(); };
    this.keymap['<home>'] = this.keymap['^'] = function(ct) { ct.moveCursorHome(); };
    this.keymap['<left>'] = this.keymap['h'] = function(ct) { ct.moveCursorHorizontal(-1 * that.getTimes()); };
    this.keymap['<up>'] = this.keymap['k'] = function(ct) { ct.moveCursorVertical(-1 * that.getTimes()); };
    this.keymap['<right>'] = this.keymap['l'] = function(ct) { ct.moveCursorHorizontal(that.getTimes()); };
    this.keymap['<down>'] = this.keymap['j'] = function(ct) { ct.moveCursorVertical(that.getTimes()); };
    this.keymap['<del>'] = this.keymap['x'] = function(ct) { ct.deleteForward(that.getTimes()); };
    this.keymap['<tab>'] = function(ct) { ct.indentLine(); };
    this.keymap['<insert>'] = null;
    this.keymap[':'] = function(ct) { ct.modifiers = 0; that.startCommand(ct.frame.editor, ':'); };

    this.keymap['w'] = function(ct) { ct.moveCursorWordFwd(); };
    this.keymap['b'] = function(ct) { ct.moveCursorWordBwd(); };
    this.keymap['e'] = function(ct) { ct.moveCursorWordEnd(); };

    this.keymap['u'] = function(ct) { ct.undo(that.getTimes()); };

    this.keymap['i'] = function(ct) { that.times = null; ct.changeMinorMode(0, ct.defaultInsertMode); };
    this.keymap['I'] = function(ct) { that.times = null; ct.moveCursorHome(); ct.changeMinorMode(0, ct.defaultInsertMode); };

    this.keymap['a'] = function(ct) { that.times = null; ct.moveCursorHorizontal(1); ct.changeMinorMode(0, ct.defaultInsertMode); };
    this.keymap['A'] = function(ct) { that.times = null; ct.moveCursorEnd(); ct.changeMinorMode(0, ct.defaultInsertMode); };

    this.keymap['o'] = function(ct) { ct.moveCursorEnd(); ct.newLine(); ct.changeMinorMode(0, ct.defaultInsertMode); };
    this.keymap['O'] = function(ct) { ct.insertLineBefore(); };

    this.keymap['R'] = function(ct) { that.times = null; ct.minorModes[0] = ct.defaultReplaceMode; };
    this.keymap['r'] = function(ct) { that.captureFunction = function(ct, key) {that.replace(ct, key);} };

    this.keymap['D'] = function(ct) { ct.deleteToEndOfLine(); };
    this.keymap['d'] = function(ct) { that.keyString = 'd'; };
    this.keymap['dd'] = function(ct) { that.dd(ct); };
    this.keymap['dl'] = function(ct) { ct.deleteForward(that.getTimes()); };
    this.keymap['dh'] = function(ct) { ct.backspace(that.getTimes()); };
    this.keymap['dw'] = function(ct) { ct.deleteWord(that.getTimes()); };
    this.keymap['db'] = function(ct) { ct.deleteWordBwd(that.getTimes()); };

    this.keymap['C'] = function(ct) { ct.changeToEndOfLine(); };
    this.keymap['c'] = function(ct) { that.keyString = 'c'; };
    this.keymap['cc'] = function(ct) { that.cc(ct); };
    this.keymap['cl'] = function(ct) { ct.changeForward(that.getTimes()); };
    this.keymap['ch'] = function(ct) { ct.changeBackward(that.getTimes()); };
    this.keymap['cw'] = function(ct) { ct.changeWord(that.getTimes()); };
    this.keymap['cb'] = function(ct) { ct.changeWordBwd(that.getTimes()); };

    this.keymap['y'] = function(ct) { that.keyString = 'y'; };
    this.keymap['yy'] = function(ct) { that.yy(ct); };

    this.keymap['p'] = function(ct) { ct.putLines(false); };
    this.keymap['P'] = function(ct) { ct.putLines(true); };

    this.keymap['J'] = function(ct) { ct.joinLines(); };
}


CommandMode.prototype.getTimes = function()
{
    if (this.times)
	{
	    var x = this.times;
	    this.times = null;
	    if (x > 100000)
		x = 100000;
	    return x;
	}
    return 1;
};


CommandMode.prototype.keyPressed = function(controller, key)
{
    if (this.captureFunction)
      {
	  var that = this;
	  var times = this.getTimes();
	  var func = this.captureFunction;
	  this.lastFunc = function()
	  {
	      that.times = times;
	      func(controller, key);
	  };
	  return this.lastFunc();
      }

    if (key.match(/^[0-9]$/))
	{
	    if (this.times == null)
		this.times = parseInt(key);
	    else 
		this.times = this.times * 10 + parseInt(key);
	    return true;
	}
    
    this.keyString += key;
    if (this.keyString == '.')
	{
	    this.lastFunc();
	    this.keyString = '';
	    this.times = null;
	    return true;
	}

    var func = this.keymap[this.keyString];
    if (func)
	{
	    this.keyString = '';
	    var times = this.getTimes();
	    var that = this;
	    this.lastFunc = function()
		{
		    that.times = times;
		    func(controller);
		}
	    this.lastFunc();
	    return true;
	}
    this.keyString = '';
    this.times = null;
    return false;
};


CommandMode.prototype.dd = function(ct)
{
    var times = this.getTimes();
    this.times = null;
    ct.deleteLines(times);
};


CommandMode.prototype.cc = function(ct)
{
    var times = this.getTimes();
    this.times = null;
    ct.deleteLines(times);
    ct.changeMinorMode(0, ct.defaultInsertMode);
};


CommandMode.prototype.yy = function(ct)
{
    var times = this.getTimes();
    this.times = null;
    ct.yankLines(times);
};


CommandMode.prototype.startCommand = function(editor, cmd)
{
  if (editor && editor.cmdframe)
    {
       var controller = editor.cmdframe.controller;
       var viewport = editor.cmdframe.view.viewport;
       controller.f_changeLine(0, cmd);
       controller.moveCursorHorizontal(1);
       viewport.focus();
    }
};


CommandMode.prototype.replace = function(ct, key)
{
    var times = this.getTimes();
    this.times = null;
    this.captureFunction = null;

    if (key.length == 1)
      {
        for (var i = 0; i < times; i++)
          {
            ct.replaceTextAtCursor(key);
          }
        ct.commitTransaction();
        return true;
      }
    else if (key == '<ret>')
      {
        ct.deleteForward(1);
	ct.newLine();
      }

    this.keyString = '';
    return false;
};
