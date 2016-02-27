'use strict';
/// <reference path="basic.js" />
/// <reference path="tinybind.js" />

function onInit(){
    if (!config.inited) {
        setTimeout(onInit, 100)
        return
    }
    console.log(config.impl);
    document.body.getAttribute("config");
}
onInit()
