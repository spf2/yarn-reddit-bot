(function() {

  module.exports = function(req, res, next) {
    var submission = req.body.submission;
    var option;
    for (var i = 0; i < submission.form.items[0].select.options.length; i++) {
      if (submission.form.items[0].select.options[i].selected) {
        option = submission.form.items[0].select.options[i];
        break;
      }
    }
    if (!option) {
      next(new Error("no option selected"));
      return
    }
    var message = {
      'text': option.name + ' ' + option.value,
      'media_items': [option.media],
    }
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      'message': message,
      'all_participants': true,
    }, 0, 2));
  }

}());
