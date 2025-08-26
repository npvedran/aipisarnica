const express = require("express");
const utils = require("../utils.js");

const emails = express.Router();
emails.use(express.json());

emails.get("/emails/:account", function (req, res) {
  const account = req.params.account;
  con.query(
    `SELECT * FROM emails WHERE account='${account}' ORDER BY created`,
    (err, result) => {
      utils.handleGetMany(req, res, err, result);
    }
  );
});

emails.get("/email/:id", function (req, res) {
  const id = req.params.id;
  con.query(`SELECT * FROM emails WHERE id='${id}'`, (err, result) => {
    utils.handleGetMany(req, res, err, result);
  });
});

emails.get("/docs/:account", function (req, res) {
  const account = req.params.account;
  con.query(
    `SELECT * FROM docs WHERE account='${account}' ORDER BY created`,
    (err, result) => {
      utils.handleGetMany(req, res, err, result);
    }
  );
});

module.exports = emails;
