'use strict'

var translateTodo = []
var afterTranslate

function uniTranslateAll() {
	var x = [].slice.call(document.querySelectorAll('[i18n]'));
	x.forEach.call(document.querySelectorAll('template'), (template) => {
		var xt = template.content.querySelectorAll('[i18n]');
		x.push.apply(x, xt)
	})
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
				item.target.innerHTML = d.texts[item.key]
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
		let timestamp = (+new Date()).toString(36) + Math.random()
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
