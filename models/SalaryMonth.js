const mongoose = require("mongoose");

module.exports = mongoose.model(
  "SalaryMonth",
  new mongoose.Schema({
    monthISO: { type: String, required: true },   // Format "2025-12"
    monthName: String,                            // December
    year: Number,                                 // 2025

    totalDays: Number,                            // 31
    workingDays: Number,                          // 25
    totalWorkingHours: Number,                    // workingDays × 8

    createdAt: { type: Date, default: Date.now }
  })
);
