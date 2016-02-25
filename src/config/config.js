'use strict'

/// <reference path="translate.js" />
// using sendMessage() to communicate with background

var app = {
	conf: {
		mods: [
			{ name: 'Search', id: "khepfckcgmbgjgceoiliahnbidaodpjn:Search", enabled: true },
			{ name: 'Wiki', id: "wgwrgwrgw", enabled: false },
			{ name: 'Lorem', id: "wgwrgwrgw", enabled: true }
		]
	},
	loaded_mods: {},
	current_mod: null
}

Vue.config.debug = true

app = new Vue({
	el: '#app',
	data: app,
	methods: {
		showMod: function (index) {
			var m = app.conf.mods[index]
			app.current_mod = app.loaded_mods[m.id]
		}
	},
	filters: {
		marked: marked
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

sendMessage("loaded_mods").then((loaded_mods) => { app.loaded_mods = loaded_mods })
sendMessage("conf").then((conf) => { app.conf = conf })
