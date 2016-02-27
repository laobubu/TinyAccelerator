'use strict';

var config = (() => {
	var initListeners = []
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
		}),
		onInit: {
			addEventListener: (l) => {
				if (sys.inited) l()
				else initListeners.push(l)
			}
		},
		inited: false
	};

	chrome.storage.local.get('sys.local', (items) => {
		if (!items['sys.local']) {
			sys.impl = chrome.storage.sync;
		}
		sys.inited = true
		initListeners.forEach(l=> l())
	});

	return sys;
})()

function genID() {
	return (+ new Date()).toString(36) + (Math.random())
}
