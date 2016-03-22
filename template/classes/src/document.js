define(function(require, exports, module) {
    var toolkit = require('./toolkit');
    var HtmlBuilder = require('./htmlBuilder');

    function Document() {

    }
    toolkit.extend(Document.prototype, {
        createElement: function(tag) {
            return new HtmlBuilder(tag);
        }
    });
    module.exports = new Document();
})
