'use strict'

var args = process.argv.slice(2);

if (args.length !== 2) {
	console.log("Usage: generate_locales.js JSON OUTDIR");
	console.log(" - JSON \t the path to json file.")
	console.log(" - OUTDIR \t the path to dir with '_locales'")
	process.exit(1)
}

var arg = {
	json: args[0],
	outdir: args[1]
}

var path = require('path')
var fs = require('fs')

var source = JSON.parse(fs.readFileSync(arg.json, 'UTF-8'))
var output = {}

for (let key in source) {
	var phase = source[key];
	var phase_meta = {};

	phase['description'] && (phase_meta['description'] = phase['description'])
	if (!phase['en']) {
		phase['en'] = key
	}
	key = key.replace(/ /g, '_')

	for (let lang in phase) {
		if (lang === 'description') continue;
		output[lang] || (output[lang] = {});
		output[lang][key] = { message: phase[lang] };
		// console.log(`Found ${lang} for ${key}: ${phase[lang]}`);
	}
}

try { fs.mkdirSync(arg.outdir) } catch (er) { }

Object.keys(output).forEach((lang) => {
	fs.mkdir(path.join(arg.outdir, lang), () => {
		let filename = path.join(arg.outdir, lang, 'messages.json')
		let data = JSON.stringify(output[lang])
		fs.writeFile(filename, data)
	})
})
