/**
 *	版本号： 2.0
 *	时间： 2015年9月28日
 *	作者： 谭波
 *	QQ：	464328895
 *
 **/
/******************
 *
 *************************
 *
 *静态方法：
 *Template.isType	判断数据类型
 *
 *
 *Template.addHandlersMethod(json)	为Template添加默认数据处理方法
 *		json: json对象，key为方法名，value为方法名对应的函数
 *
 *		默认添加了以下方法：
 *			wrap(htmlStr)	如果当前value值为真，则用value替换html字符串是的@content关键字，并返回
 *							最终结果，否则返加空字符串
 *				htmlStr: 	一个html字符串，@content关键字作为占位符
 *			dateFormat(sRequired)	根据sRequired的声明，返回格式化后的时间
 *				sRequired: 	时间格式声明，如：yyyy-MM-dd
 *			getLength		获取当前对象的length
 *
 *
 *************************
 *
 *公有原型方法：
 *
 *
 *this.init(template)	方法用于生成模板字符串解析后的逻辑树，并调用_computed方法返回模板计算后的结果
 *		template: 模板，如不传参数，默认调用this.template
 *
 *
 *this.addHandlersMethod(obj)	方法用于添加Template对象用于处理value的方法
 *		obj: json对象，key为方法名，value为方法名对应的函数
 *
 *
 *this.handlers		json对象，Template对象默认的value处理方法集合
 *
 *
 *私有原型方法：
 *
 *
 *this._computed(ruleTree, data)	方法用于根据业务逻辑，分发计算任务，并最终生成templater的计算结果，返回给init
 *		reluTree: 模板规则树
 *		data: 当前作用域中对数据对象
 *
 *
 *this._replace(str, data)		方法用于抽取模板算术表达式，并调用相关算术表达式的处理方法，最终返回替换后的字符串
 *		str: 模板字符串
 *		data: 当前作用域中对数据对象
 *
 *
 *this._getValue(expression, data)		方法用于返回算术表达式处理后的值
 *		expression: 算术表达式，如：@data.name->dataFormat:[yyyy-MM-dd]->wrap:[<i>@content</>]
 *		data: 当前作用域的数据josn对象
 *
 *
 *this._valueHandler(value, expression, data)	 方法用于返回value处理后的结果
 *		value: 要处理的值
 *		expression: 处理value的方法表达式，如：dataFormat:[yyyy-MM-dd,@data.name]->wrap:[<i>@content</>]
 *		data: 当前作用域的数据josn对象
 *
 *
 *this._createExpressionTree(expression)		方法用于生成初始化算术表达式，并返回四则运算规则树
 *		expression: 算术表达式
 *
 *
 *this._calculator(calculatorTree, data)		方法用于计算四则运算树，并返回四则运算表达式的值
 *		calculatorTree: 已序列化后的四则运算规则树
 *		data: 当前作用域的数据josn对象
 *
 *
 *this._for(ruleTree, data)		方法返回循环语句计算后的字符串
 *		ruleTree: 循环规则树
 *		data: 当前作用域中对数据对象
 *
 *
 *this._if(ruleTree, data)		方法返回判断语句计算后的字符串
 *		ruleTree: 判断规则树
 *		data: 当前作用域中对数据对象
 *
 *
 *this._log(ruleTree, data)		方法用于在控制台打印当前作用域中的数据对象，打印内容为：
 								ruleTree： 当前运算规则树
								data：	当前打印内容的命名空间，方法会取表达式<exp log="@variable"></exp>中，
										 @variable表达式计算后的值，并包含在data对象内，即：data.variable
 *		ruleTree: 判断规则树
 *		data: 当前作用域中对数据对象
 *
 *
 *this._sort(ruleTree, data) 方法用于给数组或字符串排序
 *      ruleTree: 判断规则树
 *		data: 当前作用域中对数据对象
 *
 *
 *
 ****************/
