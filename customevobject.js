
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



function CustomEvObject()
{ 
}

CustomEvObject.prototype = {
    evid: 0,
    customEvents: null
};


/**
 * This function modifies itself at first run to fit browser.
 */
CustomEvObject.prototype.regEvent = function(obj, evtName, callback)
{
    if (window.addEventListener)
	{
	    CustomEvObject.prototype.regEvent = function(obj, evtName, callback) {
		if (!obj)
		    {
			alert(evtName + " " + callback);
		    }
		obj.addEventListener(evtName, callback, false);
	    };
	}
    else
	{
	    CustomEvObject.prototype.regEvent = function(obj, evtName, callback) {
		obj.attachEvent("on" + evtName, callback);
	    };
	}
    return this.regEvent(obj, evtName, callback);
};


CustomEvObject.prototype.addEventHandler = function(evtName, callback)
{
    if (!this.customEvents[evtName])
	{
	    alert("Unrecognized custom event: " + evtName);
	    return;
	}
    this.regEvent(this.customEvents[evtName], 'click', callback);
};


CustomEvObject.prototype.addCustomEvent = function(name)
{
    //this has to be done here or all children inherit the same
    //object and overwrite each other's events.
    if (this.customEvents == null)
    {
	this.customEvents = new Object;
    }
    var evElement = document.createElement("A");
    //This next line has to be done for IE or the event can't fire.
    document.getElementsByTagName('body')[0].appendChild(evElement);
    evElement.id = "evt_" + CustomEvObject.prototype.evid++ + "_" + name;
    this.customEvents[name] = evElement;
};


CustomEvObject.prototype.fireCustomEvent = function(name, data)
{
  if (document.createEvent) // Firefox et. al.
      {    
	  var mEvt = document.createEvent("MouseEvent");
	  mEvt.initEvent("click", true, true);
	  for (var i in data)
	      {
		  mEvt[i] = data[i];
	      }
	  this.customEvents[name].dispatchEvent (mEvt);
      } 
  else if (document.createEventObject) //Internet Explorer
      {
	  var mEvt = document.createEventObject(window.event);
	  for (var i in data)
	      {
		  mEvt[i] = data[i];
	      }
	  this.customEvents[name].fireEvent("onclick", mEvt);
      }
};


