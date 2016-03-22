define(function(require, exports, module) {
    var toolkit = require('./toolkit');
    var oddTagList = ['a', 'img', 'input', 'br', 'hr', 'param', 'meta', 'link'];

    //html引擎，生成类DOM结构
    //html元素构造器
    function Document() {

    }
    toolkit.extend(Document.prototype, {
        createElement: function(tag) {
            return new HtmlBuilder(tag, 1);
        },
        createTextNode: function(text) {
            return new HtmlBuilder(text, 3);
        }
    });
    var document = new Document();


    function HtmlBuilder(tagName, nodeType) {
        this.nodeType = nodeType;
        this.parrentNode = null;
        if (nodeType === 3) {
            this.innerText = this.innerHTML = this.outerHtml = tagName;
        }
        if (nodeType === 1) {
            this.attributes = [];
            this.tagName = tagName;
            this.outerHtml = '';
            if (oddTagList.indexOf(tagName) === -1) {
                this.children = [];
                this.childNodes = [];
                this.innerHTML = '';
                this.innerText = '';
            }
        }
    };
    toolkit.extend(HtmlBuilder.prototype, {
        refresh: function() {
            this.innerHTML = this.getInnerHtml();
            this.outerHtml = this.getOuterHtml();
            this.innerText = this.getInnerText();
            if (this.parrentNode) {
                this.parrentNode.innerHTML = this.parrentNode.getInnerHtml();
                this.parrentNode.outerHtml = this.parrentNode.getOuterHtml();
                this.parrentNode.innerText = this.parrentNode.getInnerText();
            }
        },
        setAttribute: function(attributes, value) {
            if (toolkit.isString(attributes)) {
                for (var i = 0; i < this.attributes.length; i++) {
                    if (this.attributes[i].name === attributes) {
                        this.attributes[i].value = value;
                        this.refresh();
                        return;
                    }
                }
                var obj = {};
                obj.name = attributes;
                obj.value = value;
                this.attributes.push(obj);
                this.refresh();
                return;
            }
            if (toolkit.isObject(attributes)) {
                for (var i in attributes) {
                    this.attributes.push({
                        name: i,
                        value: attributes[i]
                    })
                }
            }
            this.refresh();
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
            this.refresh();
        },
        removeClass: function(className) {
            if (this.attributes.className === undefined) {
                this.attributes.className = '';
            }
            var reg = new RegExp('(^|\\s+)' + className + '(\\s+|$)');
            if (reg.test(' ' + this.attributes.className + ' ')) {
                this.attributes.className = this.attributes.className.replace(reg, '').replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
            }
            this.refresh();
        },
        appendChild: function(TBDomElement) {
            if (TBDomElement.parrentNode !== this) {
                TBDomElement.parrentNode = this;
                this.childNodes.push(TBDomElement);
                if (TBDomElement.nodeType === 1) {
                    this.children.push(TBDomElement);
                }
            } else {
                var currentNode;
                for (var i = 0; i < this.childNodes.length; i++) {
                    if (TBDomElement === this.childNodes[i]) {
                        this.childNodes.splice(this.childNodes.length - 1, 0, this.childNodes.splice(i, 1));
                    }
                }
                if (TBDomElement.nodeType === 1) {
                    for (var i = 0; i < this.children.length; i++) {
                        if (TBDomElement === this.children[i]) {
                            this.children.splice(this.children.length - 1, 0, this.children.splice(i, 1));
                        }
                    }
                }
            }
            this.refresh();
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
            this.refresh();
        },
        insertBefore: function(TBDomElement, nextElement) {
            var parrentNode = TBDomElement.parrentNode;
            for (var i = 0; i < parrentNode.childNodes.length; i++) {
                if (parrentNode.childNodes[i] === TBDomElement) {
                    parrentNode.childNodes.splice(i, 1);
                    break;
                }
            }
            for (var i = 0; i < parrentNode.children.length; i++) {
                if (parrentNode.children[i] === TBDomElement) {
                    parrentNode.children.splice(i, 1);
                    break;
                }
            }
            TBDomElement.parrentNode = this;
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
            this.refresh();
        },
        getInnerHtml: function() {
            var innerHTML = '';
            for (var i = 0; i < this.childNodes.length; i++) {
                var n = this.childNodes[i];
                var f = n.outerHtml;
                innerHTML += this.childNodes[i].getOuterHtml();
            }
            return innerHTML;
        },
        setInnerHtml: function(arg) {
            var newNodeElements = xmlEngine(arg);
            this.childNodes = [];
            for (var i = 0; i < newNodeElements.childNodes.length; i++) {
                this.appendChild(newNodeElements.childNodes[i]);
            }
            newNodeElements = null;
            this.refresh();
        },
        getOuterHtml: function() {
            if (this.nodeType === 3) {
                return this.innerText;
            }
            var innerHTML = '';
            if (this.parrentNode) {
                innerHTML = '<' + this.tagName;
                var attrbutesList = [];
                for (var i = 0; i < this.attributes.length; i++) {
                    var item = this.attributes[i];
                    var attr = item.name;
                    if (item.value !== null) {
                        if (item.value.indexOf('"') === -1) {
                            attr = attr + '="' + item.value + '"';
                        } else {
                            attr = attr + "='" + item.value + "'";
                        }
                    }
                    attrbutesList.push(attr);
                }
                if (attrbutesList.length) {
                    innerHTML = innerHTML + ' ' + attrbutesList.join(' ');
                }
                innerHTML += '>';
            }

            if (oddTagList.indexOf(this.tagName) === -1) {
                for (var i = 0; i < this.childNodes.length; i++) {
                    innerHTML += this.childNodes[i].getOuterHtml();
                }
                if (this.parrentNode) {
                    innerHTML += '</' + this.tagName + '>';
                }
            }
            return innerHTML;
        },
        getInnerText: function() {
            var text = '';
            if (this.nodeType === 3) {
                text = this.innerText;
            } else {
                for (var i = 0; i < this.childNodes.length; i++) {
                    text += this.childNodes[i].getInnerText();
                }
            }
            return text.replace(/[\n\t\r]/g,'');
        }
    });


    function XMLEngine(text) {
        //text = text.replace(/\s*[\n\t\r]+\s*/g, '');
        var arr = [];
        text.split(/(?!^)(?=<\/?\w+(?:-\w+)*(?:\s+\w+(?:-\w+)*(?:="[^"]*"|='[^']*'|=[^\s>]+)*)*\s*>)/).filter(function(item) {
            arr.push(item);
        });
        var newArr = [];
        arr.filter(function(item) {
            var oldLength = newArr.length;
            item.replace(/(<\/?\w+(?:-\w+)*(?:\s+\w+(?:-\w+)*(?:="[^"]*"|='[^']*'|=[^\s>]+)*)*\s*>)((?:.|\r|\n|\t|\s)*)/, function(str, $1, $2) {
                newArr.push($1);
                $2 && newArr.push($2);
            });
            if (oldLength == newArr.length) {
                newArr.push(item);
            }
        })
        var domTreeArray = [];

        function buildDomTree(parrentNode, arr, i) {
            if (i < arr.length) {
                var item = arr[i];
                var beginTag = /^<([\w\-]+)/.exec(item);
                if (beginTag) {
                    beginTag = beginTag[1];
                    var currentElement = document.createElement(beginTag);
                    var attrbutes = item.match(/\s\w+(-\w+)*(="[^"]*"|='[^']*'|[^\s>]+)*\s*?/g);
                    if (attrbutes) {
                        attrbutes.filter(function(item) {
                            item = toolkit.trim(item);
                            item.replace(/(^\w+(?:-\w+)*)(?:=(.*)$)?/, function(str, $1, $2) {
                                if (!$2) {
                                    $2 = null;
                                } else {
                                    $2 = $2.replace(/^['"]|['"]$/g, '');
                                }
                                currentElement.setAttribute($1, $2);
                            })
                        })
                    }
                    parrentNode.appendChild(currentElement);
                    i++;
                    if (currentElement.childNodes === undefined) {
                        buildDomTree(parrentNode, arr, i);
                    } else {
                        buildDomTree(currentElement, arr, i);
                    }
                    return;
                }
                var closeTag = /^<\/([\w\-]+)/.exec(item);
                if (closeTag) {
                    closeTag = closeTag[1];
                    if (parrentNode.parrentNode) {
                        buildDomTree(parrentNode.parrentNode, arr, ++i);
                    }
                    return;
                }
                var currentElement = document.createTextNode(item);
                parrentNode.appendChild(currentElement);
                buildDomTree(parrentNode, arr, ++i);
            }
        }
        var rootContainer = document.createElement('root-container');
        buildDomTree(rootContainer, newArr, 0);
        console.log(rootContainer);
        console.log(rootContainer.innerHTML);
    }
    module.exports = XMLEngine;
})
