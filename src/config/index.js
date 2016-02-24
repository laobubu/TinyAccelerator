var webView1 = document.getElementById('webView1')
// webView1.contentWindow.postMessage
webView1.contentWindow.addEventListener('message', function (event) {
    var d = event.data
	var type = d.type
    switch (type) {
		case 'i18n?':
			event.source.postMessage({
				type: 'i18n!',
				text: chrome.i18n.getMessage(d.key) || d.key,
				target: d.target
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
    }
})

document.title = chrome.i18n.getMessage(document.title)
