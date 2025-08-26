const uuid = require("uuid");

module.exports = {
  getUUID() {
    var id = uuid.v4().substring(24, 36);
    return id;
  },
  handleGetMany(req, res, err, result) {
    if (err) {
      console.log(err);
      res.send(`{"message": "${err.toString()}"}`);
    } else {
      const filters = req.query;
      const filteredItems = result.filter((t) => {
        let isValid = true;
        for (key in filters) {
          isValid = isValid && t[key] == filters[key];
        }
        return isValid;
      });
      res.send(filteredItems);
    }
  },
  handleSetByID(req, res, err, id) {
    if (err) {
      console.log(err);
      res.send(`{"message": "${err.toString()}"}`);
    } else res.send(`{"id": "${id}"}`);
  },
  handleSetByResult(req, res, err, result) {
    if (err) {
      console.log(err);
      res.send(`{"message": "${err.toString()}"}`);
    } else res.send(result);
  },
};
