define(function(require, exports, module) {
    var document = require('./document');
    var toolkit = require('./toolkit');

    function XMLEngine(text) {
        text = text.replace(/\s*[\n\t\r]+\s*/g, '');
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

        function buildDomTree(parentNode, arr, i) {
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
                    parentNode.appendChild(currentElement);
                    currentElement.parentNode = parentNode;
                    i++;
                    if (currentElement.childNodes === undefined) {
                        buildDomTree(parentNode, arr, i);
                    } else {
                        buildDomTree(currentElement, arr, i);
                    }
                    return;
                }
                var closeTag = /^<\/([\w\-]+)/.exec(item);
                if (closeTag) {
                    closeTag = closeTag[1];
                    if (parentNode.parentNode) {
                        buildDomTree(parentNode.parentNode, arr, ++i);
                    }
                    return;
                }
                var currentElement = document.createElement('');
                currentElement.parentNode = parentNode;
                parentNode.appendChild(currentElement);
                buildDomTree(parentNode, arr, ++i);
            }
        }
        var rootContainer = document.createElement('root-container');
        buildDomTree(rootContainer, newArr, 0);
        console.log(rootContainer);
    }
    module.exports = XMLEngine;
})
