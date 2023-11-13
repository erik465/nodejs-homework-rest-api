const mongoose = require("mongoose");
const process = require("node:process");

function connect(DB_URI, app) {
  const connection = mongoose.connect(DB_URI);

  connection
    .then(() => {
      app.listen(8080, function () {
        console.log("Connection succesfull");
      });
    })
    .catch((err) => {
      console.log(`Server not running. Error message: ${err.message}`);
      process.exit(1);
    });
}

module.exports = connect;
