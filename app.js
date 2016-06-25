var app = require('express')();
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

app.get('/favicon.ico', function (req, res) {
  res.sendFile(__dirname + "/favicon.ico");
});

app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/html/index.html');
});

function initConnection(req, res, next) {
  //res.user = "id: 12345" + req.params.id;
  var url = 'mongodb://' + process.env.IP + ':27017/urls';
  
  MongoClient.connect(url, function (err, db) {
    if (err) {
      //Errors given
      return console.log("Error:",err);
    } else {
      //Connected
      console.log("Connected to MongoDB");
      
      req.db = db;
      next();
    }
  });
  //next();
}

app.post('/create', initConnection, function (req, res) {
  //res.send(res.user);
  var collection = req.db.collection('usercollection');
  
  function getRandomNumber()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

  var validate = function (url) {
    if (url.substr(0, 7) == "http://" || url.substring(0, 8) == "https://") {
      return url;
    } else {
      return "https://" + url;
    }
  };
  
  var url = validate(req.body.url);
  
  var element = {
    urlId : getRandomNumber(),
    origin : url
  };
      
  collection.insert(element, function (err, result) {
    if (!err) {
      res.send(result);
      req.db.close(function() {
        console.log("Disconnected from Server (insert)");
      });
    } else {
      console.log(err);
    }
  });
});

app.get('/:id', initConnection, function (req, res) {
  var collection = req.db.collection('usercollection');
  
  var options = {
    "urlId":req.params.id
  };
  
  collection.find(options).toArray(function(err, result) {
    if(!err) {
      if (!result.length < 1) {
        
        res.redirect(result[0].origin);
      } else {
        console.log("No URL found");
        res.send("Error: No URL found. Please check, if you have the right URL.");
      }
      
      req.db.close(function () {
        console.log("Disconnected from server (query)");
      });
      
    } else {
      console.log(err);
    }
  });
});

app.listen(process.env.PORT, function () {
  console.log("Running on", process.env.PORT);
});