(function(factory, global) {
    //template.js遵循cmd和amd规范
    //此处是做一些兼容处理
    if (typeof define === 'function') {
        if (define.amd) {
            define('Template', [], function() {
                return factory(global);
            })
        } else if (define.cmd) {
            define(function() {
                return factory(global);
            })
        }
    } else {
        factory(global, true);
    }
})(function(window, noGlobal) {

    function Template(obj) {
        obj = obj || {};
        this.data = obj.data || {};
        this.template = obj.template || '';
        this.callback = obj.callback;
        this.dataEmptyHandler = false || obj.dataEmptyHandler;
        if (obj.handlers) {
            this.addHandlersMethod(obj.handlers);
        }
    }

    Template.isType = (function() {
        function isType(type) {
            return function(obj) {
                return {}.toString.call(obj) == "[object " + type + "]"
            }
        }
        return {
            isObject: isType("Object"),
            isString: isType("String"),
            isArray: Array.isArray || isType("Array"),
            isFunction: isType("Function"),
            isUndefined: isType("Undefined")
        }
    })();

    Template.addHandlersMethod = function(obj) {
        for (var name in obj) {
            Template.prototype.handlers[name] = obj[name];
        }
    };

    Template.prototype = {
        constructor: Template,
        init: function(template) {
            template = template || this.template;
            var reg = /(?!^)(?=<\/?exp)/g;
            //去除换行符，并切割语法标签前的内容
            var tempArr = template.replace(/\s*\n\s*/g, '').split(reg);
            var newArr = [];
            var reg2 = /^(<\/?exp(?:\s+\w+\s*=\s*(?:(?:[^>](?!\s))+|['"][^'"]+['"]))?>)(.*)$/;
            //切割语法标签后的内容
            //抽取模板业务逻辑
            for (var i = 0; i < tempArr.length; i++) {
                var current = tempArr[i];
                if (reg2.test(current)) {
                    current.replace(reg2, function($0, $1, $2) {
                        var a = arguments;

                        newArr.push($1);
                        $2 && newArr.push($2);
                    })
                } else {
                    newArr.push(current);
                }
            }

            //构建逻辑树
            function init(arr) {
                var stratIndex;
                for (var i = 0; i < arr.length; i++) {
                    if (Template.isType.isArray(arr[i])) continue;
                    if (/^<exp/.test(arr[i])) {
                        stratIndex = i;
                    } else if (/^<\/exp/.test(arr[i])) {
                        arr.splice(stratIndex, 0, arr.splice(stratIndex, i - stratIndex + 1));
                        init(arr);
                        break;
                    }
                }
            }
            init(newArr);
            var result = this._computed(newArr, this.data);
            if (this.callback) {
                this.callback(result);
            }
            return result;
        },
        _computed: function(ruleTree, data) {
            var _this = this;

            function concat(arr) {

                var result = '';
                if (Template.isType.isArray(arr)) {
                    var firstChild = arr[0];

                    if (Template.isType.isString(firstChild) && /^<exp/.test(firstChild)) {
                        firstChild.replace(/^<exp\s+|>$|['"]/g, '').replace(/^(\w+)\s*=\s*(.+)$/, function($0, $1, $2) {
                            arr.pop();
                            arr.shift();
                            var reg = /^\s+|\s+$/g;
                            $1 = $1.replace(reg, '');
                            $2 = $2.replace(reg, '');
                            switch ($1) {
                                case 'for':
                                    result += _this._for(arr, data, $2);
                                    break;
                                case 'if':
                                    result += _this._if(arr, data, $2);
                                    break;
                                case 'log':
                                    result += _this._log(arr, data, $2);
                                    break;
                                case 'sort':
                                    result += _this._sort(arr, data, $2);
                                    break;
                            }
                        });
                    } else {
                        for (var i = 0; i < arr.length; i++) {
                            if (Template.isType.isArray(arr[i])) {
                                result += concat(arr[i]);
                            } else {
                                result += _this._replace(arr[i], data)
                            }
                        }
                    }
                    return result;
                }
                return _this._replace(arr, data);
            }
            return concat(ruleTree);
        },
        _replace: function(str, data) {
            var _this = this;
            return str.replace(/\{\{([^}]+)\}\}/g, function($0, $1) {
                return _this._calculator(_this._createExpressionTree($1), data);
            });
        },
        _getValue: function(expression, data) {
            //expression: 算术表达式，如@data.name->dataFormat:[yyyy-MM-dd]->wrap:[<i>@content</>]
            //		其中，取值表达式为@data.name，后面为声明处理方法，处理方法为链式调用
            //函数返回通过算术表达式取出的data对象的原始值，如有声明处理方法，则返回处理后的值
            var reg = /^!{0,2}@(\w+(?:\.\w+)*)([^\s]+)?$/;
            var value;
            if (reg.test(expression)) {
                var _this = this;
                expression.replace(reg, function($0, $1, $2) {
                    var isToBoolen = /^!+/.exec($0);
                    var aKey = $1.match(/[^.]+/g);
                    switch ($1) {
                        case 'true':
                            value = true;
                            break;
                        case 'false':
                            value = false;
                            break;
                        case 'undefined':
                            value = undefined;
                            break;
                        default:
                            value = (function(data) {
                                var callee = arguments.callee;
                                switch (data) {
                                    case undefined:
                                    case null:
                                        return _this.dataEmptyHandler ? '' : data;
                                }
                                if (aKey.length) {
                                    if (data[aKey[0]] === undefined) {
                                        if (data._parentObject === undefined) {
                                            if (aKey.length === 1) {
                                                return callee(undefined);
                                            }
                                            throw new Error('表达式：' + $0 + '中，' + aKey[0] + '未定义');
                                        }
                                        return callee(data._parentObject);
                                    }
                                    return callee(data[aKey.shift()]);
                                }
                                return data;
                            })(data);
                    }
                    if (Template.isType.isFunction(value)) {
                        try {
                            value = value();
                        } catch (e) {
                            throw new Error(e);
                        }
                    }
                    if (isToBoolen) {
                        value = isToBoolen[0].length === 1 ? !value : !! value;
                    }
                    if ($2) {
                        value = _this._valueHandler(value, $2.substring(2), data);
                    }
                })
                return value;
            }
            value = Number(expression);
            return isNaN(value) ? expression : value;
        },
        _valueHandler: function(value, expression, data) {
            //value：任意字面量值
            //expression：数据处理方法声明，如：dataFormat:[yyyy-MM-dd,yyyy]->wrap:[<i>@content</>]
            //		方法用->分隔，参数的方法用:分隔，多个参数用,号分隔
            //		方法也可不传参数，如：dataFormat->wrap
            //		参数也可写入取值表达式，但取值表达式不支持传参，如：dataFormat:[@data.user.age]->wrap:[<i>@content</>]
            if (!expression) return value;
            var arr = expression.split(/-(>|gt;)/);
            var _this = this;
            return (function(value) {
                if (!arr.length) return value;
                var callee = arguments.callee;
                var aCurrentHandler = arr.shift().split(':');
                var params = [];
                if (aCurrentHandler[1]) {
                    params = aCurrentHandler[1].replace(/^\[|\]$/g, '').split(',');
                    for (var i = 0; i < params.length; i++) {
                        if (/^@\w+/.test(params[i])) {
                            params[i] = _this._getValue(params[i], data);
                        }
                    }
                }
                params.unshift(value);
                return callee(_this.handlers[aCurrentHandler[0]].apply({}, params));
            })(value);
        },
        _createExpressionTree: function(expression) {
            var arr = expression.replace(/[()]/g, function(str) {
                return str === '(' ? ' ( ' : ' ) ';
            }).replace(/^\s+|\s+$/g, '').split(/\s+/g);
            //构建规则树
            function init(arr) {
                var stratIndex;
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i] === '(') {
                        stratIndex = i;
                    } else if (Template.isType.isString(arr[i]) && /^\)/.test(arr[i])) {
                        var child = arr.splice(stratIndex, i - stratIndex + 1);
                        if (child[0] === '(') {
                            child.shift();
                            var endItem = child.pop();
                            if (endItem !== ')') {
                                child.push(endItem.replace(/^\)-(>|gt;)/, ''));
                            }
                        }
                        arr.splice(stratIndex, 0, child);
                        init(arr);
                        break;
                    }
                }
            }
            init(arr);
            return arr;
        },
        _calculator: function(arg, data) {
            if (Template.isType.isArray(arg)) {
                var result;
                var handlerExpressions;
                if (arg.length % 2 === 0) {
                    handlerExpressions = arg.pop();
                }
                for (var i = 0; i < arg.length; i += 2) {
                    arg[i] = this._calculator(arg[i], data);
                }

                function calculator(operator, prev, next) {
                    switch (operator) {
                        case '*':
                            return prev * next;
                        case '/':
                            return prev / next;
                        case '%':
                            return prev % next;
                        case '+':
                            return prev + next;
                        case '-':
                            return prev - next;
                        case '<':
                            return prev < next;
                        case '<=':
                            return prev <= next;
                        case '>':
                            return prev > next;
                        case '>=':
                            return prev >= next;
                        case '==':
                            return prev == next;
                        case '!=':
                            return prev != next;
                        case '===':
                            return prev === next;
                        case '!==':
                            return prev !== next;
                        case '&&':
                            return prev && next;
                        case '||':
                            return prev || next;
                    }
                }
                for (var i = 1; i < arg.length; i += 2) {
                    switch (arg[i]) {
                        case '*':
                        case '/':
                        case '%':
                            arg.splice(i - 1, 3, calculator(arg[i], arg[i - 1], arg[i + 1]));
                            i -= 2;
                            break;
                    }
                }
                for (var i = 1; i < arg.length; i += 2) {
                    switch (arg[i]) {
                        case '+':
                        case '-':
                            arg.splice(i - 1, 3, calculator(arg[i], arg[i - 1], arg[i + 1]));
                            i -= 2;
                            break;
                    }
                }
                for (var i = 1; i < arg.length; i += 2) {
                    switch (arg[i]) {
                        case '<':
                        case '<=':
                        case '>':
                        case '>=':
                            arg.splice(i - 1, 3, calculator(arg[i], arg[i - 1], arg[i + 1]));
                            i -= 2;
                            break;
                    }
                }
                for (var i = 1; i < arg.length; i += 2) {
                    switch (arg[i]) {
                        case '==':
                        case '!=':
                        case '===':
                        case '!==':
                            arg.splice(i - 1, 3, calculator(arg[i], arg[i - 1], arg[i + 1]));
                            i -= 2;
                            break;
                    }
                }
                for (var i = 1; i < arg.length; i += 2) {
                    switch (arg[i]) {
                        case '&&':
                            arg.splice(i - 1, 3, calculator(arg[i], arg[i - 1], arg[i + 1]));
                            i -= 2;
                            break;
                    }
                }
                for (var i = 1; i < arg.length; i += 2) {
                    switch (arg[i]) {
                        case '||':
                            arg.splice(i - 1, 3, calculator(arg[i], arg[i - 1], arg[i + 1]));
                            i -= 2;
                            break;
                    }
                }
                result = arg[0];
                if (handlerExpressions) {
                    return this._valueHandler(result, handlerExpressions, data);
                }
                //console.log(result)
                return result;
            } else {
                return this._getValue(arg, data);
            }
        },
        _copy: function(obj) {
            function copy(obj) {
                var newObj;
                if (Template.isType.isArray(obj)) {
                    newObj = [];
                    for (var i = 0; i < obj.length; i++) {
                        if (Template.isType.isArray(obj[i]) || Template.isType.isObject(obj[i])) {
                            newObj.push(copy(obj[i]))
                        } else {
                            newObj.push(obj[i]);
                        }
                    }
                } else if (Template.isType.isObject(obj)) {
                    newObj = {};
                    for (var i in obj) {
                        if (Template.isType.isArray(obj[i]) || Template.isType.isObject(obj[i])) {
                            newObj[i] = copy(obj[i]);
                        } else {
                            newObj[i] = obj[i];
                        }
                    }
                }
                return newObj;
            }
            return copy(obj);
        },
        _recordScope: function(data, obj, valueKey, i) {
            var currentObj = {
                _parentObject: data
            };
            switch (valueKey.length) {
                case 2:
                    currentObj[valueKey[0]] = {};
                    currentObj[valueKey[0]][valueKey[1]] = obj;
                    break;
                case 3:
                    currentObj[valueKey[0]] = {};
                    currentObj[valueKey[0]][valueKey[1]] = obj;
                    currentObj[valueKey[0]][valueKey[2]] = i;
            }
            return currentObj;
        },
        _for: function(ruleTree, data, expression) {
            expression = expression.split(/\s+/);
            var obj = this._getValue(expression[2], data);
            var result = '';
            var valueKey = expression[0].match(/[^\[\],]+/g);

            if (Template.isType.isArray(obj)) {
                for (var i = 0; i < obj.length; i++) {
                    result += this._computed(this._copy(ruleTree), this._recordScope(data, obj[i], valueKey, i));
                }
                return result;
            } else if (Template.isType.isString(obj)) {
                for (var i = 0; i < obj.length; i++) {
                    result += this._computed(this._copy(ruleTree), this._recordScope(data, obj.charAt(i), valueKey, i));
                }
                return result;
            } else if (Template.isType.isObject(obj)) {
                for (var i in obj) {
                    result += this._computed(this._copy(ruleTree), this._recordScope(data, obj[i], valueKey, i));
                }
                return result;
            }
            throw new Error(expression[2] + ' 不支持循环操作');
        },
        _if: function(ruleTree, data, expression) {
            var expressionTree = this._createExpressionTree(expression);
            if (this._calculator(expressionTree, data)) {
                return this._computed(ruleTree, data);
            }
            return '';
        },
        _sort: function(ruleTree, data, expression) {
            expression = expression.split(/\s+/);
            var newData = this._copy(data);
            var value = this._getValue(expression.pop(), newData);
            var valueKey = expression[0].match(/[^\[\],]+/g);
            if (Template.isType.isArray(value)) {
                value.sort(function(n, m) {
                    if (expression.length === 3) {
                        switch (expression[1]) {
                            case '<':
                                return n[expression[2]] - m[expression[2]];
                            case '>':
                                return m[expression[2]] - n[expression[2]];
                        }
                    } else {
                        switch (expression[1]) {
                            case '<':
                                return n - m;
                            case '>':
                                return m - n;
                        }
                    }
                });
            } else if (Template.isType.isString(value)) {
                value = value.split('').sort();
                switch (expression[1]) {
                    case '<':
                        return value.join('');
                    case '>':
                        return value.reverse().join('');
                }
            }
            return this._computed(ruleTree, this._recordScope(data, value, valueKey));
        },
        _log: function(ruleTree, data, expression) {
            var oldRuleTree = this._copy(ruleTree);
            ruleTree.pop();
            var expressionTree = this._createExpressionTree(expression);
            var logData = {
                ruleTree: oldRuleTree,
                data: {}
            };
            logData.data[expressionTree[0].substring(1)] = this._calculator(expressionTree, data);
            console.log(logData);
            return '';
        },
        addHandlersMethod: function(obj) {
            for (var name in obj) {
                Template.prototype.handlers[name] = obj[name];
            }
        },
        handlers: {}
    };
    Template.addHandlersMethod({
        wrap: function(value, htmlStr) {
            return value ? htmlStr.replace(/@content/g, value) : value;
        },
        dateFormat: function(timeNo, sRequired) {
            sRequired = sRequired || 'yyyy-MM-dd';

            function toDouble(n) {
                return n > 9 ? '' + n : '0' + n;
            }
            var weekArr = ['日', '一', '二', '三', '四', '五', '六'];
            var oDate = new Date();
            oDate.setTime(timeNo);
            var year = oDate.getFullYear();
            var month = toDouble(oDate.getMonth() + 1);
            var day = toDouble(oDate.getDate());
            var week = weekArr[oDate.getDay()];
            var h = toDouble(oDate.getHours());
            var m = toDouble(oDate.getMinutes());
            var s = toDouble(oDate.getSeconds());
            switch (sRequired) {
                case 'yyyy-MM-dd':
                    return year + '-' + month + '-' + day;
                case 'yyyy':
                    return year;
                case 'MM':
                    return month;
                case 'dd':
                    return day;
                case 'yyyy-MM':
                    return year + '-' + month;
                case 'MM-dd':
                    return month + '-' + day;
                case 'hh:mm:ss':
                    return h + ':' + m + ':' + s;
                case 'hh:mm':
                    return h + ':' + m;
                case 'yyyy-MM-dd hh:mm:ss':
                    return year + '-' + month + '-' + day + ' ' + h + ':' + m + ':' + s;
                case 'yyyy-MM-dd hh:mm':
                    return year + '-' + month + '-' + day + ' ' + h + ':' + m;
            }
        },
        getLength: function(value) {
            return value.length || '';
        }
    })
    if (noGlobal) {
        window.Template = Template;
    }
    return Template;
}, typeof window !== 'undefined' ? window : this)
