/**
* @author Erik Möller
* @see http://paulirish.com/2011/requestanimationframe-for-smart-animating/
*/
(function() {
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
	}
	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	}
	if (!window.cancelAnimationFrame) {
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
	}
}());





/**
* Permission is hereby granted, free of charge, to any person obtaining
* a copy of this software and associated documentation files (the
* "Software"), to deal in the Software without restriction, including
* without limitation the rights to use, copy, modify, merge, publish,
* distribute, sublicense, and/or sell copies of the Software, and to
* permit persons to whom the Software is furnished to do so, subject
* to the following conditions:
*
* The below copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
* MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
* BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
* ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
* CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*
* @licence MIT License (http://www.opensource.org/licenses/mit-license.php)
* @copyright (c) 2011 Assanka Limited
* @author Rowan Beentje <rowan@assanka.net>, Matt Caruana Galizia <matt@assanka.net>
*/
var FastClick=function(){var touchSupport="ontouchstart"in window;return function(layer){if(!(layer instanceof HTMLElement))throw new TypeError("Layer must be instance of HTMLElement");if(touchSupport){layer.addEventListener("touchstart",onTouchStart,true);layer.addEventListener("touchmove",onTouchMove,true);layer.addEventListener("touchend",onTouchEnd,true);layer.addEventListener("touchcancel",onTouchCancel,true)}layer.addEventListener("click",onClick,true);if(layer.onclick instanceof Function){layer.addEventListener("click",
layer.onclick,false);layer.onclick=""}var clickStart={x:0,y:0,scroll:0},trackingClick=false;function onTouchStart(event){trackingClick=true;clickStart.x=event.targetTouches[0].clientX;clickStart.y=event.targetTouches[0].clientY;clickStart.scroll=window.pageYOffset;return true}function onTouchMove(event){if(trackingClick)if(Math.abs(event.targetTouches[0].clientX-clickStart.x)>10||Math.abs(event.targetTouches[0].clientY-clickStart.y)>10)trackingClick=false;return true}function onTouchEnd(event){var targetElement,
clickEvent;if(!trackingClick||Math.abs(window.pageYOffset-clickStart.scroll)>5)return true;targetElement=document.elementFromPoint(clickStart.x,clickStart.y);if(targetElement.nodeType===Node.TEXT_NODE)targetElement=targetElement.parentNode;if(!(targetElement.className.indexOf("clickevent")!==-1&&targetElement.className.indexOf("touchandclickevent")===-1)){clickEvent=document.createEvent("MouseEvents");clickEvent.initMouseEvent("click",true,true,window,1,0,0,clickStart.x,clickStart.y,false,false,false,
false,0,null);clickEvent.forwardedTouchEvent=true;targetElement.dispatchEvent(clickEvent)}if(!(targetElement instanceof HTMLSelectElement)&&targetElement.className.indexOf("clickevent")===-1)event.preventDefault();else return false}function onTouchCancel(event){trackingClick=false}function onClick(event){if(!window.event)return true;var allowClick=true;var targetElement;var forwardedTouchEvent=window.event.forwardedTouchEvent;if(touchSupport){targetElement=document.elementFromPoint(clickStart.x,clickStart.y);
if(!targetElement||!forwardedTouchEvent&&targetElement.className.indexOf("clickevent")==-1)allowClick=false}if(allowClick)return true;event.stopPropagation();event.preventDefault();event.stopImmediatePropagation();return false}}}();