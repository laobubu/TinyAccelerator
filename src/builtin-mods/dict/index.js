'use strict'

function ModsDict() {

	var _profile = {}

	_profile.name = "Dict"
	_profile.author = "laobubu"
	_profile.description = "universal search provider"

	function _create_instance(req) {
		if (!/^\w+$/.test(req.text)) return null
		
		return {
			id: req.id,
			view: ("Dict query " + req.text),
			button: {
				text: "Dict",
				event: {
					click: `window.open("http://dict.cn/${encodeURIComponent(req.text)}")`
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

ModsDict()
