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
	
	var selection = window.getSelection();
	var tempDiv = document.createElement('div');
	
	function onSelectionChange(){
		if (selection.isCollapsed || !selection.rangeCount) return;
		
		var range = selection.getRangeAt(0);
		var content = range.cloneContents();
		
		tempDiv.innerHTML = '';
		tempDiv.appendChild(content);
		
		var html = tempDiv.innerHTML;
		var text = tempDiv.innerText;
		
		var rects = range.getClientRects();
		var rect = rects[rects.length - 1];
		
		
	}
})();
