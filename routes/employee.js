const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// List employees
router.get('/', async (req, res) => {
  const employees = await Employee.find().sort({ name: 1 });
  res.render('employee-list', { employees });
});

// Add employee form
router.get('/create', (req, res) => {
  res.render('employee-create', { employee: {} });
});

// Create employee
router.post('/create', async (req, res) => {
  const { name, designation, department, monthlySalary, email } = req.body;

  await Employee.create({
    name,
    designation,
    department,
    email,
    monthlySalary: Number(monthlySalary),
  });

  res.redirect('/employees');
});

// Edit employee form
router.get('/edit/:id', async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  res.render('employee-create', { employee });
});

// Update employee
router.post('/edit/:id', async (req, res) => {
  const { name, designation, department, monthlySalary, isActive, email } = req.body;

  await Employee.findByIdAndUpdate(req.params.id, {
    name,
    designation,
    department,
    monthlySalary: Number(monthlySalary),
    email,
    isActive: !!isActive,
  });

  res.redirect('/employees');
});

module.exports = router;
