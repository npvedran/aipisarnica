const express = require("express");
const em = require("./routes/emails.js");
const { mySql } = require("./config.js");

const app = express();

const cors = require("cors");
app.use(cors());

global.mysql = require("mysql")
global.con = mysql.createConnection(mySql);

const { json } = require("body-parser");

const testroute = require("./routes/testroute.js");
app.use(testroute);

app.use(em);

app.get(/(.*)/, (req, res) => {
  res.send("404 Page Not Found");
});

/**********************/

app.listen(3001, () => {
  console.log("App listening on port 3001");
});
