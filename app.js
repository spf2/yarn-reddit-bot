var connect = require('connect');
var app = connect();

var bodyParser = require('body-parser');
app.use(bodyParser.json());

var mention = require('./mention');
var submission = require('./submission');

app.use(function interpretInvocation(req, res, next) {
  if (req.body.mention) {
    mention(req, res, next)
    return
  }

  if (req.body.submission) {
    submission(req, res, next)
    return
  }
});

var http = require('http');
http.createServer(app).listen(3000);
