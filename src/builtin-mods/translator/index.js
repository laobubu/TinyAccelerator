'use strict'

function ModsTranslator() {

	var _profile = {}
	
	var btn = chrome.i18n.getMessage("Translate")

	_profile.id = "dict"
	_profile.name = chrome.i18n.getMessage("Translator")
	_profile.author = "laobubu"
	_profile.description = chrome.i18n.getMessage("TRANSLATOR_DESCRIPT")
	_profile.fullDescription = chrome.i18n.getMessage("TRANSLATOR_DESCRIPT_FULL")
	_profile.url = "http://laobubu.net"
	_profile.options = `chrome-extension://${chrome.runtime.id}/builtin-mods/translator/config.html`

	function _create_instance(req) {
		return new Promise((resolve) => {
			if (!/^\w+$/.test(req.text)) {
				return
			}

			fetch('http://fanyi.youdao.com/openapi.do?keyfrom=laobubu&key=51276672&type=data&doctype=json&version=1.1&q=' + encodeURIComponent(req.text))
				.then(res => res.json())
				.then(json => {
					if (json.errorCode !== 0) return
					
					var view = `<h1>${req.text}</h1>`
					view += '<ul>'
					json.basic.explains.forEach((explain) => {
						view += '<li>' + explain + '</li>'
					})
					view += '</ul>'

					var rtn = {
						id: req.id,
						view: view,
						button: {
							text: btn,
							event: {
								click: `window.open("http://dict.cn/${encodeURIComponent(req.text) }")`
							}
						}
					}

					resolve(rtn)
				})
		})
	}

	var port = local_connect({ name: "module" })//chrome.runtime.connect()
	port.postMessage({
		type: "profile",
		profile: _profile
	})
	port.onMessage.addListener(function (msg) {
		if (msg.type === "request") {
			var request = msg.request // a InstanceRequest object
			_create_instance(request).then(instance => {
				port.postMessage({
					type: "instance",
					instance: instance
				})
			})
		}
		else if (msg.type === "profile") {
			port.postMessage({
				type: "profile",
				profile: _profile
			})
		}
	})

}

ModsTranslator()
