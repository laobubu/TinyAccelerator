'use strict';
/// <reference path="basic.js" />
/// <reference path="tinybind.js" />

var conf = {
    api: "google"
};
var bind;
var conf_name;

function onInit(){
    conf_name = document.body.getAttribute("config");
    config.get(conf_name, conf).then(newConf => {
        conf=newConf
        bind = new TinyBind(conf, document.body);
        bind.onUpdate = function() {
            config.set(conf_name, conf);
            chrome.runtime.sendMessage("ConfigUpdated");
        }
    });
}
config.onInit.addEventListener(onInit)
