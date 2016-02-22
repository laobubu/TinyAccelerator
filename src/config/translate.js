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
	}
})

uniTranslateAll();
