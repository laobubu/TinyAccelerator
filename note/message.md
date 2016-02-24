# Internal messages

These messages are not public

## Simple messages

Simple message. Send and recv with `chrome.runtime.sendMessage()` API

### box

retrive the html and css data of the box.

recv `{ html: string, style: string }`

## Long-term messages

These require a Long-term Port

### "page" Port

**Direction**: ContentScript => Background

```javascript
//ContentScript send
REQUEST_ID = genID()
{
	id: REQUEST_ID,
	info: {
		text: text,
		html: html,
		url: window.location.href
	}
}

//Background send, might more than one
{
	id: REQUEST_ID,
	order: 0,  //smallest is the first
	instance: Instance //from Module
}
```
