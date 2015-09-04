
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




function StatusBar(frame)
{
    var that = this;
    this.frame = frame;
    this.frame.controller.addEventHandler('cursorMoved', function(e) { that.cursorMoved(e); });
    this.frame.controller.addEventHandler('minorModesChanged', function(e) { that.minorModesChanged(e); });

    this.statusbar = document.createElement("pre");
    this.statusbar.style.borderTop = "1px solid #eeeeee";
    this.statusbar.style.borderBottom = "1px solid #aaaaaa";
    this.statusbar.style.margin = "0px 0px 0px 0px";
    this.statusbar.style.color = "black";
    this.statusbar.style.fontSize = "13px";
    this.statusbar.style.backgroundColor = "#cccccc"; 
    this.statusbar.style.overflow = "hidden"; 

    //children are mode, file, cursor  
    this.statusbar.appendChild(document.createTextNode(" Untitled "));
    this.statusbar.appendChild(document.createTextNode(" Cmd "));
    this.statusbar.appendChild(document.createTextNode(" 0,0 "));

    this.cursorMoved({row: 0, col: 0});
    this.minorModesChanged({modes: "Cmd"});
    this.fileChanged({filename: "Untitled"});
}


StatusBar.prototype.cursorMoved = function(ev)
{
  var text = ev.row +",";
  while (text.length < 6)
    text = ' ' + text;
  
  text += ev.col;
  while (text.length < 11)
    text += ' ';
  
  this.statusbar.replaceChild(document.createTextNode(text), this.statusbar.childNodes[2]);
};


StatusBar.prototype.minorModesChanged = function(ev)
{
  var text = " " + ev.modes;
  while (text.length < 30)
    text += ' ';
  
  this.statusbar.replaceChild(document.createTextNode(text), this.statusbar.childNodes[1]);
};


StatusBar.prototype.fileChanged = function(ev)
{
  var text = " " + ev.filename;
  while (text.length < 30)
    text += ' ';
  
  this.statusbar.replaceChild(document.createTextNode(text), this.statusbar.childNodes[0]);
};





