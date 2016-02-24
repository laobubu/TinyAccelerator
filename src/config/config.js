'use strict'

/// <reference path="translate.js" />
// using sendMessage() to communicate with background

var app = {
	conf: {
		mods: [
			{ name: 'Search', id: "wgwrgwrgw", enabled: true },
			{ name: 'Wiki', id: "wgwrgwrgw", enabled: false },
			{ name: 'Lorem', id: "wgwrgwrgw", enabled: true }
		]
	},
	loaded_mods: {}
}

app = new Vue({
	el: '#app',
	data: app,
	methods: {
		showMod: function (index) {
			var m = app.conf.mods[index]
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

		app.conf.mods.splice(newIndex, 0, app.conf.mods.splice(origIndex, 1)[0])
	}
}).disableSelection()

sendMessage("loaded_mods").then((msg) => {
	app.loaded_mods = msg
})
