'use strict';

/** 
 * TinyBind is a simple view-data binding lib 
 * 
 * @author laobubu
 */

function TinyBind(object, parent) {
    /** 
     * a Element->Variable dict
     * 
     * @example [{ ele: Element, var: "profile.name" }]
     */
    this.bindDict = [];
    this.object = object;

    /** 
     * update a element or a field value
     * 
     * @param {bindItem} item from this.bindDict
     * @param {boolean} v2m true if want to update module's field
     */
    this.exec = function(item, v2m) {
        if (v2m) this.ptr(item.var, this.eleVal(item.ele));
        else this.eleVal(item.ele, this.ptr(item.var));
    }

    /** 
     * get or set a value of Module
     * 
     * @param {string} name varname
     * @param {any?} val the new value. if is `undefined`, the value will not apply.
     */
    this.ptr = function(name, val) {
        var p = this.object;
        var fieldList = name.split(".");
        var lastField = fieldList.pop();
        fieldList.forEach(function(name) {
            p = p[name]
        });
        if (typeof(val) !== "undefined") p[lastField] = val;
        return p[lastField];
    }

    /**
     * get value from an element, or set a element
     * 
     * @param {Element} ele
     * @param {any?} val the new value for the ele. if `undefined`, do not change the element
     * @param {any} the best field value for this.object
     */
    this.eleVal = function(ele, val) {
        var valDefined = typeof(val) !== "undefined";
        var nodeName = ele.nodeName;
        if (nodeName === "INPUT") {
            //this is a input 
            var type = (ele.getAttribute("type") || "text").toLowerCase();
            if (type === "checkbox") {
                if (valDefined) ele.checked = val;
                return ele.checked;
            }
            if (valDefined) ele.value = val;
            return ele.value;
        }
        if (nodeName === "SELECT") {
            //a select box
            if (valDefined) {
                var options = ele.children;
                var i = options.length;
                while (--i !== -1) {
                    var option = options[i];
                    if (option.value === val) {
                        option.selected = true;
                        break;
                    }
                }
            }
            return ele.value;
        }
    }

    this.changeHandler = function(ev) {
        var d = this.bindDict;
        var i = d.length;
        while (--i !== -1) {
            if (d[i].ele !== ev.target) continue;
            this.exec(d[i], true);
            break;
        }
    }

    var inputs = parent.querySelectorAll("[t-bind]");
    var i = inputs.length;
    var h = this.changeHandler.bind(this);
    while (--i !== -1) {
        var ele = inputs[i],
            x = {
                ele: ele,
                var: ele.getAttribute('t-bind')
            };
        this.bindDict.push(x);
        this.exec(x, false);
        ele.addEventListener('change', h, false);
    }
}
