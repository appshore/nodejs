// rewrite code below in ES6
import express from 'express';
import path from 'path';
import fs from 'fs';

import MongoClient from 'mongodb';

import bodyParser from 'body-parser';

let __dirname = path.resolve('src');

let app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.get('/',  (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
  });

app.get('/profile-picture',  (req, res) => {
  let img = fs.readFileSync(path.join(__dirname, "assets/profile-1.jpg"));
  res.writeHead(200, {'Content-Type': 'image/jpg' });
  res.end(img, 'binary');
});

// use when starting application locally

let mongoUrl = process.env.MONGO_URL ? process.env.MONGO_URL : "mongodb://admin:password@127.0.0.1:27017";

// pass these options to mongo client connect request to avoid DeprecationWarning for current Server Discovery and Monitoring engine
let mongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };

// "user-account" in demo with docker. "my-db" in demo with docker-compose
let databaseName = "user-account";

app.post('/update-profile', (req, res) => {
  let userObj = req.body;

  MongoClient.connect(mongoUrl, mongoClientOptions,  (err, client) => {
    if (err) throw err;

    let db = client.db(databaseName);
    userObj['userid'] = 1;

    let myquery = { userid: 1 };
    let newvalues = { $set: userObj };

    db.collection("users").updateOne(myquery, newvalues, {upsert: true}, (err, res) => {
      if (err) throw err;
      client.close();
    });

  });
  // Send response
  res.send(userObj);
});

app.get('/get-profile',  (req, res) => {
  let response = {};
  // Connect to the db
  MongoClient.connect(mongoUrl, mongoClientOptions,  (err, client) => {
    if (err) throw err;

    let db = client.db(databaseName);

    let myquery = { userid: 1 };

    db.collection("users").findOne(myquery,  (err, result) => {
      if (err) throw err;
      response = result;
      client.close();

      // Send response
      res.send(response ? response : {});
    });
  });
});

app.listen(3000,  () => {
  console.log("app listening on port 3000");
});
