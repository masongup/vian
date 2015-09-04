
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


function CommandLineMode (handler) 
{
    this.handler = handler;

    this.history = new Array;
    this.historyPtr = null;

    this.keymap = new Object;
    this.keymap['<tab>'] = function(ct) 
	{
	};

    var that = this;
    this.keymap['<bksp>'] = function(ct) { ct.backspace(1); };
    this.keymap['<ret>'] = function(ct) { that.execute(ct); };
    this.keymap['<esc>'] = function(ct) { alert("esc"); };
    this.keymap['<end>'] = function(ct) { ct.moveCursorEnd(); };
    this.keymap['<home>'] = function(ct) { ct.moveCursorHome(); };
    this.keymap['<left>'] = function(ct) { ct.moveCursorHorizontal(-1); };
    this.keymap['<up>'] = function(ct) { that.historyScroll(ct, -1); };
    this.keymap['<right>'] = function(ct) { ct.moveCursorHorizontal(1); };
    this.keymap['<down>'] = function(ct) { that.historyScroll(ct, 1)};
    this.keymap['<del>'] = function(ct) { ct.deleteForward(1); };
    this.keymap['<insert>'] = null;
}


CommandLineMode.prototype.execute = function(cmdctl)
{
    var cmd = cmdctl.buffer.getLine(0);

    this.historyPtr = this.history.length;
    if (this.handler.execute(cmd))
	{
	    this.history.push(cmd);
	    cmdctl.f_changeLine(0, "");
	}
};


CommandLineMode.prototype.historyScroll = function(cmdctl, y)
{
    if (this.historyPtr == null)
	{
	    this.historyPtr = this.history.length;
	}
    else
	{
	    this.historyPtr += y;
	    if (this.historyPtr < 0)
		this.historyPtr = 0;
	    if (this.historyPtr > this.history.length)
		this.historyPtr = this.history.length;
	}

    var line = "";
    if (this.historyPtr < this.history.length)
	{
	    line = this.history[this.historyPtr];
	}
    
    cmdctl.f_changeLine(0, line);
};


CommandLineMode.prototype.keyPressed = function(cmdctl, key)
{
    var func = this.keymap[key];
    if (func)
	{
	    func(cmdctl);
	    return true;
	}
    else if (key.length == 1)
	{
	    cmdctl.insertTextAtCursor(key);
	    return true;
	}
    return false;
};


