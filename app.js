var app = require('express')();
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

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
  
  var getRandomNumber = function () {
    var nmbr = (Math.random() * 100000).toString();
    var final = nmbr.split(".");
    return final[0].toString();
  };
  
  var element = {
    urlId : getRandomNumber(),
    origin : 'http://' + req.body.url
  };
      
  collection.insert(element, function (err, result) {
    if (!err) {
      console.log("Results", result);
      res.send(result);
      req.db.close(function() {
        console.log("Disconnected from Server");
      });
    } else {
      console.log(err);
    }
  });
});

app.get('/:id', initConnection, function (req, res) {
  var collection = req.db.collection('usercollection');
  
  var options = {
    "userId":req.params.id
  };
  
  collection.find(options).toArray(function(err, result) {
    if(!err) {
      console.log(options);
      console.log("Found:", result);
      res.send(result);
      req.db.close(function () {
        console.log("Disconnected from server");
      });
    } else {
      console.log(err);
    }
  });
});
app.listen(process.env.PORT, function () {
  console.log("Running on", process.env.PORT);
});