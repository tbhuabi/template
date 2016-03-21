function isType(type) {
    return function(obj) {
        return {}.toString.call(obj) == '[object ' + type + ']'
    }
}
var toolKit = {
    isObject: isType('Object'),
    isString: isType('String'),
    isArray: Array.isArray || isType('Array'),
    isFunction: isType('Function'),
    isUndefined: isType('Undefined'),
    trim: function(str) {
        return str.replace(/^\s+|\s+$/g, '');
    },
    extend: function(obj, properties) {
        for (var i in properties) {
            obj[i] = properties[i];
        }
    },
    clone: function(obj) {
        var newObj;
        if (isType.isArray(obj)) {
            newObj = [];
            for (var i = 0; i < obj.length; i++) {
                if (isType.isArray(obj[i]) || isType.isObject(obj[i])) {
                    newObj.push(copy(obj[i]))
                } else {
                    newObj.push(obj[i]);
                }
            }
        } else if (isType.isObject(obj)) {
            newObj = {};
            for (var i in obj) {
                if (isType.isArray(obj[i]) || isType.isObject(obj[i])) {
                    newObj[i] = copy(obj[i]);
                } else {
                    newObj[i] = obj[i];
                }
            }
        }
        return newObj;
    }
};

//基于字符串生成类DOM树状Array
function XMLTreeBuilder(text) {
    var arr = text.split(/(?!^)(?=<\/?[\w\-]+(?:>|(?:\s+[\w\-]+=('|")[^\1]+\1)*\s*>))/);
	var newArr=[];
    arr.filter(function(item) {
        if(item && item != "'" && item != '"'){
			newArr.push(item);
		};
    })
    console.log(newArr);
};
//html引擎，生成类DOM结构
function HtmlEngine(TBDomCollectionArray) {
    this.$domCollection = TBDomCollectionArray;
    //	this.
};
toolKit.extend(HtmlEngine.prototype, {
    $attributeBuilder: function(htmlTag) {

    },
    init: function() {

    }
});



//html元素构造器
function HtmlBuilder(tagName, properties, isOddTags) {
    this.tagName = tagName;
    this.properties = {
        className: '',
        style: null
    };
    if (!isOddTags) {
        this.properties.childNodes = [];
    }
    this.attributes = {};
    for (var i in properties) {
        this.properties[i] = properties[i];
    }
};
toolKit.extend(HtmlBuilder.prototype, {
    setAttributes: function(attributes) {
        for (var i in attributes) {
            this.attributes[i] = attributes[i];
        }
    },
    getAttribute: function(key) {
        return this.attributes[key];
    },
    addClass: function(className) {
        var reg = new RegExp('(^|\\s+)' + className + '(\\s+|$)');
        if (!reg.test(' ' + this.properties.className + ' ')) {
            this.properties.className += ' ' + className;
        }
    },
    removeClass: function(className) {
        var reg = new RegExp('(^|\\s+)' + className + '(\\s+|$)');
        if (reg.test(' ' + this.properties.className + ' ')) {
            this.properties.className = this.properties.className.replace(reg, '').replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
        }
    }
})
