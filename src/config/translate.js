'use strict'

var translateTodo = []
var afterTranslate

function uniTranslateAll() {
	var x = document.querySelectorAll('[i18n]');
	var keys = {}
	for (var i = x.length; --i !== -1;) {
		let key = x[i].textContent.replace(/ /g, '_')
		keys[key] = true
		translateTodo.push({
			key: key,
			target: x[i]
		})
	}
	window.postMessage({
		type: "i18n?",
		keys: Object.keys(keys)
	}, "*")

	return new Promise((resolve) => { afterTranslate = resolve })
}

window.addEventListener('message', function (event) {
	var d = event.data
	var type = d.type

	switch (type) {
		case 'i18n!':
			translateTodo.forEach((item) => {
				item.target.textContent = d.texts[item.key]
			})
			afterTranslate()
			break
		case 'sm!':
			let func = sendMessage_resolvers[d.timestamp]
			func(d.message)
			delete sendMessage_resolvers[d.timestamp]
			break
	}
})

var sendMessage_resolvers = {}
function sendMessage(message) {
	return new Promise((resolve) => {
		let timestamp = (+new Date()).toString(36)
		sendMessage_resolvers[timestamp] = resolve
		window.postMessage({
			type: "sm?",
			timestamp: timestamp,
			message: message
		}, '*')
	})
}

uniTranslateAll().then(() => {
	var script = document.createElement('script')
	script.src = "config.js"
	document.body.appendChild(script)
})
