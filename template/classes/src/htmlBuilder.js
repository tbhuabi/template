define(function(require, exports, module) {
    var toolkit = require('./toolkit');

    var oddTagList = ['a', 'img', 'input', 'br', 'hr', 'param', 'meta', 'link'];

    //html引擎，生成类DOM结构
    //html元素构造器
    function HtmlBuilder(tagName, properties) {
		if(!toolkit.isString(tagName)){
			throw new Error('标签名必须是string');
		}
        this.nodeType = tagName ? 1 : 3;
        this.attributes = [];
        this.parentNode = null;
        if (oddTagList.indexOf(tagName) == -1 && this.nodeType !== 3) {
			this.tagName = tagName;
            this.children = [];
            this.childNodes = [];
            this.innerHTML = '';
            this.innerText = '';
            this.outerHtml = '';
        }
        this.setAttribute(properties);
    };
    toolkit.extend(HtmlBuilder.prototype, {
        setAttribute: function(attributes, value) {
            if (toolkit.isString(attributes)) {
                for (var i = 0; i < this.attributes.length; i++) {
                    if (this.attributes[i].name === attributes) {
                        this.attributes[i].value = value;
                        return this;
                    }
                }
                var obj = {};
                obj.name = attributes;
                obj.value = value;
				this.attributes.push(obj);
                return this;
            }
            if (toolkit.isObject(attributes)) {
                for (var i in attributes) {
                    this.attributes.push({
                        name: i,
                        value: attributes[i]
                    })
                }
            }
            return this;
        },
        getAttribute: function(key) {
            return this.attributes[key];
        },
        addClass: function(className) {
            if (this.attributes.className === undefined) {
                this.attributes.className = '';
            }
            var reg = new RegExp('(^|\\s+)' + className + '(\\s+|$)');
            if (!reg.test(' ' + this.attributes.className + ' ')) {
                this.attributes.className += ' ' + className;
            }
        },
        removeClass: function(className) {
            if (this.attributes.className === undefined) {
                this.attributes.className = '';
            }
            var reg = new RegExp('(^|\\s+)' + className + '(\\s+|$)');
            if (reg.test(' ' + this.attributes.className + ' ')) {
                this.attributes.className = this.attributes.className.replace(reg, '').replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
            }
        },
        appendChild: function(TBDomElement) {
            this.childNodes.push(TBDomElement);
            if (TBDomElement.nodeType === 1) {
                this.children.push(TBDomElement);
            }
        },
        removeChild: function(TBDomElement) {
            for (var i = 0; i < this.childNodes.length; i++) {
                if (this.childNodes[i] === TBDomElement) {
                    this.childNodes.splice(i, 1);
                    break;
                }
            }
            if (TBDomElement.nodeType === 1) {
                for (var i = 0; i < this.children.length; i++) {
                    if (this.children[i] === TBDomElement) {
                        this.children.splice(i, 1);
                        break;
                    }
                }
            }
        },
        insertBefore: function(TBDomElement, nextElement) {
            for (var i = 0; i < this.childNodes.length; i++) {
                if (this.childNodes[i] === nextElement) {
                    this.childNodes.splice(i, 0, TBDomElement);
                    break;
                }
            }
            for (var i = 0; i < this.children.length; i++) {
                if (this.children[i] === nextElement) {
                    this.children.splice(i, 0, TBDomElement);
                    break;
                }
            }
        }
    });
    module.exports = HtmlBuilder;
})
