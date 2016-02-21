'use strict';

(() => {
	var container = document.createElement('div');
	var box = {
		visible: false,
		div: container
	};
	var root = container.createShadowRoot();

	chrome.runtime.sendMessage("box", (box_info) => {
		var style = document.createElement('style');
		style.textContent = box_info.style;
		root.appendChild(style);

		container.innerHTML = box_info.html;
		while (container.firstChild) {
			root.appendChild(container.firstChild)
		}

		document.body.insertBefore(container, document.body.firstChild);
		box.div = root.querySelector('#box');
	})

	var selection = window.getSelection();
	var tempDiv = document.createElement('div');

	container.style.position = 'absolute'
	function setBoxVisibility(visibile) {
		if (visibile === box.visible) return
		box.visible = visibile

		container.style.display = visibile ? 'block' : 'none'
		if (visibile) {
			setBoxPosition()
		}
	}
	function setBoxPosition() {
		if (!box.visible) return

		var range = selection.getRangeAt(0)

		var rects = range.getClientRects()
		var rect = rects[rects.length - 1]

		container.style.left = (rect.left + document.body.scrollLeft) + 'px'
		container.style.top = (rect.top + document.body.scrollTop) + 'px'
	}

	function onSelectionChange() {
		var range = selection.rangeCount && selection.getRangeAt(0);
		
		if (selection.isCollapsed) {
			setBoxVisibility(range && (range.startContainer.childNodes[range.startOffset] === container) || false);
			return;
		}

		var content = range.cloneContents();

		tempDiv.innerHTML = '';
		tempDiv.appendChild(content);

		var html = tempDiv.innerHTML;
		var text = tempDiv.innerText;

		setBoxVisibility(true);
		setBoxPosition()
	}

	document.addEventListener('selectionchange', onSelectionChange, true)
	window.addEventListener('resize', setBoxPosition, false)
	
	window.tabox = box
})();
