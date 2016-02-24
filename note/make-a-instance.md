# Make a Instance

Read [Make a Module] before reading this article.

The file `typings/tinyacc/tinyacc.d.ts` defined interface `Instance`. This document is an addition to the comments.

[Make a Module]: make-a-module.md

## UI Structure

```
+-----------------+                      \
| What is Lorem?  |                      |
| - a placehoder  |   <= View            |
|   for designers |                       >  Box
+--------+--------+                      |
| Search |  Wiki  |   <= Entry buttons   |
+--------+--------+                      /
 Lorem ipsum dolor sit amet, consectetur adipisicing 
 elit. Deleniti, quaerat aperiam. Maiores dolorum ne
 mo accusantium. Perspiciatis aut quas quidem...
```

When user make a selection, the Box will display. Its source file is `box/box.html`

A box contains two areas: view and entry buttons.

TinyAcc will allocate these for an Instance:

 - **a view**: `div.view-content`
 - **a entry button**: `div.entry-btn`

The elements have attribute `tinyacc-instance` and the value is `id` of the instance.

## EventInfo

You can add event listeners to your entry button by providing EventInfo.

For example, this is a EventInfo object:

```json
{
	"click": "window.open('http://www.laobubu.net')"
}
```

And it will become:

```javascript
entryButton.addEventListener("click", function(event){
	window.open('http://www.laobubu.net')
})
```

### Security Problem

The role that runs the handler functions is TinyAcc, therefore you have the power to use `chrome` namespace on behalf of TinyAcc.

You can be kind or evil. This ~~bug~~ feature is a great convenience, or a sharp blade.

### Pre-defined variables and methods

variables:

 - `event` the original event object.
 - `this.button` the button DOM element
 - `this.view` the view DOM element

methods:

 - part of `chrome.*` API, on behalf of TinyAcc. Read more: <https://developer.chrome.com/extensions/content_scripts>
