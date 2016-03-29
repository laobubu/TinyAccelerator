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

declare function local_connect(options: { name: string }): chrome.runtime.Port;

declare interface TinyAccBox {
	visible: boolean;
	position: {
		x: number,
		y: number,
		rects: ClientRectList
	}
	size: {
		width: number,
		height: number
	}
	
	/** host container on page */
	container: HTMLDivElement;
	root: DocumentFragment;
	
	div: HTMLDivElement;
	view: HTMLDivElement;
	
	/** the div containing entry buttons */
	entry: HTMLDivElement;
	
	setVisibility(boolean);
}

declare interface TinyAccViewManager{
	box: TinyAccBox;
	monodramaLast: TinyAcc.InstanceEventThis;
}
