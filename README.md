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
