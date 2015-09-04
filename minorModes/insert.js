
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


function InsertMode () 
{
    this.displayName = "Ins";

    this.keymap = new Object();
    this.keymap['<tab>'] = function(ct) { ct.indentLine(); };
    this.keymap['<bksp>'] = function(ct) { ct.backspace(1); };
    this.keymap['<ret>'] = function(ct) { ct.newLine(); ct.commitTransaction(); };
    this.keymap['<esc>'] = function(ct) { ct.changeMinorMode(0, ct.defaultCommandMode); ct.commitTransaction(); };
    this.keymap['<end>'] = function(ct) { ct.moveCursorEnd(); };
    this.keymap['<home>'] = function(ct) { ct.moveCursorHome(); };
    this.keymap['<left>'] = function(ct) { ct.moveCursorHorizontal(-1); };
    this.keymap['<up>'] = function(ct) { ct.moveCursorVertical(-1); };
    this.keymap['<right>'] = function(ct) { ct.moveCursorHorizontal(1); };
    this.keymap['<down>'] = function(ct) { ct.moveCursorVertical(1); };
    this.keymap['<del>'] = function(ct) { ct.deleteForward(1); };
    this.keymap['<insert>'] = function(ct) { ct.changeMinorMode(0, ct.defaultReplaceMode); };
}

InsertMode.prototype.keymap = null;

InsertMode.prototype.keyPressed = function(controller, key)
{
    var func = this.keymap[key];
    if (func)
	{
	    func(controller);
	    return true;
	}
    else if (key.length == 1)
	{
	    controller.insertTextAtCursor(key);
	    return true;
	}
    return false;
};


