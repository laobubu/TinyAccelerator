'use strict';

(function () {
	var container = document.createElement('div')
	var box = {
		visible: true,
		/** the `#box` element */
		div: container,
		/** the `#view` element */
		view: container,
		/** the `#entry` element */
		entry: container,

		surroundingRects: [],
		
		isHiding: 0,
		hideAfter: 1000
	}
	var root = container.createShadowRoot()
	
	function postInit() {
		function hidingFunc() {
			box.isHiding = 0
			box.div.classList.remove('active')
		}
		box.div.addEventListener('mouseenter', () => {
			if (box.isHiding) {
				clearTimeout(box.isHiding)
				box.isHiding = 0
			}
			box.div.classList.add('active')
		}, true)
		box.div.addEventListener('mouseout', () => {
			if (box.isHiding) {
				clearTimeout(box.isHiding)
			}
			box.isHiding = setTimeout(hidingFunc, box.hideAfter)
		}, true)
	}

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
		box.view = root.querySelector('#view')
		box.entry = root.querySelector('#entry')
		
		postInit()
	})

	var selection = window.getSelection()
	var tempDiv = document.createElement('div')

	container.style.right = '0px'
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

		var boxHeight = 200 * 4 / 3

		if ((top - boxHeight) < 0) {
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

		box.view.innerHTML = ""
		box.entry.innerHTML = ""
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

	function insertOrdered(ele, parent, order) {
		var insertBefore = null;
		[].every.call(parent.children, (cmp) => {
			var cmpOrder = ~~cmp.getAttribute("order")
			if (cmpOrder > order) insertBefore = cmp
			return (insertBefore === null)
		})
		ele.setAttribute("order", order)
		parent.insertBefore(ele, insertBefore)
	}

	function monodrama(ele) {
		[].every.call(ele.parentElement.children, (child) => {
			child.style.display = (child === ele) ? "block" : "none"
		})
	}

	var port = chrome.runtime.connect({ name: genID() })
	port.onDisconnect.addListener(() => {
		console.log('fuck')
	})
	port.onMessage.addListener((msg) => {
		console.log('current id is ' + currentID + ' got ' + msg.id);

		if (msg.id != currentID) return

		var ins = msg.instance
		var order = msg.order

		if (ins.view) {
			var viewContent = document.createElement('div')
			viewContent.className = "view-content"
			viewContent.setAttribute("tinyacc-instance", ins.id)
			viewContent.innerHTML = ins.view
			insertOrdered(viewContent, box.view, order)
		}

		if (ins.button.text) {
			var entryButton = document.createElement('div')
			entryButton.className = "entry-btn"
			entryButton.setAttribute("tinyacc-instance", ins.id)
			entryButton.textContent = ins.button.text
			insertOrdered(entryButton, box.entry, order)

			let event = ins.button.event
			if (event) {
				Object.keys(event).forEach((eventName) => {
					let eventBody = event[eventName]
					let eventHandler = new Function("event", eventBody)
					entryButton.addEventListener(eventName, eventHandler)
				})
			}

			if (viewContent) {
				entryButton.addEventListener("mouseenter", (ev) => {
					monodrama(viewContent)
				})
			}
		}
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
})();
