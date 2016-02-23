/// <reference path="tinyacc.d.ts" />
/// <reference path="../chrome/chrome.d.ts" />

/**
 * This is just a helper when developing TinyAcc. 
 * 
 * If you are making a module, this file is useless.
 */

declare var loaded_mods: {
	[id: string]: {
		id: string,
		profile: TinyAcc.Profile,
		port: chrome.runtime.Port
	}
}
