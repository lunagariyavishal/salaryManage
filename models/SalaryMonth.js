const mongoose = require("mongoose");

module.exports = mongoose.model(
  "SalaryMonth",
  new mongoose.Schema({
    monthISO: { type: String, required: true },   // Format "2025-12"
    monthName: String,                            // December
    year: Number,                                 // 2025

    totalDays: Number,                            // 31
    workingDays: Number,                          // 25
    workingHoursPerDay: { type: Number, default: 8.5 }, // 8 / 8.5 / 9 / 9.5
    totalWorkingHours: Number,                    // workingDays × workingHoursPerDay

    createdAt: { type: Date, default: Date.now }
  })
);
