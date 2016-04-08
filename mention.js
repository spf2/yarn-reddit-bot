(function() {
  var feedParser = require('feedparser');
  var request = require('request');
  var thumb = require('./thumb');

  module.exports = function(req, res, next) {
    var mention = req.body.mention;
    var subreddit = mention.message.text.replace(/@reddit/, '').replace(/\W+/g, '').trim();
    var form = {
      'action': 'message',
      'label': 'Reddit r/' + subreddit,
      'items' : [{'select': {'options': []}}],
    };
    if (mention.thread) {
      form['thread_id'] = mention.thread.thread_id;
    }
    var redditReq = request("http://www.reddit.com/r/" + subreddit + "/.rss");
    redditReq.on('error', function(error) {
      next(error);
    });

    var parser = new feedParser();
    parser.on('error', function(error) {
      next(error);
    });

    redditReq.on('response', function(rssRes) {
      if (rssRes.statusCode != 200) {
        next(new Error(rssRes.statusCode));
      }
      this.pipe(parser);
    });

    parser.on('readable', function() {
      var item;
      while (item = this.read()) {
        if (form.items[0].select.options.length == 10) {
          continue
        }
        form.items[0].select.options.push({
          'name': item.title,
          'value': item.link,
          'media': { 'url': thumb(item.description, next) },
        });
      }
    });

    parser.on('end', function() {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({'form': form}, 0, 2));
    });
  }
}());
