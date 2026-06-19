const express = require('express');
const router = express.Router();
const SalaryMonth = require('../models/SalaryMonth');

// Month list
router.get('/', async (req, res) => {
  const months = await SalaryMonth.find().sort({ monthISO: -1 });
  res.render('month-list', { months });
});

// Create month page
router.get('/create', (req, res) => {
  res.render('month-create');
});

// Save month
router.post('/create', async (req, res) => {
  const { month, year, totalDays, workingDays, workingHoursPerDay } = req.body;

  if (!month || !year) {
    return res.send("Please select both month and year.");
  }

  const monthISO = `${year}-${month}`;
  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

  const hpd = Number(workingHoursPerDay) || 8.5;
  const totalWorkingHours = Number(workingDays) * hpd;

  await SalaryMonth.create({
    monthISO,
    monthName,
    year: Number(year),
    totalDays: Number(totalDays),
    workingDays: Number(workingDays),
    workingHoursPerDay: hpd,
    totalWorkingHours,
  });


  res.redirect('/months');
});

module.exports = router;
