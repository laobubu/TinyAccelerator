'use strict';

var config = (() => {
	var sys = {
		impl: chrome.storage.local,
		get: (name, defaultVal) => new Promise((res) => {
			sys.impl.get(name, (confs) => {
				if (typeof name === "string") res((name in confs) ? confs[name] : defaultVal);
				else res(confs);
			});
		}),
		set: (n, v) => new Promise((res) => {
			var setObj = {};
			if (typeof n === "string") setObj[n] = v;
			else setObj = n;
			sys.impl.set(setObj, res);
		})
	};

	chrome.storage.local.get('sys.local', (items) => {
		if (!items['sys.local']) {
			sys.impl = chrome.storage.sync;
		}
	});

	return sys;
})()

function genID() {
	return (+ new Date()).toString(36) + (Math.random())
}

/////////////////////////////////////////////////////////////////////////////////////

var box = { html: '', style: '' };
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
	switch (msg) {
		case "box":
			sendResponse(box);
			break;
	}
})

////////////////////////////////////////////////////////////////////////////

var enabled_mods = [] //a list of mod ID
var loaded_mods = {}  //a dict

function handleModuleResponse(msg) {
	if (msg.type === "instance") {
		console.log("module response!", msg)
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
		var id = port.sender.id + profile.name

		loaded_mods[id] = {
			id: id,
			port: port,
			profile: profile
		}

		enabled_mods.push(id) //debug
		
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
		enabled_mods.forEach((mod_id, index) => {
			var mod = loaded_mods[mod_id]
			var instanceRequest = Object.assign(msg.info, {
				id: (portID + "|" + msg.id + "|" + index)
			})
			if (!mod) return

			mod.port.postMessage({
				type: "request",
				request: instanceRequest
			})
		})
	})
})
