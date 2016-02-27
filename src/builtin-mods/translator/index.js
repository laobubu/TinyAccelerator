'use strict'

/// <reference path="../../libs/tinyacc/basic.js" />

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

	var google = (str) => new Promise((res) => {
		fetch('https://translate.google.com/m?hl=zh-CN&sl=auto&tl=' + chrome.i18n.getUILanguage() + '&ie=UTF-8&prev=_m&q=' + encodeURIComponent(str))
			.then(r=> r.text())
			.then(rt=> {
				const key1 = '<div dir="ltr" class="t0">'
				const key2 = '</div>'
				var t = rt.substr(rt.indexOf(key1) + key1.length)
				t = t.substr(0, t.indexOf(key2))

				res([t])
			})
	})

	var youdao = (str) => new Promise((res) => {
		fetch('http://fanyi.youdao.com/openapi.do?keyfrom=laobubu&key=51276672&type=data&doctype=json&version=1.1&q=' + encodeURIComponent(str))
			.then(res => res.json())
			.then(json => {
				res(json.basic.explains)
			})
	})

	function _create_instance(req) {
		return new Promise((resolve) => {
			if (!/\w+/.test(req.text)) {
				return
			}

			google(req.text)
				.then(results => {
					var view = ''
					view += '<ul>'
					results.forEach((explain) => {
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

	var defaultConf = {
		api: "youdao",
		when: "0",
		target: ""
	}
	var conf = defaultConf;
	function reloadConfig() {
		config.get("user.translator").then((cc) => {
			conf = cc || {}
			conf.__proto__ = defaultConf
		})
	}

	chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
		if (sender.url !== _profile.options) return
		switch (msg.type || msg) {
			case "ConfigUpdated":
				reloadConfig()
				break
		}
	})
	config.onInit.addEventListener(reloadConfig)

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
