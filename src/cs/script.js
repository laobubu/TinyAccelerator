'use strict';

(document.doctype || !document.xmlVersion) &&
(function () {
	var container = document.createElement('div')
	var box = {
		ghost: false,
		visible: true,
		/** the `#box` element */
		div: container,
		/** the `#view` element */
		view: container,
		/** the `#entry` element */
		entry: container,

		surroundingRects: [],

		isHiding: 0,
		hideAfter: 1000,
		size: { width: 250, height: 150 },
		position: { x: 0, y: 0 }
	}
	var root = container.createShadowRoot()

	function postInit() {
		function hidingFunc() {
			box.isHiding = 0
			box.div.classList.remove('active')
		}
		box.div.addEventListener('mouseenter', () => {
			if (event.target !== box.div) return

			if (box.isHiding) {
				clearTimeout(box.isHiding)
				box.isHiding = 0
			}
			box.div.classList.add('active')
		}, true)
		box.div.addEventListener('mouseleave', () => {
			if (event.target !== box.div) return

			if (box.isHiding) {
				clearTimeout(box.isHiding)
			}
			box.isHiding = setTimeout(hidingFunc, box.hideAfter)
		}, true)
		container.setAttribute("style", "z-index: 2147483647; display: none; position: absolute; width: " + box.size.width + "px")
		box.div.style.maxHeight = box.size.height + "px"
	}

	chrome.runtime.sendMessage("box", (box_info) => {
		root.innerHTML = '<style style="display:none">\n' + box_info.style + '\n</style>' + box_info.html

		document.body.appendChild(container)
		box.div = root.querySelector('#box')
		box.view = root.querySelector('#view')
		box.entry = root.querySelector('#entry')
		box.size = box_info.size

		postInit()
	})

	var selection = window.getSelection()
	var tempDiv = document.createElement('div')

	function setBoxVisibility(visibile) {
		if (visibile === box.visible) return
		box.visible = visibile

		container.style.display = visibile ? 'block' : 'none'
	}
	function setBoxPosition() {
		if (!box.visible) return

		var rects = box.surroundingRects
		var rect = rects[rects.length - 1]

		var left = rect.left
		var top = rect.top

		// if (refPosition) {
		let refX = box.position.x,
			refY = box.position.y,
			nearestDistance = 0x1A0BB00
		left = refX
		for (let i = 0; i !== rects.length; i++) {
			let ri = rects[i]
			if (ri.left <= refX && refX <= ri.right) {
				let riDistance = Math.abs(ri.top + (ri.height / 2) - refY)
				if (riDistance < nearestDistance) {
					top = ri.top
					rect = ri
					nearestDistance = riDistance
				}
			}
		}
		// }

		if ((top - box.size.height) < 0) {
			top += rect.height
			box.div.classList.add('vertical-reverse')
		} else {
			box.div.classList.remove('vertical-reverse')
		}

		if ((left + box.size.width) > window.innerWidth) {
			box.div.classList.add('horizontal-reverse')
			left -= box.size.width
		} else {
			box.div.classList.remove('horizontal-reverse')
		}

		container.style.left = (left + document.body.scrollLeft) + 'px'
		container.style.top = (top + document.body.scrollTop) + 'px'
	}

	function onSelectionChange(ev) {
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

		if (box.ghost) return

		var currentTime = +new Date()
		if (onSelectionChange.trigNext > currentTime) {
			onSelectionChange.trigArgCache = ev
			if (onSelectionChange.trigTimeout) return
			onSelectionChange.trigTimeout = setTimeout(onSelectionChange.trigTimeoutFn, onSelectionChange.trigNext - currentTime)
			return
		}
		onSelectionChange.trigNext = currentTime + onSelectionChange.trigSpan

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

		console.log('request ' + text)


		port.postMessage(request)
	}
	onSelectionChange.trigSpan = 300
	onSelectionChange.trigNext = 0
	onSelectionChange.trigArgCache = null
	onSelectionChange.trigTimeout = null
	onSelectionChange.trigTimeoutFn = function () {
		onSelectionChange.trigTimeout = null
		onSelectionChange(onSelectionChange.trigArgCache)
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

	var monodramaLast = null
	function monodrama(ele) {
		if (monodramaLast) {
			monodramaLast.view.style.display = 'none'
			monodramaLast.button.classList.remove('active')
		}
		if (monodramaLast = ele) {
			box.view.appendChild(monodramaLast.view)
			monodramaLast.view.style.display = 'block'
			monodramaLast.button.classList.add('active')
		}
	}

	var port = chrome.runtime.connect({ name: "page" })
	port.onMessage.addListener((msg) => {
		if (msg.id != currentID) return

		var ins = msg.instance
		var order = msg.order
		let self = {
			button: null,
			view: null
		}

		if (ins.button.text) {
			var entryButton = document.createElement('div')
			entryButton.className = "entry-btn"
			entryButton.setAttribute("tinyacc-instance", ins.id)
			entryButton.textContent = ins.button.text
			insertOrdered(entryButton, box.entry, order)

			self.button = entryButton

			let event = ins.button.event
			if (event) {
				Object.keys(event).forEach((eventName) => {
					let eventBody = event[eventName]
					let eventHandler = new Function("event", eventBody)
					entryButton.addEventListener(eventName, eventHandler.bind(self))
				})
			}
		}

		if (ins.view) {
			var viewContent = document.createElement('div')
			viewContent.className = "view-content"
			viewContent.setAttribute("tinyacc-instance", ins.id)
			viewContent.innerHTML = ins.view

			self.view = viewContent
			insertOrdered(viewContent, box.view, order)

			if (entryButton) {
				//if have a button and has a low priority, then hide it!!
				if (box.view.firstElementChild !== viewContent) {
					monodrama(self)
				}

				entryButton.addEventListener("mouseenter", (ev) => {
					monodrama(self)
				})
			}
		}
	})

	var currentID = ""
	function genID() {
		currentID = "ta+" + (+new Date()).toString(36)
		return currentID
	}

	document.addEventListener('selectionchange', onSelectionChange, true)
	document.body.addEventListener('mousedown', (ev) => {
		if (!box.ghost && ev.target !== container) {
			box.ghost = true
			box.div.classList.add('ghost')
		}
	}, true);
	document.body.addEventListener('mouseup', (ev) => {
		//NOTICE: selectionchange fires before mouseup
		if (box.ghost && ev.target !== container) {
			box.ghost = false
			box.div.classList.remove('ghost')
			box.position.x = ev.pageX - document.body.scrollLeft
			box.position.y = ev.pageY - document.body.scrollTop
			onSelectionChange(ev)
			setBoxPosition()
		}
	}, true)

	setBoxVisibility(false)
})();
