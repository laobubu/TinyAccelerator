'use strict';

(() => {
	var container = document.createElement('div')
	var box = {
		visible: true,
		div: container
	}
	var root = container.createShadowRoot()

	chrome.runtime.sendMessage("box", (box_info) => {
		var style = document.createElement('style')
		style.textContent = box_info.style
		root.appendChild(style)

		container.innerHTML = box_info.html
		while (container.firstChild) {
			root.appendChild(container.firstChild)
		}

		document.body.appendChild(container)
		box.div = root.querySelector('#box')
	})

	var selection = window.getSelection()
	var tempDiv = document.createElement('div')

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

		var left = rect.left
		var top = rect.top

		if ((top - box.div.offsetHeight) < 0) {
			box.div.classList.add('vertical-reverse')
			top = rect.top + rect.height
		} else {
			box.div.classList.remove('vertical-reverse')
		}

		if ((left + box.div.offsetWidth) > window.innerWidth) {
			left = window.innerWidth - box.div.offsetWidth
		}

		container.style.left = (left + document.body.scrollLeft) + 'px'
		container.style.top = (top + document.body.scrollTop) + 'px'
	}

	function onSelectionChange() {
		var range = selection.rangeCount && selection.getRangeAt(0)

		if (selection.isCollapsed) {
			setBoxVisibility(
				range && (
					range.startContainer.childNodes[range.startOffset] === container ||
					range.startContainer === box.div ||
					range.startContainer.compareDocumentPosition(box.div) === Node.DOCUMENT_POSITION_CONTAINED_BY
					) || false
				)
			return
		}

		var content = range.cloneContents()

		tempDiv.innerHTML = ''
		tempDiv.appendChild(content)

		var html = tempDiv.innerHTML
		var text = tempDiv.innerText.trim()

		if (!text.length) return;

		setBoxVisibility(true)
		setBoxPosition()
	}

	document.addEventListener('selectionchange', onSelectionChange, true)
	document.body.addEventListener('mousedown', (ev) => {
		if (ev.target !== container)
			box.div.classList.add('ghost')
	}, true);
	document.body.addEventListener('mouseup', (ev) => {
		if (ev.target !== container) {
			//start key search
		}
		box.div.classList.remove('ghost')
	}, true);
	window.addEventListener('resize', setBoxPosition, false)
	document.addEventListener('transitionend', setBoxPosition, true)

	setBoxVisibility(false)
	window.tabox = box
})();
