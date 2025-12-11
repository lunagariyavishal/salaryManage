const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Employee",
  new mongoose.Schema({
    name: { type: String, required: true },
    designation: String,
    department: String,

    // FIXED monthly salary (no hourly wage)
    monthlySalary: { type: Number, required: true },
    email: String,
    isActive: { type: Boolean, default: true }
  })
);
