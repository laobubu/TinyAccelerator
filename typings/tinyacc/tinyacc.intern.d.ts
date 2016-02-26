/// <reference path="tinyacc.d.ts" />
/// <reference path="../chrome/chrome.d.ts" />
///
/// This is just a helper when developing TinyAcc. 
/// 
/// If you are making a module, this file is useless.
///

declare type confType = {
	/** the enabled mods id */
	mods: string[]
};

declare type modDictItem = {
	id: string,
	profile: TinyAcc.Profile,
	port?: chrome.runtime.Port
};

declare type modDictType = {
	[id: string]: modDictItem
};

declare var conf: confType;

declare var loaded_mods: modDictType;

declare var app: {
	conf: confType,
	loaded_mods: modDictType,
	disabled_mods: string[],
	page: {
		name: string,
		mod?: modDictItem
	}
};
