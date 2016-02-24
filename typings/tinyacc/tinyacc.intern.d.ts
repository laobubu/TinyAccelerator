/// <reference path="tinyacc.d.ts" />
/// <reference path="../chrome/chrome.d.ts" />
///
/// This is just a helper when developing TinyAcc. 
/// 
/// If you are making a module, this file is useless.
///

declare type confType = {
	mods: { name: string, id: string, enabled: boolean }[]
};

declare type modDictType = {
	[id: string]: {
		id: string,
		profile: TinyAcc.Profile,
		port?: chrome.runtime.Port
	}
};

declare var conf: confType;

declare var loaded_mods: modDictType;

declare var app: {
	conf: confType,
	loaded_mods: modDictType
};
