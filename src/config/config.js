'use strict'

/// <reference path="translate.js" />
// using sendMessage() to communicate with background

var conf = {
    mods: [
		{ name: 'Search', enabled: true },
		{ name: 'Wiki', enabled: false },
		{ name: 'Lorem', enabled: true }
    ]
}

conf = new Vue({
	el: '#app',
	data: conf,
	methods: {
		showMod: function(index) {
			var m = conf.mods[index]
			m.enabled = !m.enabled
		}
	}
})

$("#mod-list").sortable({
	axis: "y",
	forcePlaceholderSize: true,
	placeholder: "sortable-placeholder",
	stop: (ev, ui) => {
		var ele = ui.item[0]
		var origIndex = parseInt(ele.getAttribute('data-index'))
		var newIndex = -1
		newIndex = [].indexOf.call(ele.parentElement.children, ele)

		conf.mods.splice(newIndex, 0, conf.mods.splice(origIndex, 1)[0])
	}
}).disableSelection()

sendMessage("loaded_mods").then((msg) => {
	console.log(msg)
})
