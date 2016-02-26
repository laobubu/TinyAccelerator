'use strict'

var webView1 = document.getElementById('webView1')
// webView1.contentWindow.postMessage
webView1.contentWindow.addEventListener('message', function (event) {
    var d = event.data
	var type = d.type
    switch (type) {
		case 'i18n?':
			let texts = {}
			d.keys.forEach((key) => { texts[key] = chrome.i18n.getMessage(key) || key })
			event.source.postMessage({
				type: 'i18n!',
				texts: texts
			}, '*')
			
			break
		case 'sm?':
			/** a message proxy. require `message` and `timestamp` */
			chrome.runtime.sendMessage(d.message, (resp) => {
				event.source.postMessage({
					type: 'sm!',
					timestamp: d.timestamp,
					message: resp
				}, '*')
			})
			break
		case 'open?':
			window.open(d.url)
			break
    }
})

document.title = chrome.i18n.getMessage(document.title)
