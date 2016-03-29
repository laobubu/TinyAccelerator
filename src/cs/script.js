/// <reference path="../../typings/chrome/chrome.d.ts" />
/// <reference path="../../typings/tinyacc/tinyacc.intern.d.ts" />

'use strict';

/** create a delayed function, with a `cancel()` method */
function delayFunc(fn, timeout) {
	var timeout = 0;
	var args = [];
	var self = null;

	function timeoutCallback() {
		timeout = 0;
		fn.apply(self, args);
	}

	function call() {
		self = this;
		args = arguments;
		if (!timeout) timeout = setTimeout(timeoutCallback, timeout);
	}

	call.cancel = function() {
		if (timeout) {
			timeout = 0;
			clearTimeout(timeout);
		}
	}

	return call;
}

/** create a throttled Function */
function throttle(fn, timespan) {
	var timeout = 0;
	var nextTrig = 0;
	var _this, _args;

	function timeoutCallback() {
		timeout = 0;
		call.apply(_this, _args);
	}

	function call() {
		var now = +new Date();
		if (now >= nextTrig) {
			nextTrig = now + timespan;
			fn.apply(this, arguments);
		} else {
			_this = this;
			_args = arguments;
			if (!timeout) timeout = setTimeout(timeoutCallback, nextTrig - now);
		}
	}

	return call;
}

/**
 * Extract content from the range
 * 
 * @param {Range} range
 */
function extract(range) {
	var tempDiv = document.createElement('div')
	var content = range.cloneContents()

	tempDiv.innerHTML = ''
	tempDiv.appendChild(content)

	var html = tempDiv.innerHTML
	var text = tempDiv.innerText.trim()

	return {
		html: html,
		text: text
	}
}

/** The TinyAcc Box class */
class TinyAccBox {
	constructor(box_info) {
		this.visible = false;
		this.position = { x: 0, y: 0, rects: [] };

		var container = this.container = document.createElement('div');
		var root = this.root = container.createShadowRoot();

		root.innerHTML = '<style style="display:none">\n' + box_info.style + '\n</style>' + box_info.html;

		/** @type {HTMLElement} */
		var div = root.querySelector('#box');
		this.div = div;
		this.view = root.querySelector('#view');
		this.entry = root.querySelector('#entry');
		this.size = box_info.size;

		var hidingFunc = delayFunc(() => {
			div.classList.remove('active');
		}, 1000);

		var showingFunc = function() {
			div.classList.add('active');
			hidingFunc.cancel();
		}

		container.setAttribute("style", "z-index: 2147483647; position: absolute; width: " + this.size.width + "px");
		div.style.maxHeight = this.size.height + 'px';
		div.addEventListener("mouseleave", hidingFunc, false);
		div.addEventListener("mouseenter", showingFunc, false);
	}

	setRefPosition(x, y) {
		this.position.x = x;
		this.position.y = y;
	}

	setRefRects(rects) {
		this.position.rects = rects;
	}

	updatePosition() {
		var box = this;
		if (!box.visible) return false;

		var rects = box.position.rects;
		var rect = rects[rects.length - 1];

		var left = rect.left;
		var top = rect.top;

		if (box.position.x || box.position.y) {
			let refX = box.position.x,
				refY = box.position.y,
				nearestDistance = 0x1A0BB00;
			left = refX;
			for (let i = 0; i !== rects.length; i++) {
				let ri = rects[i];
				if (ri.left <= refX && refX <= ri.right) {
					let riDistance = Math.abs(ri.top + (ri.height / 2) - refY);
					if (riDistance < nearestDistance) {
						top = ri.top;
						rect = ri;
						nearestDistance = riDistance;
					}
				}
			}
		} else {
			left = rect.left;
			top = rect.top;
		}

		if ((top - box.size.height) < 0) {
			top += rect.height;
			box.div.classList.add('vertical-reverse');
		} else {
			box.div.classList.remove('vertical-reverse');
		}

		if ((left + box.size.width) > window.innerWidth) {
			box.div.classList.add('horizontal-reverse');
			left -= box.size.width;
		} else {
			box.div.classList.remove('horizontal-reverse');
		}

		this.container.style.left = (left + document.body.scrollLeft) + 'px'
		this.container.style.top = (top + document.body.scrollTop) + 'px'

		return true;
	}

	/**
	 * @param {boolean} visible
	 */
	setVisibility(visible) {
		if (visible === this.visible) return
		var container = this.container;

		if (this.visible = visible) {
			document.body.appendChild(container);
			container.style.display = 'block';
		} else {
			container.parentElement && container.parentElement.removeChild(container);
			container.style.display = 'none';
			this.position.x = this.position.y = 0;
		}
	}
}

/** 
 * works with `div > div[order]` 
 * 
 * @param {HTMLElement} ele the new child
 * @param {HTMLElement} parent
 * @param {number} order
 */
function insertOrdered(ele, parent, order) {
	var insertBefore = null;
	[].some.call(parent.children, (cmp) => {
		var cmpOrder = ~~cmp.getAttribute("order");
		if (cmpOrder < order) return false;

		insertBefore = cmp;
		return true;
	})
	ele.setAttribute("order", order);
	parent.insertBefore(ele, insertBefore);
}


/** the View Manager */
class TinyAccViewManager {
	/** @param {TinyAccBox} box */
	constructor(box) {
		this.box = box;
		this.empty();
	}

