'use strict'

/// <reference path="translate.js" />
// using sendMessage() to communicate with background

var app = {
	conf: {
		mods: [
			"khepfckcgmbgjgceoiliahnbidaodpjn:Search",
			"khepfckcgmbgjgceoiliahnbidaodpjn:Dict",
			"net.laobubu.tinyacc:lorem"
		]
	},
	loaded_mods: {},
	disabled_mods: [],
	page: {
		name: "welcome",
		mod: null
	}
}

Vue.config.debug = true

app = new Vue({
	el: '#app',
	data: app,
	methods: {
		showMod: function (id) {
			var mod = app.loaded_mods[id]
			app.page.mod = mod || { id: id, profile: null }
			app.page.name = mod ? "show" : "mod404"
		}
	},
	computed: {
		disabled_mods: () => {
			return Object.keys(app.loaded_mods)
				.filter((id) => (app.conf.mods.indexOf(id) === -1))
				.sort()
		}
	},
	components: {
		pageShow: {
			template: "#page-show",
			props: ["mod"],
			filters: {
				marked: marked
			}
		},
		pageMod404: {
			template: "#page-mod404",
			props: ["mod"],
		}
	}
})

function updateModuleSetting() {
	var mods = []
	$("#enabled-mods").children().each((i, ele) => {
		mods.push(ele.getAttribute("data-id"))
	})
	app.conf.mods = mods
}

$(".mod-list").sortable({
	forcePlaceholderSize: true,
	connectWith: ".mod-list",
	placeholder: "sortable-placeholder",
	stop: updateModuleSetting
}).disableSelection()

sendMessage("loaded_mods").then((loaded_mods) => { app.loaded_mods = loaded_mods })
sendMessage("conf").then((conf) => { app.conf = conf })
