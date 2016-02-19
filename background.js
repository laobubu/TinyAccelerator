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
		html.replace(/<!--discard-->.+/g, '') //just for debug...
			.replace(/(src|href)=(["'])(.+?)\2/g, (whole, a, quote, uri) => {
				if (/^\w+\:/.test(uri)) return whole;
				return a + '=' + quote + chrome.runtime.getURL((uri[0] === "/" ? uri : "/box/" + uri)) + quote;
			})
	box.html = h;
}
window.fetch('box/box.html').then(res => res.text()).then(UpdateBoxHtml)

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	if (msg === "box") {

		window.fetch('box/box.html').then(res => res.text()).then(UpdateBoxHtml)

		sendResponse(box);

	}
})
