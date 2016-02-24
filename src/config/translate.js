'use strict'

var translateTodo = {}

function uniTranslateAll() {
	var x = document.querySelectorAll('[i18n]');
	for (var i = x.length; --i !== -1;) {
		translateTodo[i] = x[i]
		window.postMessage({
			type: "i18n?",
			key: x[i].textContent.replace(/ /g, '_'),
			target: i
		}, "*")
	}
}

window.addEventListener('message', function (event) {
	var d = event.data
	var type = d.type

	switch (type) {
		case 'i18n!':
			translateTodo[d.target].textContent = d.text
			delete translateTodo[d.target]
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

uniTranslateAll();
