const express = require('express');
const router = express.Router();
const Salary = require('../models/Salary');
const Employee = require('../models/Employee');
const SalaryMonth = require('../models/SalaryMonth');
const Setting = require('../models/Setting');
const nodemailer = require("nodemailer");
const pdf = require('html-pdf');
const path = require('path');
const ejs = require('ejs');

// -----------------------------
// CREATE SALARY PAGE
// -----------------------------
router.get('/create/:monthId', async (req, res) => {
  const month = await SalaryMonth.findById(req.params.monthId);
  const employees = await Employee.find({ isActive: true }).sort({ name: 1 });
  res.render('salary-create', { employees, month });
});

// -----------------------------
// SAVE SALARY ENTRY
// -----------------------------
router.post('/create/:monthId', async (req, res) => {
  const month = await SalaryMonth.findById(req.params.monthId);
  const emp = await Employee.findById(req.body.employeeId);

  const monthlySalary = Number(emp.monthlySalary);
  const workingHours = Number(req.body.workingHours || 0); // employee actual hours

  // Total required hours in month
  const totalWorkingHours = month.workingDays * 8;

  // Hour-based leave
  const absentHours = Math.max(0, totalWorkingHours - workingHours);
  const leaveDays = absentHours / 8;

  // Earnings
  const otHours = Number(req.body.otHours || 0);
  const otRate = Number(req.body.otRate || 0);
  const otAmount = otHours * otRate;

  const bonus = Number(req.body.bonus || 0);
  const allowance = Number(req.body.allowance || 0);

  // Deductions
  const perDay = monthlySalary / month.totalDays;
  const leaveDeduction = Math.round(perDay * leaveDays);

  const advance = Number(req.body.advance || 0);
  const advanceNote = req.body.advanceNote || "";

  const otherDeductions = Number(req.body.otherDeductions || 0);

  const totalDeductions =
    leaveDeduction + advance + otherDeductions;

  const netSalary =
    monthlySalary + otAmount + bonus + allowance - totalDeductions;

  await Salary.create({
    employeeId: emp._id,
    monthId: month._id,
    monthlySalary,
    workingHours,
    absentHours,
    leaveDays,
    otHours,
    otRate,
    otAmount,
    bonus,
    allowance,
    advance,
    advanceNote,
    otherDeductions,
    totalDeductions,
    netSalary
  });

  res.redirect('/salary/list/' + month._id);
});


// -----------------------------
// LIST SALARIES FOR MONTH
// -----------------------------
router.get('/list/:monthId', async (req, res) => {
  const month = await SalaryMonth.findById(req.params.monthId);
  const salaries = await Salary.find({ monthId: month._id })
    .populate("employeeId")
    .sort({ createdAt: -1 });

  res.render("salary-list", { month, salaries });
});

// -----------------------------
// EDIT SALARY
// -----------------------------
router.get('/edit/:id', async (req, res) => {
  const salary = await Salary.findById(req.params.id).populate("employeeId");
  const month = await SalaryMonth.findById(salary.monthId);
  res.render("salary-edit", { salary, month });
});

router.post('/edit/:id', async (req, res) => {
  const salary = await Salary.findById(req.params.id);
  const month = await SalaryMonth.findById(salary.monthId);

  const monthlySalary = Number(req.body.monthlySalary);
  const workingHours = Number(req.body.workingHours || 0);

  // Required hours
  const requiredHours = month.workingDays * 8;

  const absentHours = Math.max(0, requiredHours - workingHours);
  const leaveDays = absentHours / 8;

  const perDaySalary = monthlySalary / month.totalDays;
  const leaveDeduction = perDaySalary * leaveDays;

  // OT
  const otHours = Number(req.body.otHours || 0);
  const otRate = Number(req.body.otRate || 0);
  const otAmount = otHours * otRate;

  // Earnings
  const bonus = Number(req.body.bonus || 0);
  const allowance = Number(req.body.allowance || 0);

  // Deductions
  const advance = Number(req.body.advance || 0);
  const advanceNote = req.body.advanceNote || "";
  const otherDeductions = Number(req.body.otherDeductions || 0);

  const totalDeductions = leaveDeduction + advance + otherDeductions;

  const netSalary =
    monthlySalary + otAmount + bonus + allowance - totalDeductions;

  // Save
  salary.monthlySalary = monthlySalary;
  salary.workingHours = workingHours;
  salary.absentHours = absentHours;
  salary.leaveDays = leaveDays;

  salary.otHours = otHours;
  salary.otRate = otRate;
  salary.otAmount = otAmount;

  salary.bonus = bonus;
  salary.allowance = allowance;

  salary.advance = advance;
  salary.advanceNote = advanceNote;
  salary.otherDeductions = otherDeductions;

  salary.totalDeductions = totalDeductions;
  salary.netSalary = netSalary;

  await salary.save();

  res.redirect(`/salary/list/${month._id}`);
});


// -----------------------------
// VIEW SALARY SLIP (HTML)
// -----------------------------
router.get('/slip/:id', async (req, res) => {
  const salary = await Salary.findById(req.params.id).populate("employeeId");
  const month = await SalaryMonth.findById(salary.monthId);
  const setting = await Setting.findOne();

  res.render("salary-slip", {
    salary,
    month,
    employee: salary.employeeId,
    setting,
  });
});

// -----------------------------
// PDF DOWNLOAD
// -----------------------------
router.get('/slip/:id/pdf', async (req, res) => {
  const salary = await Salary.findById(req.params.id).populate("employeeId");
  const month = await SalaryMonth.findById(salary.monthId);
  const setting = await Setting.findOne();

  const file = path.join(__dirname, "..", "views", "salary-slip-pdf.ejs");

  ejs.renderFile(
    file,
    { salary, month, employee: salary.employeeId, setting },
    {},
    (err, html) => {
      if (err) return res.status(500).send(err.toString());

      pdf.create(html, { format: "A4" }).toBuffer((err, buffer) => {
        if (err) return res.status(500).send(err.toString());
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=salary-slip-${salary._id}.pdf`
        );
        res.send(buffer);
      });
    }
  );
});

router.get("/slip/:id/email", async (req, res) => {
  const salary = await Salary.findById(req.params.id).populate("employeeId");
  const month = await SalaryMonth.findById(salary.monthId);
  const setting = await Setting.findOne();

  if (!salary.employeeId.email) {
    return res.send("Employee email not found.");
  }

  // Render PDF HTML
  const file = path.join(__dirname, "..", "views", "salary-slip-pdf.ejs");

  ejs.renderFile(
    file,
    { salary, month, employee: salary.employeeId, setting },
    {},
    async (err, html) => {
      if (err) return res.send("Template error: " + err);

      pdf.create(html, { format: "A4" }).toBuffer(async (err, buffer) => {
        if (err) return res.send("PDF error: " + err);

        // Create Email Transport
        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
          }
        });

        await transporter.sendMail({
          from: `"${setting.title}" <${process.env.MAIL_USER}>`,
          to: salary.employeeId.email,        // ← send to employee
          subject: `Salary Slip - ${month.monthName} ${month.year}`,
          text: "Please find attached your salary slip.",
          attachments: [
            {
              filename: `salary-slip-${month.monthName}-${month.year}.pdf`,
              content: buffer
            }
          ]
        });

        res.send("Salary slip emailed successfully!");
      });
    }
  );
});


module.exports = router;
