function isType(type) {
    return function(obj) {
        return {}.toString.call(obj) == '[object ' + type + ']';
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
    var oddTagList = ['a', 'img', 'input', 'br', 'hr', 'param', 'meta', 'link'];
    text = text.replace(/\s*[\n\t\r]+\s*/g, '');
    var arr = [];
    text.split(/(?!^)(?=<\/?[\w\-]+(?:\s+[\w\-]+(?:=""|="[^"]*"|=''|='[^"]*'|[^\s]+)*)*\s*>)/).filter(function(item) {
        arr.push(item);
    });
    var newArr = [];
    arr.filter(function(item) {
        var oldLength = newArr.length;
        item.replace(/(<\/?[\w\-]+(?:\s+[\w\-]+(?:=""|="[^"]*"|=''|='[^']*'|[^\s]+)*)*\s*>)(.*)/, function(str, $1, $2) {
            newArr.push($1);
            $2 && newArr.push($2);
        });
        if (oldLength == newArr.length) {
            newArr.push(item);
        }
    })
    var domTreeArray = [];

    function buildDomTree(arr, resultArray) {
        for (var i = 0; i < arr.length; i++) {
            var firstTag = /^<([\w\-]+)/.exec(arr[i]);
            if (firstTag) {
                firstTag = firstTag[1];
            }
            var lastTag = /^<\/([\w\-]+)/.exec(arr[i]);
            if (lastTag) {
                lastTag = lastTag[1];
                console.log(lastTag);
            }
        }
    }
    buildDomTree(newArr, domTreeArray)
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
    this.attributes = {};
    if (!isOddTags) {
        this.setAttribute('childNodes', []);
    }
    this.setAttribute(properties);
};
toolKit.extend(HtmlBuilder.prototype, {
    setAttribute: function(attributes, value) {
        if (toolKit.isString(attributes)) {
            this.attributes[attributes] = value;
            return this;
        }
        for (var i in attributes) {
            this.attributes[i] = attributes[i];
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
    }
})
