template 模板引擎文档
=========================
参数说明：
-------------------------
1.在new Template时，需传入一个参数，参数为json对象  

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
var newTemplate = new Template('这里需要传入参数，dome不在重复写');
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
*  `{{(@data.number && @data.size}}`  
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
*  `<@if @true>这里是判断为真输出的内容</@if>` 判断语句  


