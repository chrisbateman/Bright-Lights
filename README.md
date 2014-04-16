Bright Lights
=============

<img src="/screenshots/screen1.png" />

Hosted [here](http://cbateman.com/apps/brightlights/).

This is a simple particle toy, built with HTML5 Canvas. I made it a couple years ago for the iOS App Store (it's no longer available there). Good for kids, but pretty basic.

It was originally limited to the iPhone 4 and up, which generally maintained 60fps. It makes a small attempt to compensate for slower devices, but YMMV. Canvas was particularly slow on Androids when I first tested them, but maybe they've improved since then. Desktops can handle a lot more.

I wrote this code in 2012. I'd probably do a number of things differently now, but oh well. It worked.

I've made a number of updates to make the app suitable for the open web:

**Completed Updates:**
 - Switched from touch events to pointer events (hand.js as polyfill) 
 - Ported menu initialization from Objective-C
 - Adjust menu animations to adapt to screens larger than 1024px
 - Grunt, for building production app
 - Application Cache, for offline / quick startup


**Building**

 - npm install
 - grunt
 - grunt imagemin (only need to do this once, or when images are updated)

*****

<img src="/screenshots/screen2.png" />

<img src="/screenshots/screen3.png" />

<img src="/screenshots/screen4.png" />
