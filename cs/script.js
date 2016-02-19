'use strict';

(() => {
	var container = document.createElement('div');
	var root = container.createShadowRoot();

	chrome.runtime.sendMessage("box", (box) => {		
		var style = document.createElement('style');
		style.textContent = box.style;
		root.appendChild(style);
		
		container.innerHTML = box.html;
		while (container.firstChild) {
			root.appendChild(container.firstChild)
		}
		
		document.body.appendChild(container);
	})
})();
