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
	saving: false,
	page: {
		name: "welcome",
		mod: null
	}
}

Vue.config.debug = true

function OpenURL(url) {
	window.postMessage({ type: "open?", url: url }, "*")
}

app = new Vue({
	el: '#app',
	data: app,
	methods: {
		showMod: function (id) {
			if (modDragging) return
			var mod = app.loaded_mods[id]
			if (mod) {
				app.page.mod = mod
				app.page.name = "show"
			} else {
				app.page.mod = {
					id: id,
					chromeOptURL: 'chrome://extensions/?id=' + id.split(':', 2)[0]
				}
				app.page.name = "mod404"
			}
		},
		enableMod: function (id) {
			app.conf.mods.push(id)
			commitConf()
		},
		open: OpenURL,
		disable: function (id) {
			app.conf.mods.$remove(id)
			app.page.name = "welcome"
			commitConf()
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
			methods: {
				open: OpenURL
			},
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
	commitConf()
}

function commitConf() {
	if (app.saving) return
	app.saving = sendMessage({
		type: 'conf',
		data: app.conf
	}).then(() => {
		app.saving = false
	})
}

var modDragging = false

$(".mod-list").delegate("li", "mousedown", () => {
	app.page.name = "welcome"
	$('#page-welcome').show()
}).sortable({
	forcePlaceholderSize: true,
	connectWith: ".mod-list",
	placeholder: "sortable-placeholder",
	start: () => {
		app.page.name = "welcome"
		$(".mod-list").addClass("emphasis")
		modDragging = true
	},
	stop: () => {
		updateModuleSetting()
		$(".mod-list").removeClass("emphasis")
		modDragging = false
	}
}).disableSelection()

sendMessage("loaded_mods").then((loaded_mods) => { app.loaded_mods = loaded_mods })
sendMessage("conf").then((conf) => { app.conf = conf })
