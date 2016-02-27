'use strict'

var translateTodo = []
var afterTranslate

function uniTranslateAll(directMode) {
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

	if (directMode) {
		translateTodo.forEach(function (item) {
			let html = chrome.i18n.getMessage(item.key)
			if (!html) return
			let i18n = item.target.getAttribute('i18n')
			if (i18n === "marked") html = marked(html)
			item.target.innerHTML = html
		}, this)
		return
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
				let html = d.texts[item.key]
				let i18n = item.target.getAttribute('i18n')
				if (i18n === "marked") html = marked(html)
				item.target.innerHTML = html
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

if (document.body.hasAttribute("i18n")) {
	document.title = chrome.i18n.getMessage(document.title) || document.title
	document.body.removeAttribute("i18n")
	uniTranslateAll(true)
}
