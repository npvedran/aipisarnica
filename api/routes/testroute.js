const express = require("express");
const testroute = express.Router();
testroute.use(express.json());

testroute.get("/testroute", function (req, res) {
  res.send(`{"route": "ok"}`);
});

module.exports = testroute;
