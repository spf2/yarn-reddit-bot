(function() {
  var feedParser = require('feedparser');
  var request = require('request');
  var thumb = require('./thumb');

  module.exports = function(req, res, next) {
    var mention = req.body.mention;
    if (!mention.message.text.startsWith('@')) {
      next();
      return;
    }
    var subreddit = mention.message.text.replace(/@reddit/, '').replace(/\W+/g, '').trim();
    var form = {
      'action': 'message',
      'label': 'Reddit r/' + subreddit,
      'items' : [{
        'select': {
          'label': 'Pick one to share with the thread',
          'options': [],
        },
      }],
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
          continue;
        }
        var mobileUrl = item.link.replace(/www\.reddit\.com/, 'm.reddit.com');
        var mediaUrl = thumb(item.description, next);
        if (!mediaUrl) {
          continue;
        }
        form.items[0].select.options.push({
          'name': item.title,
          'value': mobileUrl,
          'media': { 'url':  mediaUrl },
        });
      }
    });

    parser.on('end', function() {
      res.setHeader('Content-Type', 'application/json');
      if (form.items[0].select.options.length == 0) {
        var msg = {'text': "Not a subreddit. Try @reddit aww (or funny or gifs or ...)"}
        res.end(JSON.stringify({'message': msg}))
      } else {
        res.end(JSON.stringify({'form': form}));
      }
    });
  }
}());
