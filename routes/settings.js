const express = require("express");
const router = express.Router();
const multer = require("multer");
const Setting = require("../models/Setting");
const path = require("path");

// STORAGE CONFIG
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "public/uploads/signatures");
  },
  filename: function(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, "signature" + Date.now() + ext);
  }
});
const upload = multer({ storage });

// ---------------- VIEW SETTINGS PAGE ----------------
router.get("/", async (req, res) => {
  let setting = await Setting.findOne();
  res.render("settings", { setting });
});

// ---------------- UPDATE SETTINGS ----------------
router.post("/", upload.single("signature"), async (req, res) => {
  let setting = await Setting.findOne();

  if (!setting) {
    setting = new Setting();
  }

  setting.title = req.body.title;
  setting.address = req.body.address;
  setting.email = req.body.email;

  if (req.file) {
    setting.signaturePath = "/uploads/signatures/" + req.file.filename;
  }

  await setting.save();
  res.redirect("/settings");
});

module.exports = router;
