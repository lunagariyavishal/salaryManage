const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Setting",
  new mongoose.Schema({
    title: String,   // Company name
    address: String  // Printed in slip
  })
);
