const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');

// Load settings page
router.get('/', async (req, res) => {
  let setting = await Setting.findOne();

  // Create default record if missing
  if (!setting) {
    setting = await Setting.create({
      title: "My Company",
      address: "Company Address Here"
    });
  }

  res.render('settings', { setting });
});

// Update settings
router.post('/', async (req, res) => {
  const { title, address } = req.body;
  let setting = await Setting.findOne();

  if (!setting) {
    await Setting.create({ title, address });
  } else {
    setting.title = title;
    setting.address = address;
    await setting.save();
  }

  res.redirect('/settings');
});

module.exports = router;
