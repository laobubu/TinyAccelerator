'use strict'

var webView = document.getElementById('webView1');
var webViewWin;

window.addEventListener('message', function(event) {
	var d = event.data
	var type = d.type
	
	webViewWin = webViewWin || event.source
	
	switch (type) {
		case 'i18n?':
			let texts = {}
			d.keys.forEach((key) => { texts[key] = chrome.i18n.getMessage(key) || key })
			webViewWin.postMessage({
				type: 'i18n!',
				texts: texts
			}, '*')

			break
		case 'sm?':
			/** a message proxy. require `message` and `timestamp` */
			chrome.runtime.sendMessage(d.message, (resp) => {
				webViewWin.postMessage({
					type: 'sm!',
					timestamp: d.timestamp,
					message: resp
				}, '*')
			})
			break
		case 'open?':
			chrome.tabs.create({ url: d.url })
			break
	}
})

document.title = chrome.i18n.getMessage(document.title)
