const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors());

global.mysql = require("mysql")
global.con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "***",
  database: "repo"
});

const { json } = require("body-parser");

const testroute = require("./routes/testroute.js");
app.use(testroute);

const em = require("./routes/emails.js");
app.use(em);

app.get(/(.*)/, (req, res) => {
  res.send("404 Page Not Found");
});

/**********************/

app.listen(3001, () => {
  console.log("App listening on port 3001");
});
