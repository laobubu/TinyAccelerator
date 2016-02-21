'use strict';

(() => {
	var container = document.createElement('div');
	var box = container;
	var root = container.createShadowRoot();

	chrome.runtime.sendMessage("box", (box_info) => {
		var style = document.createElement('style');
		style.textContent = box_info.style;
		root.appendChild(style);

		container.innerHTML = box_info.html;
		while (container.firstChild) {
			root.appendChild(container.firstChild)
		}

		document.body.appendChild(container);
		box = root.querySelector('#box');
	})

	var selection = window.getSelection();
	var tempDiv = document.createElement('div');

	function onSelectionChange() {
		if (selection.isCollapsed || !selection.rangeCount) return;

		var range = selection.getRangeAt(0);
		var content = range.cloneContents();

		tempDiv.innerHTML = '';
		tempDiv.appendChild(content);

		var html = tempDiv.innerHTML;
		var text = tempDiv.innerText;

		var rects = range.getClientRects();
		var rect = rects[rects.length - 1];

		box.style.position = 'absolute';
		box.style.left = (rect.left + document.body.scrollLeft) + 'px';
		box.style.top = (rect.top + document.body.scrollTop - box.offsetHeight) + 'px';
	}

	console.log(box)

	document.addEventListener('selectionchange', onSelectionChange, false);
})();