	empty() {
		this.box.view.innerHTML = ""
		this.box.entry.innerHTML = ""
		this.monodramaLast = null;
	}

	/** 
	 * move a view of an instance to the top
	 * 
	 * @param {TinyAcc.InstanceEventThis} insSelf
	 */
	monodrama(insSelf) {
		var lastView = this.monodramaLast;

		if (lastView) {
			lastView.view.style.display = 'none'
			lastView.button.classList.remove('active')
		}

		if (lastView = insSelf) {
			this.box.view.appendChild(lastView.view)
			lastView.view.style.display = 'block'
			lastView.button.classList.add('active')
		}

		this.monodramaLast = lastView;
	}

	/**
	 * Create functions and bind event handlers
	 * 
	 * @param {HTMLElement} ele
	 * @param {TinyAcc.EventInfo} eventInfo
	 * @param {TinyAcc.InstanceEventThis} self
	 */
	eventBind(ele, eventInfo, self) {
		if (!ele || !eventInfo) return;
		Object.keys(eventInfo).forEach((eventName) => {
			let eventBody = eventInfo[eventName]
			let eventHandler = new Function("event", eventBody)
			ele.addEventListener(eventName, eventHandler.bind(self))
		})
	}

	/**
	 * Handle new Instance Result
	 * 
	 * @param {TinyAcc.Instance} ins
	 * @param {number} order
	 */
	add(ins, order) {
		let self = {
			button: null,
			view: null
		}

		if (ins.button && ins.button.text) {
			var entryButton = document.createElement('div')
			entryButton.className = "entry-btn"
			entryButton.setAttribute("tinyacc-instance", ins.id)
			entryButton.textContent = ins.button.text
			insertOrdered(entryButton, this.box.entry, order)

			self.button = entryButton
			this.eventBind(entryButton, ins.button.event, self)
		}

		if (ins.view) {
			var viewContent = document.createElement('div')
			viewContent.className = "view-content"
			viewContent.setAttribute("tinyacc-instance", ins.id)
			viewContent.innerHTML = ins.view.html || ins.view

			self.view = viewContent
			insertOrdered(viewContent, this.box.view, order)
			this.eventBind(viewContent, ins.view.event, self)

			if (entryButton) {
				//if have a button and has a low priority, then hide it!!
				if (this.box.view.firstElementChild !== viewContent) {
					this.monodrama(self)
				}

				entryButton.addEventListener("mouseenter", (ev) => {
					this.monodrama(self)
				})
			}
		}

		if (ins.onCreated) {
			(new Function(ins.onCreated)).call(self)
		}
	}
}

(document.doctype || !document.xmlVersion) &&
	(function() {
		/** @type {TinyAccBox} */
		var box;

		/** @type {TinyAccViewManager} */
		var viewMgr;

		chrome.runtime.sendMessage("box", (box_info) => {
			box = new TinyAccBox(box_info);
			box.setVisibility(false);

			viewMgr = new TinyAccViewManager(box);

			initHooks();
		})

		var selection = window.getSelection();

		/** Read the selection and update box */
		var updateBox = throttle(updateBoxReal, 500);
		function updateBoxReal() {
			var range = selection.rangeCount && selection.getRangeAt(0)

			if (selection.isCollapsed) {
				var focusOnBox =
					range && range.startContainer && (
						range.startContainer === box.div ||
						range.startContainer.compareDocumentPosition(box.div) === Node.DOCUMENT_POSITION_CONTAINED_BY ||
						range.startContainer.childNodes[range.startOffset] === box.container
					)

				if (!focusOnBox) box.setVisibility(false);

				return false;
			}

			/** extract content */
			var content = extract(range);
			var text = content.text;
			var html = content.html;
			if (!text.length) return false;

			viewMgr.empty();

			box.setRefRects(range.getClientRects());
			box.setVisibility(true);
			box.updatePosition();

			var request = {
				id: genID(),
				info: {
					text: text,
					html: html,
					url: window.location.href
				}
			}

			port.postMessage(request)
			return true
		}

		var port = chrome.runtime.connect({ name: "page" })
		port.onMessage.addListener((msg) => {
			if (msg.id != currentID) return

			var ins = msg.instance
			var order = msg.order

			viewMgr.add(ins, order);
		})

		var currentID = ""
		function genID() {
			currentID = "ta+" + (+new Date()).toString(36)
			return currentID
		}

		/** init event hooks so that TinyAcc can handle selectionchange */
		function initHooks() {
			var selectionSuppress = false;
			var selectionSuppressed = false;

			document.addEventListener('selectionchange', (ev) => {
				if (selectionSuppress) {
					selectionSuppressed = true;
				} else {
					updateBox();
					selectionSuppressed = false;
				}
			}, true);

			document.body.addEventListener('mousedown', (ev) => {
				if (ev.target === box.container) return;
				selectionSuppress = true;
				box.setVisibility(false);
			}, true);

			document.body.addEventListener('mouseup', (ev) => {
				//NOTICE: selectionchange fires before mouseup
				if (ev.target === box.container) return;

				selectionSuppress = false;
				if (selectionSuppressed) {
					box.setRefPosition(
						ev.pageX - document.body.scrollLeft,
						ev.pageY - document.body.scrollTop
					)
					updateBox();
				}
			}, true);
		}

	})();
