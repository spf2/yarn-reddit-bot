(function() {
  var htmlparser = require('htmlparser');

  module.exports = function(rawHtml, next) {
    var findFirst = function(node, pred) {
      if (pred(node)) {
        return node;
      }
      if (node.children == null) {
        return null;
      }
      for (var i = 0; i < node.children.length; i++) {
        var it = findFirst(node.children[i], pred);
        if (it != null) {
          return it;
        }
      }
      return null;
    };

    var thumb;
    var handler = new htmlparser.DefaultHandler(function (error, dom) {
        if (error) {
          next(error)
          return
        }
        var img = findFirst(dom[0], function(elt) {
          return elt.type == 'tag' && elt.name == 'img';
        });
        if (img) {
          thumb = img.attribs.src;
        }
    });
    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(rawHtml);
    return thumb;
  }
}());
