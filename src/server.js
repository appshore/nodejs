// rewrite code below in ES6
import express from "express";
import path from "path";
import fs from "fs";

import MongoClient from "mongodb";

import bodyParser from "body-parser";

import * as kafka from "./kafka.js";

let __dirname = path.resolve("src");

let app = express();

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/profile-picture", (req, res) => {
  let img = fs.readFileSync(path.join(__dirname, "assets/profile-1.jpg"));
  res.writeHead(200, { "Content-Type": "image/jpg" });
  res.end(img, "binary");
});

let mongoUrl = process.env.MONGO_URL
  ? process.env.MONGO_URL
  : "mongodb://admin:password@127.0.0.1:27017";

// pass these options to mongo client connect request to avoid DeprecationWarning for current Server Discovery and Monitoring engine
let mongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };

let databaseName = process.env.MONGO_DATABASE;

app.post("/update-profile", (req, res) => {
  let userObj = req.body;

  MongoClient.connect(mongoUrl, mongoClientOptions, (err, client) => {
    if (err) throw err;

    let db = client.db(databaseName);
    userObj["userid"] = 1;

    let myquery = { userid: 1 };
    let newvalues = { $set: userObj };

    db.collection("users").updateOne(
      myquery,
      newvalues,
      { upsert: true },
      (err, res) => {
        if (err) throw err;
        client.close();

        kafka.produce("update", "users", userObj);
      }
    );
  });

  res.send(userObj);
});

app.get("/get-profile", (req, res) => {
  MongoClient.connect(mongoUrl, mongoClientOptions, (err, client) => {
    if (err) throw err;

    let db = client.db(databaseName);

    let myquery = { userid: 1 };

    db.collection("users").findOne(myquery, (err, result) => {
      if (err) throw err;
      client.close();

      res.send(result ?? {});
    });
  });
});

app.listen(process.env.EXPRESS_PORT, () => {
  console.log(`app listening on port ${process.env.EXPRESS_PORT}`);
});
