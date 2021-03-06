'use strict'

var args = process.argv.slice(2);

if (args.length !== 2) {
	console.log("Usage: generate_locales.js YAML OUTDIR");
	console.log(" - YAML \t the path to yaml file, or a directory that contains yaml files.")
	console.log(" - OUTDIR \t the path to dir with '_locales'")
	process.exit(1)
}

var arg = {
	yaml: args[0],
	outdir: args[1]
}

var path = require('path')
var fs = require('fs')
var yaml = require('js-yaml')

var source = {}
var output = {}

if (fs.statSync(arg.yaml).isDirectory()) {
	fs.readdirSync(arg.yaml)
		.filter(str => str.endsWith(".yaml"))
		.forEach(filename => {
			let fpath = path.join(arg.yaml, filename)
			let tempObject = yaml.safeLoad(fs.readFileSync(fpath, 'UTF-8'))
			source = Object.assign(source, tempObject)
		})
} else {
	source = yaml.safeLoad(fs.readFileSync(arg.yaml, 'UTF-8'))
}

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
