'use strict';
/// <reference path="libs/tinyacc/basic.js" />

var box = { html: '', style: '', size: { width: 250, height: 150 } };
var styleDefault, styleUser;

Promise.all([
	window.fetch('box/style.css').then(res => res.text()),
	config.get("user.style", "")
]).then((styles) => {
	styleDefault = styles[0];
	styleUser = styles[1];
	box.style = styleDefault + styleUser;
})

function UpdateBoxHtml(html) {
	var h =
		html.replace(/(src|href)=(["'])(.+?)\2/g, (whole, a, quote, uri) => {
			if (/^\w+\:/.test(uri)) return whole;
			return a + '=' + quote + chrome.runtime.getURL((uri[0] === "/" ? uri : "/box/" + uri)) + quote;
		})
	box.html = h;
}
window.fetch('box/box.html').then(res => res.text()).then(UpdateBoxHtml)

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	let resp = {};
	switch (msg.type || msg) {
		case "box":
			sendResponse(box)
			break
		case "loaded_mods":
			Object.keys(loaded_mods).forEach((modName) => {
				let mod = loaded_mods[modName]
				resp[modName] = {
					id: mod.id,
					profile: mod.profile
				}
			})
			sendResponse(resp)
			break
		case "conf":
			if (!msg.data) {
				//getting
				sendResponse(conf)
			} else {
				conf = msg.data
				config.set('user.conf', conf)
				AfterConfigUpdate()
				sendResponse(true)
			}
			break
	}
})

////////////////////////////////////////////////////////////////////////////

var conf = {
	mods: [
		(chrome.runtime.id + ":search")
	],
	"box.width": 250,
	"box.height": 150
}
var loaded_mods = {}  //a dict

config.onInit.addEventListener(function () {
	config.get('user.conf').then((c) => {
		c && Object.assign(conf, c) && AfterConfigUpdate()
	})
})

function AfterConfigUpdate() {
	box.size.width = conf["box.width"]
	box.size.height = conf["box.height"]
}

function handleModuleResponse(msg) {
	if (msg.type === "instance") {
		DEBUG && console.log("module response!", msg.instance.id, msg.instance)
		var infos = msg.instance.id.split("|") // 0: portID 1: reqID 2: order
		var port = port_cs[infos[0]]
		if (!port) return
		port.postMessage({
			id: infos[1],
			order: ~~infos[2],
			instance: msg.instance
		})
	}
}

function handleConnection(port) {
	if (port.name !== "module") return

	var inited = false;
	function onetimeCheck(message) {
		if (inited) return
		inited = true

		if (message.type !== 'profile') {
			port.disconnect()
			return
		}

		var profile = message.profile
		var id = port.sender.id + ":" + profile.id

		loaded_mods[id] = {
			id: id,
			port: port,
			profile: profile
		}

		port.onMessage.addListener(handleModuleResponse)
		port.onDisconnect.addListener(() => {
			delete loaded_mods[id]
		})
	}
	port.onMessage.addListener(onetimeCheck)
}

chrome.runtime.onConnect.addListener(handleConnection)
chrome.runtime.onConnectExternal.addListener(handleConnection)



function local_connect(prop) {
	var c2sListeners = []
	var s2cListeners = []

	var portForServer = {
		name: prop.name,
		sender: {
			id: chrome.runtime.id
		},
		onMessage: {
			addListener: (l) => { c2sListeners.push(l) }
		},
		onDisconnect: {
			addListener: (l) => { }
		},
		postMessage: (msg) => {
			s2cListeners.forEach(l => l(msg))
		}
	}
	handleConnection(portForServer)

	var port = {
		onMessage: {
			addListener: (l) => { s2cListeners.push(l) }
		},
		postMessage: (msg) => {
			c2sListeners.forEach(l => l(msg))
		}
	}
	return port;
}



//////////////////////////////////THIS PART IS FOR CONTENT SCRIPTS

var port_cs = {} //ports that content script created

chrome.runtime.onConnect.addListener((port) => {
	if (port.name !== "page") return
	var portID = genID()
	port_cs[portID] = port

	port.onDisconnect.addListener(() => {
		delete port_cs[portID]
	})
	port.onMessage.addListener((msg) => {
		let baseReq = JSON.stringify(msg.info)
		conf.mods.forEach((mod_id, index) => {
			let mod = loaded_mods[mod_id]
			let instanceRequest = JSON.parse(baseReq)
			instanceRequest.id = (portID + "|" + msg.id + "|" + index)
			instanceRequest.for = mod_id
			if (!mod) return

			DEBUG && console.log('dispatch', mod_id, instanceRequest);

			mod.port.postMessage({
				type: "request",
				request: instanceRequest
			})
		})
	})
})
