
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


function CmdLineFrame(editor)
{  
    this.editor = editor;

    this.div = document.createElement("div");
    this.div.id = "cmdFrame";

    var cmdHandler = new VIcommandHandler(this.editor);
    var clmode = new CommandLineMode(cmdHandler);

    this.buffer = new Buffer();
    this.bufferEntry = null;
    this.controller = new Controller(this);
    this.controller.minorModes[0] = clmode;
    this.controller.buffer = this.buffer;

    this.view = new View(this, this.controller);
    this.view.rows = 1;
    this.view.setBuffer(this.buffer);

    var view = this.view;
    this.controller.addEventHandler('cursorMoved', function(e) { view.cursorMoved(e); });
    this.buffer.addEventHandler('lineChanged', function(e){view.lineChanged(e);});
    this.buffer.addEventHandler('lineAdded', function(e){view.lineAdded(e);});
    this.buffer.addEventHandler('lineDeleted', function(e){view.lineDeleted(e);});

    this.div.appendChild(this.view.viewport);
}



function Frame(editor)
{  
    this.editor = editor;

    this.div = document.createElement("div");
    this.div.id = "frame" + Frame.prototype.id++;

    this.controller = new Controller(this);
    this.view = new View(this, this.controller);
    this.statusbar = new StatusBar(this);
    this.buffer = null;
    this.bufferEntry = null;

    var that = this;
    this.view.viewport.onfocus = function(ev) { editor.lastFocused = that; };

    var view = this.view;
    this.controller.addEventHandler('cursorMoved', function(e) { view.cursorMoved(e); });
    
    this.div.appendChild(this.view.viewport);
    this.div.appendChild(this.statusbar.statusbar);
}


Frame.prototype.id = 0;

Frame.prototype.setBuffer = function(buf)
{
    this.bufferEntry = buf;
    this.buffer = buf.buffer;
    this.controller.buffer = this.buffer;

    var view = this.view;
    this.buffer.addEventHandler('lineChanged', function(e){view.lineChanged(e);});
    this.buffer.addEventHandler('lineAdded', function(e){view.lineAdded(e);});
    this.buffer.addEventHandler('lineDeleted', function(e){view.lineDeleted(e);});

    this.statusbar.fileChanged({filename: buf.filename});
    this.view.setBuffer(this.buffer);
};

