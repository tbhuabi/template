template2.0 模板引擎文档
=========================
template.js遵循amd和cmd规范，如果你的项目中有使用requirejs或seajs，可在页面中直接引用  

2.0更新说明：
-------------------------
由于在实际使用中，发现如：`<@for></@for>`这样的语法，不支持html压缩，且IDE格式化代码时会错乱，故更改模板语法如下：  
所有1.0版本中用到`<@XXX></@XXX>`类似的标签，全部更改为`<exp XX="表达式"></exp>`这种形式，其它在1.0版本中用到的语法，还是照旧，如你在使用1.0版本，语法可参考[demo_old.html](https://github.com/18616392776/template/blob/master/template/demo_old.html)，或直接与我联系。  
附上1.0js文件地址：[template_old.js](https://github.com/18616392776/template/blob/master/template/js/template_old.js)。


参数说明：
-------------------------
在new Template时，需传入一个参数，参数为json对象   
如在阅读文档时有任何疑问，可参考[demo.html](https://github.com/18616392776/template/blob/master/template/demo.html)，或直接与我联系：  
QQ: 464328895  


```javascript 
var newTemplate = new Template({  
    template: '一段模板字符串',  
    data: {  
        '你的命名空间': 'json数据对象',  
        '你还可以有多个命名空间': '另一个json数据对象'  
    },  
    handlers: {  
        '你的方法名': function(value){  
            //value始终都是模板引擎计算出来的原值  
            //你还可以传更多的自定义参数  
        }  
    },
    dataEmptyHandler: false, //如果计算出来的值为undefind/null,是否要转换为空字符串，默认为false，请在项目上线时设置为true，开发过程中默认就好，便于调试
    callback: function(computedText){
        //computedText为计算后的模板字符串
    }
});
```
方法说明：
---------------
####静态方法：
```javascript
Template.addHandlersMethod({
    '你的方法名': function(value){
        //value始终都是模板引擎计算出来的原值  
        //你还可以传更多的自定义参数  
    }
})

```
用于给Template添加用于处理模板中声明的value处理方法，传入函数第一个参数永远是当前表达式计算出来的值  
默认方法有：wrap、dateFormat、getLength

####原型方法：

```javascript
var newTemplate = new Template('这里需要传入参数，demo不在重复写');
newTemplate.addHandlersMethod({
    '你的方法名': function(value){
        //这个和上面的静态方法功能是一样的
        //如果需在要模板中使用你自定义的方法，请在init之前调用
    }
});
var computedText = newTemplte.init(template);
//computedText为模板计算后的字符串，调用init会启动模板引擎开始计算，并返回计算后的值
//如果在实例化时有传入callback，也会调用callback，并把计算后的结果传给callback的第一个参数
//template参数为一个模板字符串，如果不传，则调用Template引擎实例化时传入的template
//也就是说，可以根据同一个json数据对象，传入不同的模板，解析出不同的结果，这在做表格排序等后台管理平台是非常有用的
```
语法说明：
-------------------
####表达式语法
*  `{{@data}}`  
    取当前命名空间为data的值   
        
*  `{{@data.list.0}}`  
    取当前命名空间为data的list属性的第0个 
        
*  `{{@data.timeNumber->dateFormat}}`  
    取当前命名空间为data的timeNumber属性，并调用dateFormat方法返回处理结果
        
*  `{{@data.timeNumber->dateFormat:[yyyy-MM-dd]}}`  
    取当前命名空间为data的timeNumber并调用dateFormat方法按yyyy-MM-dd格式返回处理结果，当前传入的参数始终从方法的第二个参数开始，第一个参数永远都为当前表达式的value   
        
*  `{{@data.timeNumber->你自定义的方法:[@data.age]}}`  
    取当前命名空间为data的timeNumber，并调用你自定义的方法，且传入data.age的值  
        
*  `{{@data.timeNumber->你自定义的方法:[@data.age,@data.size]}}`  
    取当前命名空间为data的timeNumber，并调用你自定义的方法，且传入多个值   
        
*  `{{@data.timeNumber->dateFormat:[yyyy-MM-dd]->wrap:[<div>@content</div>]}}`   
    取当前命名空间的data属性的timeNumber并调用dateFormat方法按yyyy-MM-dd格式返回处理结果，再把处理结果放在一对div标签中    
        
*  `{{1 + 2}}`  
    四则运算  
        
*  `{{@data.number + 3}}`  
    包含表达式的四则运算  
        
*  `{{(@data.number + 3) * 5 + @data.size % (2 - 6)}}`  
    更复杂的四则运算
        
*  `{{@data.number && @data.size}}`  
    逻辑运算，逻辑运算只输出true/false，一般用在if语句中 
        
*  `{{@true}}`  
    取真     
        
*  `{{@false}}`  
    取假  
        
*  `{{@undefined}}`  
    取undefined  
        
*  `{{!@undefined}}`  
    取反 
        
*  `{{(@data.number && @data.list->getLength || 1 > @data.age || @false}}`  
    更复杂的逻辑运算 
        
*  `{{(@data.number + 3 >= 5 * (@data.size + 3)}}`  
    更复杂的逻辑运算   
        
*  `{{(@data.number + 3 >= 5 * (@data.size + 3)}}`  
    更复杂的逻辑运算  
        
    
####标签语法：
#####if
判断语句 
```html
<exp if="@true">
    这里是判断为真输出的内容
</exp>
```

更复杂的判断语句
```html
<exp if="@true \&\& @data.size >= 5">
    这里是判断为真输出的内容
</exp>
```  
    
更复杂的判断语句
```html
<exp if="@true \&\& @data.size >= 5 || @data.name === 张三 \&\& (1 + 3) % @data.size == 0">
    这里是判断为真输出的内容
</exp>
```  
    
#####for
 for循环语句的中文示例
```html
<exp for="命名空间[每一项的值,当前循环的索引] in @data.list">
    这里是循环输出的内容,序号：{{命名空间.当前循环的索引}}，对应的值：{{命名空间.每一项的值}}
</exp>
```
    
for循环语句
```html
<exp for="variable[valueName,valueIndex] in @data.list">
    这里是循环输出的内容，序号：{{varible.valueIndex}}，对应值：{{variable.valueName}}
</exp>
```
   
如果不需要索引还可以这么写
```html
<exp for="variable[valueName] in @data.list">
    这里是循环输出的内容
</exp>
```
    
#####sort
sort排序的中文示例
```html
<exp sort="命名空间[排序后的值] 排序方法 是否根据某个值进行排序 @data.list">
    这里不会输出内容，可以在这里嵌套语句或字符串来输出内容，就像我一样
</exp>
```
    
根据data.list的size的值从大到小排序，并储存在varibel的newData属性中
```html
<exp sort="variable[newData] > size @data.list">
    这里不会输出内容，可以在这里嵌套语句或字符串来输出内容，就像我一样
</exp>
```
    
直接从小到大排序data.list，并储存在varible的newData属性中
```html
<exp sort="variable[newData] < @data.list">
    这里不会输出内容，可以在这里嵌套语句或字符串来输出内容，就像我一样
</exp>
```
    
#####log
把data.list的值打印在控制台中，要注意的是：真正的值是放在打印出来的对象的data属性下面
```html
<exp log="@data.list">这里永远不会输出内容</exp>
```
    
    
####总结如下：
1.  运算符用空格隔开，支持四则运算，取模，和逻辑运算
2.  函数参数也可用@取值，但不支持运算，参数之间用逗号隔开
3.  for和sort有命名空间语法，需注意书写

####常见bug：
*  如果你把模板放在放在某个html元素中，并取这个元素的innerHTML属性，并传入Template引擎，会导致引擎报错，因为浏览器在解析html时，不能识别如：`<@for></@for>`、`<@log></@log>`等等模板语法，那么浏览器会自动尝试转义，最终你取出来的html字符串，不能通过Template引擎正则的匹配  
    建议这样写：
```html
<script type="text/template" id="template">
    <div>
        {{@data.type}}
        <exp for="variable[valueKey,indexKey] in @data.list">
            这是是循环输出的内容
        </exp>
    </div>
</script>
<script>
    var template = document.getElementById('template').innerHTML;
    var newTemplate = new Template({
        template: template
    });
</script>
```
*  你也可以在模板中嵌入`<exp log="@data.list"></exp>`来在控制台打印出当前的数据内容，并查找错误。

