const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Salary",
  new mongoose.Schema({
    // Relations
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true
    },
    monthId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalaryMonth",
      required: true
    },

    // Salary snapshot (so old slips don’t change)
    monthlySalary: Number,

    // Attendance
    presentDays: Number,
    leaveDays: Number,
    workingHours: Number,   // actual employee hours (optional)

    // Overtime
    otHours: Number,
    otRate: Number,
    otAmount: Number,

    // Earnings
    bonus: { type: Number, default: 0 },
    allowance: { type: Number, default: 0 },

    // Advance
    advance: { type: Number, default: 0 },
    advanceNote: String,

    // Other Deductions
    otherDeductions: { type: Number, default: 0 },

    // Computed totals
    totalDeductions: Number,
    netSalary: Number,

    createdAt: { type: Date, default: Date.now }
  })
);
