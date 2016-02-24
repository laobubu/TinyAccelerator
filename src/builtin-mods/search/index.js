'use strict'

function ModsSearch() {

	var _profile = {}

	_profile.id = "search"
	_profile.name = chrome.i18n.getMessage("Search")
	_profile.author = "laobubu"
	_profile.description = chrome.i18n.getMessage("SEARCH_DESCRIPT")

	function _create_instance(req) {
		return {
			id: req.id,
			// view: ("your selection is " + req.text),
			button: {
				text: chrome.i18n.getMessage("Search"),
				event: {
					click: `window.open("https://www.google.com/search?q=${encodeURIComponent(req.text)}")`
				}
			}
		}
	}

	var port = local_connect({ name: "module" })//chrome.runtime.connect()
	port.postMessage({
		type: "profile",
		profile: _profile
	})
	port.onMessage.addListener(function (msg) {
		if (msg.type === "request") {
			var request = msg.request // a InstanceRequest object
			var instance = _create_instance(request) // a Instance object
			if (instance !== null) {
				port.postMessage({
					type: "instance",
					instance: instance
				})
			}
		}
		else if (msg.type === "profile") {
			port.postMessage({
				type: "profile",
				profile: _profile
			})
		}
	})

}

ModsSearch()
