'use strict';

(function () {
	var container = document.createElement('div')
	var box = {
		visible: true,
		div: container,
		surroundingRects: null
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

		var rects = box.surroundingRects
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

		if (!text.length) return

		box.surroundingRects = range.getClientRects()
		setBoxVisibility(true)
		setBoxPosition()

		var request = {
			id: genID(),
			info: {
				text: text,
				html: html,
				url: window.location.href
			}
		}
		console.log("request", request)

		port.postMessage(request)
	}

	var port = chrome.runtime.connect({ name: genID() })
	port.onDisconnect.addListener(() => {
		console.log('fuck')
	})
	port.onMessage.addListener((msg) => {
		// if (msg.id !== currentID) return
		console.log('recv', msg)
		// console.log("recv instance", msg.instance)
	})

	var currentID = ""
	var genIDCounter = 0
	function genID() {
		currentID = "tinyacc+" + genIDCounter++ + +new Date()
		return currentID
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
	}, true)

	setBoxVisibility(false)
	window.tabox = box
})();
